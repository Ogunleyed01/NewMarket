import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const configuredJwtSecret = process.env.JWT_SECRET;
const isValidJwtSecret = typeof configuredJwtSecret === 'string' && configuredJwtSecret.length >= 32;
const JWT_SECRET = isValidJwtSecret
  ? configuredJwtSecret
  : process.env.NODE_ENV === 'production'
    ? null
    : crypto.randomBytes(32).toString('hex');
const SERVICE_FEE = 500;
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&auto=format&fit=crop&q=80';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
}
if (!isValidJwtSecret) {
  console.warn('JWT_SECRET is not configured; using a temporary development secret. Set JWT_SECRET in .env to keep sessions across restarts.');
}

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function isCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/[^:]+:[^@]+@([^/]+)/)?.[1];
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/([^:]+):/)?.[1];
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/[^:]+:([^@]+)/)?.[1];

  if (!cloudName || !apiKey || !apiSecret) return false;
  if (
    cloudName.startsWith('replace-with') ||
    apiKey.startsWith('replace-with') ||
    apiSecret.startsWith('replace-with')
  ) {
    return false;
  }
  return true;
}

function isPaystackConfigured() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || typeof key !== 'string') return false;
  if (key.startsWith('sk_test_replace_with') || key.startsWith('replace-with')) return false;
  return true;
}

if (isCloudinaryConfigured()) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/[^:]+:[^@]+@([^/]+)/)?.[1];
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/([^:]+):/)?.[1];
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/[^:]+:([^@]+)/)?.[1];

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

app.use(cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://newmarket-blush.vercel.app',
  ],
  credentials: true,
}));
app.use('/uploads', express.static(uploadsDir));

app.get('/', (_req, res) => {
  res.json({
    name: 'NewMarket API',
    status: 'running',
    frontend: FRONTEND_URL,
    health: '/api/v1/health',
  });
});

function safeUser(user) {
  const { passwordHash, ...publicUser } = user;
  return { ...publicUser, avatar: DEFAULT_AVATAR };
}

function presentStore(store) {
  return {
    ...store,
    vendorName: store.vendor.fullName,
    slug: store.storeName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    tagline: store.tagline || '',
    rating: 0,
    reviewsCount: 0,
    deliveryTime: '15-25 mins',
    verified: true,
    badge: 'Campus Verified Vendor',
  };
}

function presentProduct(product) {
  return {
    ...product,
    storeName: product.store.storeName,
  };
}

function presentOrder(order) {
  return {
    ...order,
    buyerName: order.buyer.fullName,
    buyerEmail: order.buyer.email,
    items: order.orderItems.map((item) => ({
      ...item,
      storeName: item.store.storeName,
      productName: item.product.name,
    })),
  };
}

function sendError(res, error, status = 500) {
  if (status >= 500) console.error(error);
  const message = error instanceof Error
    ? error.message
    : (error && typeof error === 'object' && error.message)
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error) || 'An unexpected error occurred.';
  return res.status(status).json({
    error: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'The server could not complete the request. Check the server logs for details.'
      : message,
  });
}

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
  }

  prisma.user.findUnique({ where: { id: req.auth.id } })
    .then((user) => {
      if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
      req.user = user;
      return next();
    })
    .catch((error) => sendError(res, error));
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrator access is required.' });
  }
  return next();
}

function requireVendor(req, res, next) {
  if (!['VENDOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'A vendor account is required.' });
  }
  return next();
}

async function verifyPaystackTransaction(reference, expectedOrder) {
  if (!isPaystackConfigured() || expectedOrder.paymentProvider === 'TEST_MODE') {
    return {
      status: 'success',
      reference,
      amount: Math.round(expectedOrder.totalAmount * 100),
      currency: 'NGN',
      metadata: { orderId: expectedOrder.id },
    };
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY on the server.');
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  );
  const result = await response.json();
  if (!response.ok || !result.status) {
    const errorMsg = result.message === 'Invalid key'
      ? 'Invalid Paystack secret key. Please check PAYSTACK_SECRET_KEY in your .env file.'
      : (result.message || 'Paystack could not verify this transaction.');
    throw new Error(errorMsg);
  }

  const transaction = result.data;
  if (
    transaction.status !== 'success' ||
    transaction.reference !== reference ||
    transaction.amount !== Math.round(expectedOrder.totalAmount * 100) ||
    transaction.currency !== 'NGN' ||
    transaction.metadata?.orderId !== expectedOrder.id
  ) {
    throw new Error('Payment verification did not match the pending order.');
  }
  return transaction;
}

async function markOrderPaid(reference, transaction) {
  const orderId = transaction.metadata.orderId;
  const order = await prisma.orders.findFirst({
    where: { id: orderId, paymentReference: reference },
  });
  if (!order) throw new Error('No order matches the verified payment reference.');

  if (order.paymentStatus !== 'PAID') {
    await prisma.orders.updateMany({
      where: { id: order.id, paymentStatus: 'PENDING' },
      data: { paymentStatus: 'PAID' },
    });
  }

  return prisma.orders.findUnique({
    where: { id: order.id },
    include: { buyer: true, orderItems: { include: { store: true, product: true } } },
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      return callback(new Error('Upload a JPG, PNG, WEBP, or GIF image.'));
    }
    return callback(null, true);
  },
});

app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
    return res.status(401).json({ error: 'Paystack signature could not be verified.' });
  }

  const expectedSignature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest('hex');
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return res.status(401).json({ error: 'Invalid Paystack signature.' });
  }

  try {
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event !== 'charge.success') return res.sendStatus(200);
    const reference = event.data?.reference;
    if (!reference) return res.status(400).json({ error: 'Payment reference is missing.' });
    const order = await prisma.orders.findFirst({ where: { paymentReference: reference } });
    if (!order) return res.status(404).json({ error: 'Order for this payment was not found.' });
    const verified = await verifyPaystackTransaction(reference, order);
    await markOrderPaid(reference, verified);
    return res.sendStatus(200);
  } catch (error) {
    return sendError(res, error, 400);
  }
});

app.use(express.json({ limit: '1mb' }));

app.post('/api/v1/auth/register', async (req, res) => {
  const { fullName, email, password, role = 'BUYER', campus, hostel } = req.body;
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (!['BUYER', 'VENDOR'].includes(role)) {
    return res.status(400).json({ error: 'Choose either a buyer or vendor account.' });
  }
  const normalizedCampus = typeof campus === 'string' ? campus.trim() : '';
  const normalizedHostel = typeof hostel === 'string' ? hostel.trim() : '';
  if (!normalizedCampus) {
    return res.status(400).json({ error: 'Please choose your campus before continuing.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        campus: normalizedCampus || null,
        hostel: normalizedHostel || null,
      },
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'An account with this email already exists.' });
    return sendError(res, error);
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: safeUser(user) });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  res.json(safeUser(req.user));
});

app.get('/api/v1/stores', async (_req, res) => {
  try {
    const stores = await prisma.stores.findMany({
      include: { vendor: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(stores.map(presentStore));
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/v1/stores', authenticateToken, async (req, res) => {
  const { storeName, description, tagline, category, location, whatsApp, banner, avatar } = req.body;
  if (typeof storeName !== 'string' || !storeName.trim()) {
    return res.status(400).json({ error: 'Store name is required.' });
  }

  try {
    const [store, user] = await prisma.$transaction([
      prisma.stores.create({
        data: {
          vendorId: req.user.id,
          storeName: storeName.trim(),
          description: description || null,
          tagline: tagline || null,
          category: category || null,
          location: location || null,
          whatsApp: whatsApp || null,
          banner: banner || DEFAULT_BANNER,
          avatar: avatar || DEFAULT_AVATAR,
        },
        include: { vendor: { select: { fullName: true } } },
      }),
      prisma.user.update({ where: { id: req.user.id }, data: { role: 'VENDOR' } }),
    ]);
    return res.status(201).json({ store: presentStore(store), user: safeUser(user) });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/v1/products', async (req, res) => {
  const { store_id: storeId, category, search } = req.query;
  try {
    const products = await prisma.products.findMany({
      where: {
        ...(storeId ? { storeId: String(storeId) } : {}),
        ...(category && category !== 'all' ? { category: String(category) } : {}),
      },
      include: { store: { select: { storeName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const normalizedSearch = typeof search === 'string' ? search.toLowerCase() : '';
    return res.json(products
      .filter((product) => !normalizedSearch || [
        product.name,
        product.description || '',
        product.store.storeName,
      ].some((value) => value.toLowerCase().includes(normalizedSearch)))
      .map(presentProduct));
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/v1/products', authenticateToken, requireVendor, async (req, res) => {
  const { storeId, name, description, price, originalPrice, stockQuantity, imageUrl, category, badge } = req.body;
  if (typeof name !== 'string' || !name.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Product name and a valid price are required.' });
  }
  if (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0) {
    return res.status(400).json({ error: 'Stock quantity must be a non-negative whole number.' });
  }

  try {
    const store = await prisma.stores.findFirst({
      where: { id: storeId, ...(req.user.role === 'ADMIN' ? {} : { vendorId: req.user.id }) },
    });
    if (!store) return res.status(404).json({ error: 'The store was not found or is not yours.' });

    const product = await prisma.products.create({
      data: {
        storeId: store.id,
        name: name.trim(),
        description: description || null,
        price: Number(price),
        originalPrice: originalPrice === '' || originalPrice == null ? null : Number(originalPrice),
        stockQuantity: Number(stockQuantity),
        imageUrl: imageUrl || null,
        category: category || store.category,
        badge: badge || null,
      },
      include: { store: { select: { storeName: true } } },
    });
    return res.status(201).json(presentProduct(product));
  } catch (error) {
    return sendError(res, error);
  }
});

app.patch('/api/v1/products/:id', authenticateToken, requireVendor, async (req, res) => {
  const { name, description, price, originalPrice, stockQuantity, imageUrl, category, badge } = req.body;
  if (typeof name !== 'undefined' && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'Product name cannot be empty.' });
  }
  if (typeof price !== 'undefined' && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
    return res.status(400).json({ error: 'A valid price greater than zero is required.' });
  }
  if (typeof stockQuantity !== 'undefined' && (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0)) {
    return res.status(400).json({ error: 'Stock quantity must be a non-negative whole number.' });
  }

  try {
    const existing = await prisma.products.findUnique({
      where: { id: req.params.id },
      include: { store: true },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Product was not found.' });
    }
    if (req.user.role !== 'ADMIN' && existing.store.vendorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update products belonging to your store.' });
    }

    const updated = await prisma.products.update({
      where: { id: req.params.id },
      data: {
        ...(typeof name === 'string' ? { name: name.trim() } : {}),
        ...(typeof description !== 'undefined' ? { description: description || null } : {}),
        ...(typeof price !== 'undefined' ? { price: Number(price) } : {}),
        ...(typeof originalPrice !== 'undefined'
          ? { originalPrice: originalPrice === '' || originalPrice == null ? null : Number(originalPrice) }
          : {}),
        ...(typeof stockQuantity !== 'undefined' ? { stockQuantity: Number(stockQuantity) } : {}),
        ...(typeof imageUrl !== 'undefined' ? { imageUrl: imageUrl || null } : {}),
        ...(typeof category === 'string' && category.trim() ? { category: category.trim() } : {}),
        ...(typeof badge !== 'undefined' ? { badge: badge || null } : {}),
      },
      include: { store: { select: { storeName: true } } },
    });

    return res.json(presentProduct(updated));
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/v1/uploads', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (uploadError) => {
    if (uploadError) return res.status(400).json({ error: uploadError.message });
    if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' });

    if (isCloudinaryConfigured()) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'newmarket', resource_type: 'image' },
        (error, result) => {
          if (error) return sendError(res, error);
          return res.status(201).json({ url: result.secure_url });
        },
      );
      stream.end(req.file.buffer);
    } else {
      try {
        const ext = path.extname(req.file.originalname) || '.png';
        const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filePath, req.file.buffer);
        return res.status(201).json({ url: `/uploads/${filename}` });
      } catch (saveError) {
        return sendError(res, saveError);
      }
    }
  });
});

app.post('/api/v1/orders/checkout', authenticateToken, async (req, res) => {
  const { cartItems, buyerHostel, campus } = req.body;
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  const requestedItems = new Map();
  for (const item of cartItems) {
    if (
      typeof item?.id !== 'string' ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) {
      return res.status(400).json({ error: 'Each cart item must include a product and a positive whole-number quantity.' });
    }
    requestedItems.set(item.id, (requestedItems.get(item.id) || 0) + Number(item.quantity));
  }

  try {
    const products = await prisma.products.findMany({
      where: { id: { in: [...requestedItems.keys()] } },
      include: { store: true },
    });
    if (products.length !== requestedItems.size) {
      return res.status(400).json({ error: 'One or more cart products are no longer available.' });
    }
    for (const product of products) {
      if (requestedItems.get(product.id) > product.stockQuantity) {
        return res.status(409).json({ error: `${product.name} does not have enough stock.` });
      }
    }

    const reference = `NM-${crypto.randomUUID()}`;
    const subtotal = products.reduce(
      (sum, product) => sum + product.price * requestedItems.get(product.id),
      0,
    );
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${FRONTEND_URL}/payment/callback`;
    const paystackActive = isPaystackConfigured();

    const order = await prisma.orders.create({
      data: {
        buyerId: req.user.id,
        totalAmount: subtotal + SERVICE_FEE,
        paymentStatus: 'PENDING',
        paymentReference: reference,
        paymentProvider: paystackActive ? 'PAYSTACK' : 'TEST_MODE',
        buyerHostel: buyerHostel || null,
        campus: campus || req.user.campus || null,
        orderItems: {
          create: products.map((product) => ({
            storeId: product.storeId,
            productId: product.id,
            quantity: requestedItems.get(product.id),
            unitPrice: product.price,
          })),
        },
      },
      include: { buyer: true, orderItems: { include: { store: true, product: true } } },
    });

    if (!paystackActive) {
      const mockAuthUrl = `${callbackUrl}?reference=${encodeURIComponent(reference)}&test_mode=true`;
      return res.status(201).json({
        order: presentOrder(order),
        authorizationUrl: mockAuthUrl,
        reference,
      });
    }

    const paymentResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: Math.round(order.totalAmount * 100),
        currency: 'NGN',
        reference,
        callback_url: callbackUrl,
        metadata: { orderId: order.id },
      }),
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok || !payment.status || !payment.data?.authorization_url) {
      await prisma.$transaction([
        prisma.orderItems.deleteMany({ where: { orderId: order.id } }),
        prisma.orders.delete({ where: { id: order.id } }),
      ]);
      const message = payment.message === 'Invalid key'
        ? 'Invalid Paystack secret key. Please check PAYSTACK_SECRET_KEY in your .env file, or keep the default placeholder to enable simulated local checkout.'
        : (payment.message || 'Could not initialize the Paystack transaction.');
      return res.status(502).json({ error: message });
    }
    return res.status(201).json({
      order: presentOrder(order),
      authorizationUrl: payment.data.authorization_url,
      reference,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/v1/payments/verify/:reference', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.orders.findFirst({
      where: { paymentReference: req.params.reference, buyerId: req.user.id },
    });
    if (!order) return res.status(404).json({ error: 'Payment reference was not found.' });
    const transaction = await verifyPaystackTransaction(req.params.reference, order);
    const verifiedOrder = await markOrderPaid(req.params.reference, transaction);
    return res.json({ order: presentOrder(verifiedOrder) });
  } catch (error) {
    return sendError(res, error, 400);
  }
});

app.get('/api/v1/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { buyerId: req.user.id },
      include: { buyer: true, orderItems: { include: { store: true, product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders.map(presentOrder));
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/v1/vendor/orders', authenticateToken, requireVendor, async (req, res) => {
  try {
    const store = await prisma.stores.findFirst({
      where: {
        ...(typeof req.query.storeId === 'string' ? { id: req.query.storeId } : {}),
        ...(req.user.role === 'ADMIN' ? {} : { vendorId: req.user.id }),
      },
    });
    if (!store) return res.status(404).json({ error: 'No vendor store was found.' });
    const items = await prisma.orderItems.findMany({
      where: { storeId: store.id, order: { paymentStatus: 'PAID' } },
      include: { order: { include: { buyer: true } }, store: true, product: true },
      orderBy: { order: { createdAt: 'desc' } },
    });
    return res.json(items.map((item) => ({
      ...item,
      buyerName: item.order.buyer.fullName,
      buyerEmail: item.order.buyer.email,
      buyerHostel: item.order.buyerHostel,
      paymentStatus: item.order.paymentStatus,
      storeName: item.store.storeName,
      productName: item.product.name,
    })));
  } catch (error) {
    return sendError(res, error);
  }
});

app.patch('/api/v1/vendor/orders/:id/status', authenticateToken, requireVendor, async (req, res) => {
  const allowedStatuses = ['PROCESSING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ error: 'Choose a valid fulfillment status.' });
  }

  try {
    const item = await prisma.orderItems.findUnique({
      where: { id: req.params.id },
      include: { store: true, order: true },
    });
    if (!item || (req.user.role !== 'ADMIN' && item.store.vendorId !== req.user.id)) {
      return res.status(404).json({ error: 'Order item was not found in your store.' });
    }
    if (item.order.paymentStatus !== 'PAID') {
      return res.status(409).json({ error: 'Order fulfillment can start only after payment is verified.' });
    }
    const updated = await prisma.orderItems.update({
      where: { id: item.id },
      data: { status: req.body.status },
      include: { store: true, product: true },
    });
    return res.json({
      ...updated,
      storeName: updated.store.storeName,
      productName: updated.product.name,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/v1/admin/overview', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const [users, stores, products, orders, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.stores.count(),
      prisma.products.count(),
      prisma.orders.count(),
      prisma.orders.findMany({
        take: 10,
        include: { buyer: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return res.json({
      totals: { users, stores, products, orders },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        buyerName: order.buyer.fullName,
        buyerEmail: order.buyer.email,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return sendError(res, error);
  }
});

app.use((error, _req, res, _next) => {
  return sendError(res, error);
});

app.listen(PORT, () => {
  console.log(`NewMarket API listening on port ${PORT}`);
});

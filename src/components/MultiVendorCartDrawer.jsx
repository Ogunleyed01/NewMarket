import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  Lock
} from 'lucide-react';

export const MultiVendorCartDrawer = ({ onNavigate }) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    itemsByStore, 
    subtotal, 
    campusServiceFee, 
    grandTotal, 
    processCheckout,
  } = useCart();

  const { user } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [buyerName, setBuyerName] = useState(user?.fullName || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [hostelAddress, setHostelAddress] = useState(user?.hostel || '');
  const [checkoutError, setCheckoutError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setBuyerName(user.fullName || '');
    setBuyerEmail(user.email || '');
    setHostelAddress(user.hostel || '');
  }, [user]);

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('/login');
      return;
    }
    setCheckoutError('');
    setSubmitting(true);
    try {
      const result = await processCheckout({
        id: user.id,
        fullName: buyerName,
        email: buyerEmail,
        hostel: hostelAddress,
        campus: user.campus,
      });
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setCheckoutError(error.message);
      setSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setTimeout(() => setCheckoutStep('cart'), 300);
  };

  const formatPrice = (val) => `₦${Number(val).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={closeDrawer}></div>

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between h-full z-10 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#395082] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Unified Campus Cart</h3>
              <p className="text-[10px] text-[#1b9e4b] font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Secure payment with Paystack</span>
              </p>
            </div>
          </div>

          <button 
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Your Cart is Empty</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Browse student stores to add fresh pastries, hostel gadgets, or campus drip!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Multi-Vendor Order Splitting Badge */}
                  <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-[#2c3f68] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#395082] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Your items are grouped into <strong>{Object.keys(itemsByStore).length} vendor sub-orders</strong>. Paystack confirms one payment before vendors begin fulfillment.
                    </p>
                  </div>

                  {/* Grouped by Vendor Stores */}
                  {Object.values(itemsByStore).map((storeGroup) => (
                    <div key={storeGroup.storeId} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
                      
                      {/* Vendor Store Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#395082]" />
                          <span className="text-xs font-extrabold text-slate-900">{storeGroup.storeName}</span>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#395082] bg-blue-50 px-2.5 py-0.5 rounded-full">
                          Subtotal: {formatPrice(storeGroup.subtotal)}
                        </span>
                      </div>

                      {/* Items in this store */}
                      <div className="space-y-2.5">
                        {storeGroup.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-slate-200" 
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                              <p className="text-[11px] text-slate-500 font-medium">{formatPrice(item.price)} each</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-red-500 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Delivery & Checkout</h4>

              {!user && (
                <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
                  Sign in before checkout. Your cart will be kept while you sign in.
                </p>
              )}
              
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">Student Buyer Name</label>
                <input 
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#395082]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">Email Address</label>
                <input 
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#395082]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">Hostel Room / Campus Delivery Point</label>
                <input 
                  type="text" 
                  value={hostelAddress}
                  onChange={(e) => setHostelAddress(e.target.value)}
                  placeholder="e.g. Moremi Hall, Block B, Room 11"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#395082]"
                />
              </div>

              {/* Payment Notice */}
              <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-xs text-green-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#1b9e4b]">
                  <Lock className="w-4 h-4" />
                  <span>Paystack checkout</span>
                </div>
                <p className="text-[11px] text-green-800 leading-relaxed">
                  Your payment is processed by Paystack. NewMarket verifies the transaction before the order is marked paid and made available for fulfillment.
                </p>
              </div>

              {/* Vendors List Preview */}
              <div className="space-y-1.5 pt-2">
                <p className="text-xs text-slate-500 font-bold">Sub-Orders Dispatched Upon Checkout:</p>
                {Object.values(itemsByStore).map((group) => (
                  <div key={group.storeId} className="flex justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-medium">{group.storeName} ({group.items.length} items)</span>
                    <span className="font-extrabold text-slate-900">{formatPrice(group.subtotal)}</span>
                  </div>
                ))}
              </div>
            </form>
          )}

          {checkoutError && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">{checkoutError}</p>}

        </div>

        {/* Footer Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-900 font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Service & Delivery Fee</span>
                <span className="text-slate-900 font-bold">{formatPrice(campusServiceFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                <span>Grand Total</span>
                <span className="text-[#395082] text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                onClick={() => setCheckoutStep('checkout')}
                className="w-full py-3.5 rounded-xl bg-[#ff7e00] hover:bg-[#e57100] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition duration-150"
              >
                <span>Proceed to Unified Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl bg-[#1b9e4b] hover:bg-[#16863f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Opening Paystack…' : `Pay securely (${formatPrice(grandTotal)})`}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

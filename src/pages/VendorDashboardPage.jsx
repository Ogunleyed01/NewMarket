import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Store, 
  Layers, 
  ShoppingBag, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const VendorDashboardPage = ({ store, products, onAddProductClick, onRegisterStoreClick }) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [vendorSubOrders, setVendorSubOrders] = useState([]);
  const [error, setError] = useState('');
  const vendorStoreId = store?.id;

  useEffect(() => {
    if (!vendorStoreId) {
      setVendorSubOrders([]);
      return;
    }
    api.getVendorOrders()
      .then((items) => setVendorSubOrders(items.map((item) => ({ ...item, parentOrderId: item.orderId }))))
      .catch((requestError) => setError(requestError.message));
  }, [vendorStoreId]);

  const filteredItems = vendorSubOrders.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const totalEarnings = vendorSubOrders
    .filter((item) => item.paymentStatus === 'PAID')
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const uniqueBuyers = new Set(vendorSubOrders.map((item) => item.buyerEmail || item.buyerName)).size;

  const handleStatusChange = async (_orderId, itemId, newStatus) => {
    setError('');
    try {
      const updatedItem = await api.updateOrderStatus(itemId, newStatus);
      setVendorSubOrders((items) => items.map((item) => (
        item.id === itemId ? { ...item, ...updatedItem } : item
      )));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const formatPrice = (val) => `₦${Number(val).toLocaleString()}`;

  if (!store) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Store className="mx-auto h-10 w-10 text-[#395082]" />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Set up your storefront</h1>
        <p className="mt-2 text-sm text-slate-500">Create a store before listing products or managing orders.</p>
        <button onClick={onRegisterStoreClick} className="mt-5 rounded-xl bg-[#395082] px-5 py-3 text-xs font-extrabold text-white">
          Create my store
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header & Vendor Store Title */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={store.avatar || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80'}
            alt={store.storeName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{store.storeName}</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-[#1b9e4b]">
                VERIFIED STORE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Owner: <strong className="text-slate-800">{user?.fullName}</strong> ({store.location})
            </p>
          </div>
        </div>

        <button
          onClick={onAddProductClick}
          className="px-5 py-2.5 rounded-xl bg-[#395082] hover:bg-[#2c3f68] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#1b9e4b]">
            <span className="text-xs font-bold text-slate-500">Total Store Revenue</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatPrice(totalEarnings)}</p>
          <p className="text-[11px] text-[#1b9e4b] flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified paid order value</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#395082]">
            <span className="text-xs font-bold text-slate-500">Incoming Sub-Orders</span>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{vendorSubOrders.length}</p>
          <p className="text-[11px] text-[#395082] font-semibold">
            From {uniqueBuyers} Student Buyers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-slate-500">Active Inventory</span>
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {products.filter(p => p.storeId === vendorStoreId).length} Products
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">Real-Time Stock Tracked</p>
        </div>
      </div>

      {/* Incoming Sub-Orders Queue & State Machine Controller */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#395082]" />
              <span>Incoming Sub-Orders Queue</span>
            </h2>
            <p className="text-xs text-slate-500">Update item fulfillment state independently without affecting other vendors</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'PROCESSING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-[#395082] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No incoming sub-orders found under status "{filterStatus.replace(/_/g, ' ')}".
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredItems.map((subOrder) => (
              <div 
                key={subOrder.id} 
                className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#395082]">{subOrder.parentOrderId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Item ID: {subOrder.id}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">{subOrder.productName} (x{subOrder.quantity})</h4>
                  <p className="text-xs text-slate-600">
                    Buyer: <strong className="text-slate-800">{subOrder.buyerName}</strong> • Delivery: <strong className="text-slate-800">{subOrder.buyerHostel}</strong>
                  </p>
                  <p className="text-xs text-[#395082] font-extrabold">{formatPrice(subOrder.unitPrice * subOrder.quantity)}</p>
                </div>

                {/* State Machine Transition Selector */}
                <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-bold block">Current State:</span>
                    <span className="text-xs font-extrabold text-slate-900">{subOrder.status.replace(/_/g, ' ')}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                  <select
                    value={subOrder.status}
                    onChange={(e) => handleStatusChange(subOrder.parentOrderId, subOrder.id, e.target.value)}
                    disabled={subOrder.paymentStatus !== 'PAID'}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#395082] focus:outline-none focus:ring-1 focus:ring-[#395082]"
                  >
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

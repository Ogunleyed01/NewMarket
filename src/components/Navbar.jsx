import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Search, 
  Store, 
  LogOut, 
  MapPin, 
  Package, 
  PlusCircle, 
  ChevronDown,
  Layers,
  Compass
} from 'lucide-react';

const CAMPUSES = [
  'Obafemi Awolowo University (OAU)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Federal Univ of Tech Akure (FUTA)',
  'University of Nigeria Nsukka (UNN)',
];

export const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  activeView, 
  setActiveView,
  onOpenRegisterStore,
  onNavigate,
  hasVendorStore,
  selectedCampus,
  setSelectedCampus
}) => {
  const { user, logout } = useAuth();
  const { cart, setIsCartOpen, orders } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setActiveView('home')} 
              className="flex min-w-0 items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#395082] to-[#111827] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#111827] whitespace-nowrap">
                    New<span className="text-[#395082]">Market</span>
                  </span>
                  <span className="hidden sm:inline text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-[#e5ecf5] text-[#395082] rounded whitespace-nowrap">
                    CAMPUS
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium -mt-0.5 truncate">Verified Student Marketplace</p>
              </div>
            </button>

            <div className="ml-auto flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-slate-100 text-[#111827]"
                title="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#ff7e00] text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food, gadgets, hoodies, hostels, campus stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#395082] focus:bg-white focus:ring-1 focus:ring-[#395082] transition duration-150"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 min-w-0">
            
            {/* Explore Button */}
            <button
              onClick={() => setActiveView('home')}
              className={`px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'home' 
                  ? 'bg-slate-100 text-[#395082] font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-[#395082]" />
              <span className="hidden sm:inline">Explore</span>
            </button>

            {/* My Orders Button */}
            <button
              onClick={() => setActiveView('my-orders')}
              className={`px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition relative ${
                activeView === 'my-orders' 
                  ? 'bg-slate-100 text-[#395082] font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-[#395082]" />
              <span className="hidden sm:inline">My Orders</span>
              {orders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#1b9e4b]"></span>
              )}
            </button>

            {/* Vendor Portal / Sell Button */}
            {user?.role === 'VENDOR' && hasVendorStore ? (
              <button
                onClick={() => setActiveView('vendor-dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  activeView === 'vendor-dashboard'
                    ? 'bg-[#395082] text-white'
                    : 'bg-blue-50 text-[#395082] hover:bg-blue-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Vendor Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onOpenRegisterStore}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-[#ff7e00] bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.role === 'VENDOR' ? 'Set up your store' : 'Sell on NewMarket'}</span>
              </button>
            )}

            {/* Unified Cart Toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] transition group hidden sm:block"
              title="View Unified Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ff7e00] text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {!user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button onClick={() => onNavigate('/login')} className="rounded-xl px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100">
                  Sign in
                </button>
                <button onClick={() => onNavigate('/signup')} className="rounded-xl bg-[#395082] px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold text-white hover:bg-[#2c3f68]">
                  Sign up
                </button>
              </div>
            ) : <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
              >
                <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.fullName}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-dropdown py-2 z-50 border border-slate-200 text-xs animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.fullName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user?.role === 'VENDOR' 
                          ? 'bg-blue-100 text-[#395082]' 
                          : 'bg-green-100 text-[#1b9e4b]'
                      }`}>
                        {user.role === 'ADMIN' ? 'ADMINISTRATOR' : user.role === 'VENDOR' ? 'STORE OWNER 🏪' : 'STUDENT BUYER 🎓'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('my-orders');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-[#395082]" />
                      <span>My Orders & Sub-orders</span>
                    </button>

                    {user?.role === 'VENDOR' && (
                      <button
                        onClick={() => {
                          setActiveView('vendor-dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-[#395082]" />
                        <span>Manage My Storefront</span>
                      </button>
                    )}

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          onNavigate('/admin');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        Platform admin
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 lg:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products & student stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#395082]"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

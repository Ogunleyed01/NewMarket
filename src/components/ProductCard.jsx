import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Store, Check } from 'lucide-react';

export const ProductCard = ({ product, onSelectStore }) => {
  const { addToCart, cart } = useCart();
  const [added, setAdded] = useState(false);

  const existingInCart = cart.find(item => item.id === product.id);
  const cartQty = existingInCart ? existingInCart.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  // Format price in Naira
  const formatPrice = (val) => {
    return `₦${Number(val).toLocaleString()}`;
  };

  return (
    <div className="group h-full bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
      
      <div className="flex-1">
        {/* Product Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img 
            src={product.imageUrl || "https://placehold.co/300x200/e2e8f0/64748b?text=No+Image"} 
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/300x200/e2e8f0/64748b?text=No+Image";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 border border-slate-200 shadow-sm">
              {product.badge}
            </div>
          )}

          {/* Store Pill */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectStore) onSelectStore(product.storeId);
            }}
            className="absolute bottom-2.5 left-2.5 bg-white/95 hover:bg-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#395082] border border-slate-200 shadow-sm flex items-center gap-1.5 transition"
          >
            <Store className="w-3 h-3 text-[#395082]" />
            <span className="truncate max-w-[120px]">{product.storeName}</span>
          </button>
        </div>

        {/* Product Content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating || '4.9'}</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#395082] transition line-clamp-1 mb-1 min-h-[1.5rem]">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2 min-h-[2.5rem]">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Add to Cart */}
      <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/40 gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Stock: {product.stockQuantity} left</p>
        </div>

        <button
          onClick={handleAdd}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm min-w-[94px] ${
            added
              ? 'bg-[#1b9e4b] text-white scale-105'
              : 'bg-[#395082] hover:bg-[#2c3f68] text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{cartQty > 0 ? `Add (${cartQty})` : 'Add'}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

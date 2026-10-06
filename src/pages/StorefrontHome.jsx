import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryPills, normalizeCategory } from '../components/CategoryPills';
import { StoreCard } from '../components/StoreCard';
import { ProductCard } from '../components/ProductCard';
import { Store, Sparkles, Flame, Tag, ShieldCheck } from 'lucide-react';

export const StorefrontHome = ({ 
  stores, 
  products, 
  selectedCategory, 
  onSelectCategory,
  onSelectStore,
  searchQuery,
  onRegisterStoreClick,
  selectedCampus
}) => {
  const normalizedSelection = normalizeCategory(selectedCategory);

  const filteredProducts = products.filter((p) => {
    const normalizedProductCategory = normalizeCategory(p.category);
    const matchesCategory = normalizedSelection === 'all' || normalizedProductCategory === normalizedSelection;
    const haystack = [p.name, p.description || '', p.storeName || '', p.category || '']
      .join(' ')
      .toLowerCase();
    const query = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = query === '' || haystack.includes(query);
    return matchesCategory && matchesSearch;
  });

  const bestsellers = products.filter((p) => p.isBestseller);

  return (
    <div className="space-y-10">
      
      {/* Promotional Hero Carousel Banner */}
      <HeroBanner 
        onExploreClick={() => {
          const section = document.getElementById('products-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }}
        onRegisterStoreClick={onRegisterStoreClick}
      />

      {/* Category Filter Pills */}
      <CategoryPills 
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      {/* Featured Student Storefronts Grid */}
      {!searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#395082]" />
                <span>Featured Campus Storefronts</span>
              </h2>
              <p className="text-xs text-slate-500">
                Verified student vendors on {selectedCampus || 'your campus'} with hostel delivery
              </p>
            </div>
            <span className="text-xs font-bold text-[#395082] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {stores.length} Verified Stores
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {stores.map((store) => (
              <div key={store.id} className="h-full">
                <StoreCard store={store} onSelectStore={onSelectStore} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Campus Hot Bestsellers Highlight */}
      {!searchQuery && selectedCategory === 'all' && bestsellers.length > 0 && (
        <section className="p-6 rounded-3xl bg-orange-50/60 border border-orange-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff7e00] flex items-center justify-center">
                <Flame className="w-5 h-5 fill-[#ff7e00]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Campus Hot Bestsellers</h3>
                <p className="text-xs text-orange-950 font-medium">Trending student products across campus hostels today</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#ff7e00] bg-white px-3 py-1 rounded-full border border-orange-200 shadow-sm flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Student Deal</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {bestsellers.slice(0, 4).map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} onSelectStore={onSelectStore} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Product Catalog Section */}
      <section id="products-section" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#395082]" />
              <span>
                {selectedCategory === 'all' ? 'All Campus Offerings' : `${selectedCategory.toUpperCase()} Products`}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} items {searchQuery ? `matching "${searchQuery}"` : ''}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No products found</h4>
            <p className="text-xs text-slate-500">Try adjusting your category filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 auto-rows-fr">
            {filteredProducts.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} onSelectStore={onSelectStore} />
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

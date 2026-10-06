import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ShoppingBag, Clock, Sparkles, ChevronLeft, ChevronRight, Store, Zap, Gift, Truck } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tagline: 'Live Campus Marketplace',
    tagAccent: 'Secure Payments',
    headline: <>Buy, Sell &amp; Earn on Your Campus <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400">with Complete Safety.</span></>,
    description: 'A unified campus storefront connecting student vendors with buyers. Add fresh hostel pastries, tech gear, and varsity wear to a single shopping cart with real-time multi-vendor order fulfillment.',
    stats: [
      { value: '50+', label: 'Verified Stores', color: 'text-white' },
      { value: '100% Safe', label: 'Secure Payments', color: 'text-[#1b9e4b]' },
      { value: '15-30m', label: 'Hostel Doorstep', color: 'text-[#ff7e00]' },
    ],
    bgGradient: 'from-[#111827] via-[#1E293B] to-[#395082]',
    glowColors: ['bg-blue-500/10', 'bg-orange-500/10'],
    image1: {
      avatar: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80',
      name: 'Sweet Tooth Bakes',
      location: 'Moremi Hall • 15m',
      productImg: 'https://images.unsplash.com/photo-1587668178277-295251f930f2?w=600&auto=format&fit=crop&q=80',
      price: '₦4,500',
      tag: 'In Stock',
      tagColor: 'bg-green-50 text-[#1b9e4b]',
    },
    image2: {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      name: 'Campus Tech Plug',
      location: 'SUB Block • Tested',
      productImg: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      price: '₦18,500',
      tag: '7-Day Swap',
      tagColor: 'bg-blue-50 text-[#395082]',
    },
    footerIcon: Store,
    footerText: 'Multi-Vendor Cart Auto-Splitting',
  },
  {
    id: 2,
    tagline: 'Campus Flash Deals',
    tagAccent: 'Limited Time',
    headline: <>Exclusive Student Deals <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-400">Every Single Week.</span></>,
    description: 'Get access to weekly flash sales from verified student vendors. From discounted pastries to affordable tech accessories — all delivered to your hostel doorstep.',
    stats: [
      { value: '30%', label: 'Avg. Discount', color: 'text-[#ff7e00]' },
      { value: '200+', label: 'Happy Students', color: 'text-white' },
      { value: '24h', label: 'Flash Window', color: 'text-pink-400' },
    ],
    bgGradient: 'from-[#1a1025] via-[#2d1b3d] to-[#4a2c6a]',
    glowColors: ['bg-pink-500/10', 'bg-amber-500/10'],
    image1: {
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      name: 'Campus Drip & Wear',
      location: 'SUB Complex • Same Day',
      productImg: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
      price: '₦19,500',
      tag: 'Best Seller',
      tagColor: 'bg-amber-50 text-amber-700',
    },
    image2: {
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      name: 'Hostel Glam & Skincare',
      location: 'Akintola Hall • 20m',
      productImg: 'https://images.unsplash.com/photo-1608248597261-833258657b45?w=600&auto=format&fit=crop&q=80',
      price: '₦9,500',
      tag: 'Hot Pick',
      tagColor: 'bg-rose-50 text-rose-700',
    },
    footerIcon: Gift,
    footerText: 'Weekly Student Flash Deals',
  },
  {
    id: 3,
    tagline: 'Start Your Hustle',
    tagAccent: 'Zero Setup Fee',
    headline: <>Open Your Student Store <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">In Under 2 Minutes.</span></>,
    description: 'Turn your hostel hustle into a real business. Create your storefront, list products, and start receiving orders from students across campus — completely free to start.',
    stats: [
      { value: 'Free', label: 'Store Setup', color: 'text-[#1b9e4b]' },
      { value: '2 min', label: 'Onboarding', color: 'text-white' },
      { value: '₦0', label: 'Monthly Fee', color: 'text-emerald-400' },
    ],
    bgGradient: 'from-[#0a1628] via-[#0d2137] to-[#134e4a]',
    glowColors: ['bg-emerald-500/10', 'bg-cyan-500/10'],
    image1: {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      name: 'Your Store Here',
      location: 'Your Hall • Fast Delivery',
      productImg: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop&q=80',
      price: '₦ Your Price',
      tag: 'New Store',
      tagColor: 'bg-emerald-50 text-emerald-700',
    },
    image2: {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      name: 'Another Store',
      location: 'Campus Wide • Verified',
      productImg: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      price: '₦ Set Price',
      tag: 'Coming Soon',
      tagColor: 'bg-teal-50 text-teal-700',
    },
    footerIcon: Zap,
    footerText: 'Instant Storefront Creation',
  },
];

export const HeroBanner = ({ onExploreClick, onRegisterStoreClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % SLIDES.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + SLIDES.length) % SLIDES.length);
  }, [currentSlide, goToSlide]);

  // Auto-play every 6 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = SLIDES[currentSlide];
  const FooterIcon = slide.footerIcon;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${slide.bgGradient} text-white p-5 sm:p-7 md:p-10 mb-8 shadow-md transition-colors duration-700`}>
      {/* Decorative Glow Elements */}
      <div className={`absolute top-0 right-0 w-80 h-80 ${slide.glowColors[0]} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}></div>
      <div className={`absolute bottom-0 left-1/3 w-64 h-64 ${slide.glowColors[1]} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}></div>

      {/* Carousel Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition hidden sm:flex items-center justify-center"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition hidden sm:flex items-center justify-center"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column Text & CTAs */}
        <div className={`lg:col-span-7 space-y-5 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#1b9e4b] animate-pulse"></span>
            <span>{slide.tagline}</span>
            <span className="text-slate-400">•</span>
            <span className="text-[#ff7e00] font-bold">{slide.tagAccent}</span>
          </div>

          <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] md:leading-tight">
            {slide.headline}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            {slide.description}
          </p>

          {/* Key Value Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-white/10">
            {slide.stats.map((stat, idx) => (
              <div key={idx}>
                <div className={`text-lg sm:text-xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-2xl bg-[#ff7e00] hover:bg-[#e57100] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition duration-150"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onRegisterStoreClick}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Open a Student Store</span>
            </button>
          </div>
        </div>

        {/* Right Column Visual Showcase Cards */}
        <div className={`lg:col-span-5 relative transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Vendor Card Preview 1 */}
            <div className="bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 text-slate-900 transform hover:-translate-y-1 transition duration-200">
              <div className="flex items-center gap-2.5 mb-2.5">
                <img 
                  src={slide.image1.avatar} 
                  alt={slide.image1.name}
                  className="w-9 h-9 rounded-xl object-cover" 
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{slide.image1.name}</h4>
                  <p className="text-[10px] text-[#1b9e4b] font-semibold truncate">{slide.image1.location}</p>
                </div>
              </div>
              <img 
                src={slide.image1.productImg} 
                alt="Product" 
                className="w-full h-24 rounded-xl object-cover mb-2"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900">{slide.image1.price}</span>
                <span className={`text-[10px] ${slide.image1.tagColor} px-2 py-0.5 rounded font-bold`}>{slide.image1.tag}</span>
              </div>
            </div>

            {/* Vendor Card Preview 2 */}
            <div className="bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 text-slate-900 transform translate-y-3 hover:translate-y-2 transition duration-200">
              <div className="flex items-center gap-2.5 mb-2.5">
                <img 
                  src={slide.image2.avatar} 
                  alt={slide.image2.name} 
                  className="w-9 h-9 rounded-xl object-cover" 
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{slide.image2.name}</h4>
                  <p className="text-[10px] text-[#395082] font-semibold truncate">{slide.image2.location}</p>
                </div>
              </div>
              <img 
                src={slide.image2.productImg} 
                alt="Product" 
                className="w-full h-24 rounded-xl object-cover mb-2"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900">{slide.image2.price}</span>
                <span className={`text-[10px] ${slide.image2.tagColor} px-2 py-0.5 rounded font-bold`}>{slide.image2.tag}</span>
              </div>
            </div>

          </div>

          {/* Footer Badge */}
          <div className="mt-5 bg-white/95 text-slate-900 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-md flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <FooterIcon className="w-4 h-4 text-[#1b9e4b]" />
              <span className="text-[11px] font-semibold text-slate-700">{slide.footerText}</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#395082] bg-blue-50 px-2 py-0.5 rounded">Active</span>
          </div>
        </div>

      </div>

      {/* Dot Indicators */}
      <div className="relative z-20 flex items-center justify-center gap-2 mt-6">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'w-8 h-2.5 bg-[#ff7e00]'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

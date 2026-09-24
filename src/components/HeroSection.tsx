import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { CLOUDINARY_ASSETS, getOptimizedImageUrl } from '../services/cloudinaryService';
import { ArrowRight, ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { haptic } from '../utils/haptics';

export const HeroSection: React.FC = () => {
  const { language, t, setActiveTab, setIsCartOpen, setIsReservationOpen, theme } = useApp();
  const isLight = theme === 'light';

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  // Smooth, high-performance subtle luxury parallax on scroll
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgY = Math.min(scrollY * 0.2, 60);
  const contentY = Math.min(scrollY * 0.1, 30);
  const contentOpacity = Math.max(1 - scrollY / 450, 0.4);

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-between text-center px-4 py-10 select-none overflow-hidden bg-transparent">
      {/* Background subtle atmospheric vignette with parallax */}
      <div 
        style={{ transform: `translate3d(0, ${bgY}px, 0)` }}
        className={`absolute inset-0 pointer-events-none will-change-transform ${
          isLight
            ? 'opacity-30 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.06)_0%,transparent_80%)]'
            : 'opacity-15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_80%)]'
        }`}
      />

      {/* Real Cafe Background with luxury treatment and parallax */}
      <div 
        style={{ transform: `translate3d(0, ${bgY}px, 0)` }}
        className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform z-0"
      >
        <img
          src={getOptimizedImageUrl(CLOUDINARY_ASSETS.cafeHero)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getOptimizedImageUrl(CLOUDINARY_ASSETS.cafeHero);
          }}
          alt="Bokharest Cafe Ambiance"
          className={`w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ${
            isLight
              ? 'opacity-20 filter brightness-105 contrast-95'
              : 'opacity-35 filter brightness-95 contrast-105'
          }`}
        />
        {/* Luxury Vignette & Gradients for optimal text readability */}
        <div className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-gradient-to-b from-[#f8f9fa]/70 via-[#f8f9fa]/30 to-[#f8f9fa]'
            : 'bg-gradient-to-b from-black/80 via-black/45 to-black'
        }`} />
        <div className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(248,249,250,0.9)_90%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.8)_85%)]'
        }`} />
      </div>

      {/* Top spacer */}
      <div className="relative z-10 pt-2" />

      {/* Hero Central Identity with parallax response & smooth entrance */}
      <motion.div 
        style={{ transform: `translate3d(0, ${contentY}px, 0)`, opacity: contentOpacity }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md mx-auto flex flex-col items-center will-change-transform"
      >
        {/* Official Brand Logo lockup */}
        <BrandLogo variant="hero" />
      </motion.div>

      {/* Hero CTAs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-3 pt-6 pb-2"
      >
        {/* Main CTA: View Menu */}
        <button
          id="hero-view-menu-btn"
          onClick={() => {
            haptic.tab();
            setActiveTab('menu');
          }}
          className={`w-full min-h-[50px] min-w-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 active:opacity-80 focus:outline-none cursor-pointer touch-press ${
            isLight
              ? 'bg-black text-white hover:bg-neutral-800 shadow-xl shadow-black/15'
              : 'bg-white text-black hover:bg-neutral-200 shadow-xl shadow-white/10'
          }`}
        >
          <span>{t('view_menu')}</span>
          <ArrowIcon className="w-4 h-4" />
        </button>

        {/* Action Row: Book a Table & Order Now with minimum 8px spacing and 48px touch targets */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Table Reservation Button */}
          <button
            id="hero-book-table-btn"
            onClick={() => {
              haptic.tab();
              setIsReservationOpen(true);
            }}
            className={`w-full min-h-[48px] min-w-[48px] py-3 px-4 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 active:opacity-80 focus:outline-none backdrop-blur-sm cursor-pointer touch-press ${
              isLight
                ? 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 shadow-sm'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
            }`}
          >
            <Calendar className={`w-4 h-4 shrink-0 ${isLight ? 'text-black' : 'text-neutral-200'}`} />
            <span className="truncate">{t('book_table')}</span>
          </button>

          {/* Prominent Order Now Button */}
          <button
            id="hero-order-now-btn"
            onClick={() => {
              haptic.tab();
              setActiveTab('menu');
              setIsCartOpen(true);
            }}
            className={`w-full min-h-[48px] min-w-[48px] py-3 px-4 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 active:opacity-80 focus:outline-none backdrop-blur-sm cursor-pointer touch-press ${
              isLight
                ? 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 shadow-sm'
                : 'bg-black/60 hover:bg-white/10 text-white border border-white/20'
            }`}
          >
            <MessageSquare className={`w-4 h-4 shrink-0 ${isLight ? 'text-black' : 'text-white'}`} />
            <span className="truncate">{t('order_now')}</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};

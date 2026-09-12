import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ArrowRight, ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { haptic } from '../utils/haptics';

export const HeroSection: React.FC = () => {
  const { language, t, setActiveTab, setIsCartOpen, setIsReservationOpen } = useApp();

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
    <section className="relative min-h-[82vh] flex flex-col items-center justify-between text-center px-4 py-12 select-none overflow-hidden bg-transparent">
      {/* Background subtle atmospheric vignette with parallax */}
      <div 
        style={{ transform: `translate3d(0, ${bgY}px, 0)` }}
        className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_80%)] will-change-transform"
      />

      {/* Real Cafe Background with luxury dark treatment and parallax */}
      <div 
        style={{ transform: `translate3d(0, ${bgY}px, 0)` }}
        className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform z-0"
      >
        <img
          src="/cafe_hero.png"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co/wr3SP576/image.png';
          }}
          alt="Bokharest Cafe Ambiance"
          className="w-full h-full object-cover object-center opacity-35 scale-105 filter brightness-95 contrast-105 transition-transform duration-1000"
        />
        {/* Luxury Vignette & Dark Gradients for optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.8)_85%)] pointer-events-none" />
      </div>

      {/* Top spacer */}
      <div className="relative z-10 pt-4" />

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

        {/* Premium Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif-luxury italic text-sm sm:text-base text-neutral-300 tracking-wide mt-4 max-w-xs sm:max-w-sm"
        >
          "{language === 'ar' ? 'حيث يلتقي المذاق بالأناقة' : 'Where Taste Meets Elegance'}"
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs text-neutral-400 font-light mt-2 max-w-xs leading-relaxed"
        >
          {language === 'ar' 
            ? 'تجربة طهي ومشروبات استثنائية في أرقى أجواء الفخامة والضيافة'
            : 'An exceptional dining and cafe journey crafted in sophisticated luxury.'}
        </motion.p>
      </motion.div>

      {/* Hero CTAs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xs mx-auto flex flex-col gap-2.5 pt-8 pb-4"
      >
        {/* Main CTA: View Menu */}
        <button
          id="hero-view-menu-btn"
          onClick={() => {
            haptic.tab();
            setActiveTab('menu');
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-neutral-200 transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-white/10 active:scale-[0.98] focus:outline-none cursor-pointer"
        >
          <span>{t('view_menu')}</span>
          <ArrowIcon className="w-4 h-4" />
        </button>

        {/* Action Row: Book a Table & Order Now */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Table Reservation Button */}
          <button
            id="hero-book-table-btn"
            onClick={() => {
              haptic.tab();
              setIsReservationOpen(true);
            }}
            className="w-full py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98] focus:outline-none backdrop-blur-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-200" />
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
            className="w-full py-3 px-3 rounded-2xl bg-black/60 hover:bg-white/10 text-white border border-white/20 font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98] focus:outline-none backdrop-blur-sm cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="truncate">{t('order_now')}</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};

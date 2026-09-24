import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ShoppingBag, Calendar, Sun, Moon } from 'lucide-react';
import { haptic } from '../utils/haptics';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    cartCount,
    setIsCartOpen,
    setIsReservationOpen,
    setActiveTab,
    openAdmin,
    t,
  } = useApp();
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLight = theme === 'light';

  const handleBrandClick = () => {
    haptic.tab();
    setActiveTab('home');

    // Discreet admin access: 5 quick taps on the logo opens admin portal
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2500);

    if (logoTapCountRef.current >= 5) {
      logoTapCountRef.current = 0;
      openAdmin();
    }
  };

  return (
    <header className={`sticky top-0 z-40 px-4 py-3 select-none backdrop-blur-md transition-colors duration-200 ${
      isLight
        ? 'bg-white/95 border-b border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
        : 'bg-black/90 border-b border-white/10'
    }`}>
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Tap to Home */}
        <button
          id="header-brand-btn"
          onClick={handleBrandClick}
          className="flex items-center text-left rtl:text-right focus:outline-none group shrink-0 cursor-pointer"
          aria-label="Bokharest Black Home"
        >
          <BrandLogo variant="header" />
        </button>

        {/* Right Actions: Reservation, Theme Toggle, Discreet Language Toggle & Cart Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Book Table Button with min 48px touch target */}
          <button
            id="header-reservation-btn"
            onClick={() => {
              haptic.tab();
              setIsReservationOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-150 focus:outline-none min-h-[48px] min-w-[48px] active:scale-95 active:opacity-80 cursor-pointer touch-press ${
              isLight
                ? 'border border-neutral-300 bg-white text-neutral-900 hover:border-black hover:bg-neutral-50 shadow-sm'
                : 'border border-white/20 bg-neutral-950/80 text-neutral-200 hover:text-white hover:border-white/50'
            }`}
            title={t('book_table')}
            aria-label="Book Table"
          >
            <Calendar className={`w-4 h-4 ${isLight ? 'text-black' : 'text-white'}`} />
            <span className="hidden sm:inline">{t('book_table')}</span>
          </button>

          {/* Quick Theme Toggle (Sun/Moon) */}
          <button
            id="header-theme-toggle-btn"
            type="button"
            onClick={() => {
              haptic.toggle();
              toggleTheme();
            }}
            className={`min-h-[48px] min-w-[48px] p-2.5 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 active:opacity-80 touch-press ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 shadow-sm'
                : 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-white/15'
            }`}
            title={isLight ? (language === 'ar' ? 'التبديل إلى الوضع الداكن' : 'Switch to Dark Mode') : (language === 'ar' ? 'التبديل إلى الأبيض الفاخر' : 'Switch to White Luxury')}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-4 h-4 text-neutral-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Discreet Luxury Language Toggle with 48px height touch container */}
          <div
            id="header-language-toggle"
            className={`inline-flex items-center min-h-[48px] p-1 rounded-full backdrop-blur-md ${
              isLight
                ? 'border border-neutral-300 bg-neutral-100 shadow-inner'
                : 'border border-white/15 bg-neutral-950/80 shadow-inner'
            }`}
            role="group"
            aria-label="Language selector"
          >
            <button
              type="button"
              id="header-lang-ar"
              onClick={() => {
                if (language !== 'ar') {
                  haptic.tab();
                  setLanguage('ar');
                }
              }}
              className={`min-h-[40px] px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wide rounded-full transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
                language === 'ar'
                  ? isLight
                    ? 'bg-black text-white font-extrabold shadow-sm'
                    : 'bg-white text-black font-extrabold shadow-sm'
                  : isLight
                  ? 'text-neutral-600 hover:text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
              aria-pressed={language === 'ar'}
              title="التبديل إلى العربية"
            >
              عربي
            </button>
            <span className={`w-px h-3 mx-0.5 ${isLight ? 'bg-neutral-300' : 'bg-white/10'}`} />
            <button
              type="button"
              id="header-lang-en"
              onClick={() => {
                if (language !== 'en') {
                  haptic.tab();
                  setLanguage('en');
                }
              }}
              className={`min-h-[40px] px-3 sm:px-3.5 py-2 text-xs font-bold tracking-wider rounded-full transition-all duration-150 focus:outline-none cursor-pointer font-serif-luxury active:scale-95 active:opacity-80 touch-press ${
                language === 'en'
                  ? isLight
                    ? 'bg-black text-white font-extrabold shadow-sm'
                    : 'bg-white text-black font-extrabold shadow-sm'
                  : isLight
                  ? 'text-neutral-600 hover:text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
              aria-pressed={language === 'en'}
              title="Switch to English"
            >
              EN
            </button>
          </div>

          {/* Quick Cart Order Button with 48px touch target */}
          <button
            id="header-cart-btn"
            onClick={() => {
              haptic.tab();
              setIsCartOpen(true);
            }}
            className={`relative min-h-[48px] min-w-[48px] p-3 rounded-full transition-all duration-150 focus:outline-none flex items-center justify-center cursor-pointer active:scale-95 active:opacity-80 touch-press ${
              isLight
                ? 'border border-neutral-300 bg-white text-black hover:border-black shadow-sm'
                : 'border border-white/20 bg-neutral-950/80 text-white hover:border-white/50'
            }`}
            aria-label="Shopping Cart"
          >
            <ShoppingBag className={`w-4 h-4 ${isLight ? 'text-black' : 'text-white'}`} />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border animate-in fade-in zoom-in-75 ${
                isLight ? 'bg-black text-white border-white' : 'bg-white text-black border-black'
              }`}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

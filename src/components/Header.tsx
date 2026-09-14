import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ShoppingBag, Calendar } from 'lucide-react';
import { haptic } from '../utils/haptics';

export const Header: React.FC = () => {
  const { language, setLanguage, cartCount, setIsCartOpen, setIsReservationOpen, setActiveTab, openAdmin, t } = useApp();
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 select-none">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Tap to Home */}
        <button
          id="header-brand-btn"
          onClick={handleBrandClick}
          className="flex items-center text-left rtl:text-right focus:outline-none group shrink-0"
          aria-label="Bokharest Black Home"
        >
          <BrandLogo variant="header" />
        </button>

        {/* Right Actions: Reservation, Discreet Language Toggle & Cart Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Book Table Button with min 48px touch target */}
          <button
            id="header-reservation-btn"
            onClick={() => {
              haptic.tab();
              setIsReservationOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-white/20 bg-neutral-950/80 text-xs font-semibold tracking-wider text-neutral-200 hover:text-white hover:border-white/50 transition-all duration-150 focus:outline-none min-h-[48px] min-w-[48px] active:scale-95 active:opacity-80 cursor-pointer touch-press"
            title={t('book_table')}
            aria-label="Book Table"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">{t('book_table')}</span>
          </button>

          {/* Discreet Luxury Language Toggle with 48px height touch container */}
          <div
            id="header-language-toggle"
            className="inline-flex items-center min-h-[48px] p-1 rounded-full border border-white/15 bg-neutral-950/80 backdrop-blur-md shadow-inner"
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
              className={`min-h-[40px] px-3.5 py-2 text-xs font-medium tracking-wide rounded-full transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
                language === 'ar'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              aria-pressed={language === 'ar'}
              title="التبديل إلى العربية"
            >
              عربي
            </button>
            <span className="w-px h-3 bg-white/10 mx-0.5" />
            <button
              type="button"
              id="header-lang-en"
              onClick={() => {
                if (language !== 'en') {
                  haptic.tab();
                  setLanguage('en');
                }
              }}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-medium tracking-wider rounded-full transition-all duration-150 focus:outline-none cursor-pointer font-serif-luxury active:scale-95 active:opacity-80 touch-press ${
                language === 'en'
                  ? 'bg-white text-black font-bold shadow-sm'
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
            className="relative min-h-[48px] min-w-[48px] p-3 rounded-full border border-white/20 bg-neutral-950/80 text-white hover:border-white/50 transition-all duration-150 focus:outline-none flex items-center justify-center cursor-pointer active:scale-95 active:opacity-80 touch-press"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-black animate-in fade-in zoom-in-75">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

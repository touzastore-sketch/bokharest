import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ShoppingBag, Globe, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, toggleLanguage, cartCount, setIsCartOpen, setIsReservationOpen, setActiveTab, t } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 select-none">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Tap to Home */}
        <button
          id="header-brand-btn"
          onClick={() => setActiveTab('home')}
          className="flex items-center text-left rtl:text-right focus:outline-none group"
          aria-label="Bokharest Black Home"
        >
          <BrandLogo variant="header" />
        </button>

        {/* Right Actions: Reservation, Language Switcher & Cart Button */}
        <div className="flex items-center gap-2">
          {/* Quick Book Table Button */}
          <button
            id="header-reservation-btn"
            onClick={() => setIsReservationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-neutral-950/80 text-xs font-semibold tracking-wider text-neutral-200 hover:text-white hover:border-white/50 transition-colors focus:outline-none min-h-[36px]"
            title={t('book_table')}
            aria-label="Book Table"
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{t('book_table')}</span>
          </button>

          {/* Language Switcher Button */}
          <button
            id="header-language-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-neutral-950/80 text-xs font-semibold tracking-wider text-neutral-300 hover:text-white hover:border-white/50 transition-colors focus:outline-none min-h-[36px]"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Quick Cart Order Button */}
          <button
            id="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full border border-white/20 bg-neutral-950/80 text-white hover:border-white/50 transition-colors focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
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

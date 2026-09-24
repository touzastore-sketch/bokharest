import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, UtensilsCrossed, ReceiptText, MoreHorizontal } from 'lucide-react';
import { haptic } from '../utils/haptics';

interface NavItem {
  id: 'home' | 'menu' | 'orders' | 'more';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, t, cartCount, theme } = useApp();
  const isLight = theme === 'light';

  const navItems: NavItem[] = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'menu', label: t('menu'), icon: UtensilsCrossed },
    { id: 'orders', label: t('orders'), icon: ReceiptText, badge: cartCount },
    { id: 'more', label: t('more'), icon: MoreHorizontal },
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className={`fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] select-none transition-colors duration-200 ${
        isLight
          ? 'bg-white/95 border-t border-neutral-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]'
          : 'bg-black/95 border-t border-white/10'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => {
                if (activeTab !== item.id) {
                  haptic.tab();
                }
                setActiveTab(item.id);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center min-h-[48px] min-w-[48px] h-full py-1.5 transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
                isActive
                  ? isLight
                    ? 'text-black'
                    : 'text-white'
                  : isLight
                  ? 'text-neutral-400 hover:text-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.6]'
                  }`} 
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-2.5 rtl:-left-2.5 rtl:right-auto text-[9px] font-extrabold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border shadow-sm ${
                    isLight ? 'bg-black text-white border-white' : 'bg-white text-black border-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-wide transition-colors duration-150 ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {item.label}
              </span>

              {/* Minimalist active dot indicator */}
              {isActive && (
                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                  isLight ? 'bg-black shadow-[0_0_6px_rgba(0,0,0,0.5)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

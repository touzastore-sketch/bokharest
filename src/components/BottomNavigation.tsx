import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, UtensilsCrossed, ReceiptText, MoreHorizontal } from 'lucide-react';

interface NavItem {
  id: 'home' | 'menu' | 'orders' | 'more';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, t, cartCount } = useApp();

  const navItems: NavItem[] = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'menu', label: t('menu'), icon: UtensilsCrossed },
    { id: 'orders', label: t('orders'), icon: ReceiptText, badge: cartCount },
    { id: 'more', label: t('more'), icon: MoreHorizontal },
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 transition-all duration-200 focus:outline-none ${
                isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.6]'
                  }`} 
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 rtl:-left-2.5 rtl:right-auto bg-white text-black text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-black shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 font-medium tracking-wide transition-colors duration-200 ${
                isActive ? 'text-white font-semibold' : 'text-neutral-500'
              }`}>
                {item.label}
              </span>

              {/* Minimalist active dot indicator */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

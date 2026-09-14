import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { haptic } from '../utils/haptics';

export const FloatingCartBar: React.FC = () => {
  const { cartCount, cartTotal, isCartOpen, setIsCartOpen, language } = useApp();

  // Show only if cart has items and the cart drawer is not currently open
  const isVisible = cartCount > 0 && !isCartOpen;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label={language === 'ar' ? 'سلة الطلب السريعة' : 'Quick Order Cart'}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] inset-x-0 z-30 pointer-events-none flex justify-center px-4 select-none"
        >
          <motion.div
            id="floating-cart-pill"
            initial={{ y: 35, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 25, opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptic.tab();
              setIsCartOpen(true);
            }}
            className="pointer-events-auto min-h-[48px] bg-[#101010]/95 backdrop-blur-xl border border-white/20 hover:border-white/40 text-white rounded-full py-2.5 ps-4 pe-2.5 flex items-center justify-between gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.08)] cursor-pointer w-full max-w-sm transition-all duration-150 group touch-press"
          >
            {/* Left / Info Cluster */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Animated Cart Icon with Badge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:bg-white/15 transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1.3, 1] }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto bg-white text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-black"
                >
                  {cartCount}
                </motion.span>
              </div>

              {/* Items & Total info */}
              <div className="flex flex-col text-start truncate leading-tight">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-white">
                    {language === 'ar' ? 'سلة الطلب' : 'Your Cart'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    ({cartCount} {language === 'ar' ? (cartCount === 1 ? 'صنف' : 'أصناف') : (cartCount === 1 ? 'item' : 'items')})
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1 mt-0.5">
                  <span>{cartTotal}</span>
                  <span className="text-[10px] font-sans text-neutral-400 font-normal">
                    {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right / CTA Pill */}
            <div className="flex items-center gap-1.5 bg-white text-black font-bold text-xs py-2 px-3.5 rounded-full group-hover:bg-neutral-200 transition-all shadow-md shrink-0">
              <span>{language === 'ar' ? 'تنفيذ الطلب' : 'Checkout'}</span>
              {language === 'ar' ? (
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};

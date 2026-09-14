import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useApp } from '../context/AppContext';
import { UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
import { Heart, Plus, Minus, Check } from 'lucide-react';
import { haptic } from '../utils/haptics';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { language, t, addToCart, cart, updateQuantity, isFavorite, toggleFavorite, setSelectedItemForDetail } = useApp();
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Check if item is already in cart
  const cartItem = cart.find(ci => ci.item.id === item.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.add();
    addToCart(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.stepper();
    updateQuantity(item.id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.stepper();
    updateQuantity(item.id, quantityInCart - 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.favorite();
    toggleFavorite(item.id);
  };

  const isFav = isFavorite(item.id);

  // Default unified menu image fallback if unavail
  const imageSrc = !imgError && item.image
    ? item.image
    : UNIFIED_MENU_ITEM_IMAGE;

  const primaryName = language === 'ar' ? item.name_ar : item.name_en;
  const secondaryName = language === 'ar' ? item.name_en : item.name_ar;
  const description = language === 'ar' ? item.description_ar : item.description_en;
  const badge = language === 'ar' ? item.badge_ar : item.badge_en;

  const isAvailable = item.available !== false;

  return (
    <div
      id={`menu-item-${item.id}`}
      onClick={() => {
        if (isAvailable) {
          setSelectedItemForDetail(item);
        }
      }}
      className={`group relative bg-[#0e0e0e] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between select-none ${
        isAvailable
          ? 'border-white/10 hover:border-white/30 cursor-pointer active:scale-[0.99]'
          : 'border-white/5 opacity-65 cursor-not-allowed filter grayscale-[30%]'
      }`}
    >
      {/* Image Container with 16:10 aspect ratio */}
      <div className="relative w-full aspect-[16/10] bg-neutral-900 overflow-hidden">
        <img
          src={imageSrc}
          alt={primaryName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isAvailable ? 'group-hover:scale-105' : 'filter brightness-75'
          }`}
        />

        {/* Unavailable Banner Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold tracking-wide shadow-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {language === 'ar' ? 'غير متوفر حالياً' : 'Currently Unavailable'}
            </span>
          </div>
        )}

        {/* Subtle Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Favorite Button */}
        {isAvailable && (
          <button
            onClick={handleFavorite}
            aria-label="Toggle favorite"
            className="absolute top-2 right-2 rtl:right-auto rtl:left-2 min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-all duration-150 focus:outline-none z-10 flex items-center justify-center active:scale-95 active:opacity-80 touch-press cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? 'fill-white text-white' : 'text-neutral-400 group-hover:text-white'
              }`}
            />
          </button>
        )}

        {/* Badges (Chef's choice, Signature, Hot/Cold) */}
        <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
          {badge && (
            <div className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold tracking-wider uppercase shadow-md">
              {badge}
            </div>
          )}
          {item.type && (
            <div className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-neutral-200 text-[10px] font-medium tracking-wide shadow-md">
              {item.type === 'hot' ? (language === 'ar' ? '🔥 ساخن' : '🔥 Hot') : (language === 'ar' ? '❄️ بارد' : '❄️ Cold')}
            </div>
          )}
        </div>

        {/* Price Tag Floating over image base */}
        <div className="absolute bottom-2.5 left-3 rtl:left-auto rtl:right-3 flex items-baseline gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
          <span className="font-serif-luxury text-base font-bold text-white tracking-tight">
            {item.price}
          </span>
          <span className="text-[11px] font-medium text-neutral-300">
            {t('egp')}
          </span>
        </div>
      </div>

      {/* Item Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base leading-snug group-hover:text-neutral-200 transition-colors">
              {primaryName}
            </h3>
          </div>

          <p className="text-[11px] text-neutral-500 font-medium tracking-wide mt-0.5">
            {secondaryName}
          </p>

          <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-light">
            {description}
          </p>
        </div>

        {/* Action Bar */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            {item.preparation_time || (language === 'ar' ? 'تحضير طازج' : 'Freshly made')}
          </span>

          {!isAvailable ? (
            <span className="px-3.5 py-2 rounded-full text-xs font-semibold bg-neutral-900 border border-white/10 text-neutral-500 cursor-not-allowed">
              {language === 'ar' ? 'غير متاح' : 'Unavailable'}
            </span>
          ) : quantityInCart === 0 ? (
            <button
              id={`add-btn-${item.id}`}
              onClick={handleAdd}
              className={`flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-150 focus:outline-none active:scale-95 active:opacity-80 touch-press ${
                justAdded
                  ? 'bg-white text-black'
                  : 'bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 cursor-pointer'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('added_to_cart')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t('add_to_order')}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/25 rounded-full p-1 min-h-[44px]">
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-white min-w-5 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

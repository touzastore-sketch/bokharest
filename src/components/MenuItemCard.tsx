import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Plus, Minus, Check } from 'lucide-react';

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
    addToCart(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantityInCart - 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  const isFav = isFavorite(item.id);

  // Default elegant fallback image if unavail
  const imageSrc = !imgError && item.image
    ? item.image
    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

  const primaryName = language === 'ar' ? item.name_ar : item.name_en;
  const secondaryName = language === 'ar' ? item.name_en : item.name_ar;
  const description = language === 'ar' ? item.description_ar : item.description_en;
  const badge = language === 'ar' ? item.badge_ar : item.badge_en;

  return (
    <div
      id={`menu-item-${item.id}`}
      onClick={() => setSelectedItemForDetail(item)}
      className="group relative bg-[#0e0e0e] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none active:scale-[0.99]"
    >
      {/* Image Container with 16:10 aspect ratio */}
      <div className="relative w-full aspect-[16/10] bg-neutral-900 overflow-hidden">
        <img
          src={imageSrc}
          alt={primaryName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          aria-label="Toggle favorite"
          className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-colors focus:outline-none z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'fill-white text-white' : 'text-neutral-400 group-hover:text-white'
            }`}
          />
        </button>

        {/* Badge (Chef's choice, Signature, etc.) */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold tracking-wider uppercase shadow-md">
            {badge}
          </div>
        )}

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

          {quantityInCart === 0 ? (
            <button
              id={`add-btn-${item.id}`}
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 focus:outline-none min-h-[34px] ${
                justAdded
                  ? 'bg-white text-black'
                  : 'bg-white/10 hover:bg-white hover:text-black text-white border border-white/20'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('added_to_cart')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add_to_order')}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/25 rounded-full px-2 py-1">
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors focus:outline-none"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-white min-w-4 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-6 h-6 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-colors focus:outline-none"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

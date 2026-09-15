import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
import { getOptimizedImageUrl } from '../services/cloudinaryService';
import { X, Heart, Plus, Minus, Check, Clock, Flame } from 'lucide-react';
import { CategoryServingNote } from './CategoryServingNote';
import { haptic } from '../utils/haptics';

export const ItemDetailModal: React.FC = () => {
  const {
    selectedItemForDetail,
    setSelectedItemForDetail,
    categories,
    language,
    t,
    addToCart,
    isFavorite,
    toggleFavorite,
  } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;
  const isFav = isFavorite(item.id);

  const itemCategory = categories.find((c) => c.id === item.category_id);
  const categoryNote = itemCategory
    ? language === 'ar'
      ? itemCategory.note_ar
      : itemCategory.note_en
    : undefined;

  const handleSelectOption = (option: string) => {
    haptic.selection();
    if (notes.includes(option)) {
      const updated = notes
        .replace(new RegExp(`(\\s*\\+\\s*)?${option}|${option}(\\s*\\+\\s*)?`), '')
        .trim();
      setNotes(updated);
    } else {
      setNotes(notes ? `${notes} + ${option}` : option);
    }
  };

  const handleClose = () => {
    setSelectedItemForDetail(null);
    setQuantity(1);
    setNotes('');
  };

  const handleAddToCart = () => {
    haptic.add();
    addToCart(item, quantity, notes);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      handleClose();
    }, 900);
  };

  const imageSrc = getOptimizedImageUrl(
    !imgError && item.image ? item.image : UNIFIED_MENU_ITEM_IMAGE
  );

  const totalPrice = item.price * quantity;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0d0d0d] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] select-none animate-in slide-in-from-bottom duration-300"
      >
        {/* Header Image */}
        <div className="relative w-full aspect-[16/10] bg-neutral-900">
          <img
            src={imageSrc}
            alt={item.name_en}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/60" />

          {/* Top Actions: Close & Favorite */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <button
              onClick={handleClose}
              aria-label="Close detail modal"
              className="min-h-[48px] min-w-[48px] p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-all duration-150 focus:outline-none flex items-center justify-center active:scale-95 active:opacity-80 touch-press cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                haptic.favorite();
                toggleFavorite(item.id);
              }}
              aria-label="Toggle favorite"
              className="min-h-[48px] min-w-[48px] p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-all duration-150 focus:outline-none flex items-center justify-center active:scale-95 active:opacity-80 touch-press cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFav ? 'fill-white text-white' : 'text-neutral-300'
                }`}
              />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2">
            {item.badge_en && (
              <div className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg">
                {language === 'ar' ? item.badge_ar : item.badge_en}
              </div>
            )}
            {item.type && (
              <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide shadow-lg">
                {item.type === 'hot' ? (language === 'ar' ? '🔥 ساخن' : '🔥 Hot') : (language === 'ar' ? '❄️ بارد' : '❄️ Cold')}
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-white tracking-wide">
              {language === 'ar' ? item.name_ar : item.name_en}
            </h2>
            <p className="text-sm font-arabic-luxury text-neutral-400 mt-1">
              {language === 'ar' ? item.name_en : item.name_ar}
            </p>
          </div>

          {/* Price & Meta Badges */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif-luxury text-3xl font-bold text-white">
                {item.price}
              </span>
              <span className="text-sm font-semibold text-neutral-400">
                {t('egp')}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              {item.preparation_time && (
                <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{item.preparation_time}</span>
                </div>
              )}
              {item.calories && (
                <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  <Flame className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{item.calories} cal</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-300 font-light">
              {language === 'ar' ? item.description_ar : item.description_en}
            </p>
          </div>

          {/* Serving Options Note (if category has one) */}
          {categoryNote && (
            <CategoryServingNote
              note={categoryNote}
              language={language}
              interactive={true}
              selectedOptions={notes ? notes.split('+').map((s) => s.trim()) : []}
              onSelectOption={handleSelectOption}
            />
          )}

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              {t('special_notes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notes_placeholder')}
              className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-neutral-300">
              {language === 'ar' ? 'الكمية' : 'Quantity'}
            </span>
            <div className="flex items-center gap-4 bg-neutral-900 border border-white/20 rounded-full px-3 py-1.5">
              <button
                onClick={() => {
                  haptic.stepper();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                aria-label="Decrease quantity"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors focus:outline-none"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-white min-w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => {
                  haptic.stepper();
                  setQuantity(quantity + 1);
                }}
                aria-label="Increase quantity"
                className="w-7 h-7 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-colors focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTA: Add to Order */}
        <div className="p-4 bg-black/90 border-t border-white/10 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
              {t('total')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif-luxury text-xl font-bold text-white">
                {totalPrice}
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {t('egp')}
              </span>
            </div>
          </div>

          <button
            id="modal-add-to-order-btn"
            onClick={handleAddToCart}
            disabled={!item.available}
            className={`flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 focus:outline-none cursor-pointer ${
              !item.available
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : added
                ? 'bg-white text-black shadow-lg shadow-white/20 active:scale-95 active:opacity-80 touch-press'
                : 'bg-white text-black hover:bg-neutral-200 active:scale-95 active:opacity-80 touch-press'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('added_to_cart')}</span>
              </>
            ) : !item.available ? (
              <span>{t('unavailable')}</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t('add_to_order')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

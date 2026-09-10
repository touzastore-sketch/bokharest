import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, Heart } from 'lucide-react';

export const ChefsSelection: React.FC = () => {
  const { menuItems, language, t, addToCart, isFavorite, toggleFavorite, setSelectedItemForDetail } = useApp();
  const [addedId, setAddedId] = useState<string | null>(null);

  // Filter featured items
  const featuredItems = menuItems.filter(item => item.featured && item.available);

  const handleAdd = (e: React.MouseEvent, item: typeof menuItems[0]) => {
    e.stopPropagation();
    addToCart(item, 1);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (featuredItems.length === 0) return null;

  return (
    <section className="py-8 select-none">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Exclusive Taste
          </span>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-wide mt-0.5">
            {t('chefs_selection')}
          </h2>
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          {featuredItems.length} {language === 'ar' ? 'أطباق مختارة' : 'curated items'}
        </span>
      </div>

      {/* Horizontally scrollable carousel */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x snap-mandatory">
        {featuredItems.map((item) => {
          const primaryName = language === 'ar' ? item.name_ar : item.name_en;
          const description = language === 'ar' ? item.description_ar : item.description_en;
          const badge = language === 'ar' ? item.badge_ar : item.badge_en;
          const isFav = isFavorite(item.id);
          const isAdded = addedId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItemForDetail(item)}
              className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-[#0d0d0d] border border-white/15 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden">
                <img
                  src={item.image}
                  alt={primaryName}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/40" />

                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors focus:outline-none z-10"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFav ? 'fill-white text-white' : 'text-neutral-300'
                    }`}
                  />
                </button>

                {badge && (
                  <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2.5 py-0.5 rounded-full bg-white text-black text-[9px] font-bold uppercase tracking-wider shadow">
                    {badge}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-neutral-200 transition-colors">
                    {primaryName}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed font-light">
                    {description}
                  </p>
                </div>

                {/* Price and Add button */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                      {item.price}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {t('egp')}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAdd(e, item)}
                    className={`p-2 rounded-full border transition-all duration-200 focus:outline-none ${
                      isAdded
                        ? 'bg-white text-black border-white'
                        : 'bg-white/10 hover:bg-white hover:text-black text-white border-white/20'
                    }`}
                    aria-label="Add to order"
                  >
                    {isAdded ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

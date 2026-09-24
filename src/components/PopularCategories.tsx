import React from 'react';
import { useApp } from '../context/AppContext';
import { Pizza, Utensils, Salad, Sandwich, Flame, Fish, Soup } from 'lucide-react';
import { haptic } from '../utils/haptics';

export const PopularCategories: React.FC = () => {
  const { categories, menuItems, language, t, setSelectedCategory, setActiveTab, theme } = useApp();
  const isLight = theme === 'light';

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'salads':
        return Salad;
      case 'tagines':
        return Soup;
      case 'beef_veal':
        return Flame;
      case 'fajita':
        return Flame;
      case 'pasta':
        return Utensils;
      case 'lebanese_appetizers':
        return Utensils;
      case 'sandwiches':
        return Sandwich;
      case 'chicken':
        return Utensils;
      case 'pizza':
        return Pizza;
      case 'seafood':
        return Fish;
      case 'bbq':
        return Flame;
      default:
        return Utensils;
    }
  };

  const handleSelectCategory = (catId: string) => {
    haptic.tab();
    setSelectedCategory(catId);
    setActiveTab('menu');
  };

  return (
    <section className="py-6 px-4 select-none">
      <div className="mb-4">
        <span className={`text-[10px] font-extrabold tracking-[0.3em] uppercase ${
          isLight ? 'text-amber-600' : 'text-neutral-400'
        }`}>
          Curated Menu
        </span>
        <h2 className={`font-serif-luxury text-xl sm:text-2xl font-black tracking-wide mt-0.5 ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}>
          {t('popular_categories')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.id);
          const name = language === 'ar' ? cat.name_ar : cat.name_en;
          const itemCount = menuItems.filter(i => i.category_id === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`min-h-[48px] p-4 rounded-2xl text-left rtl:text-right transition-all duration-150 group focus:outline-none active:scale-95 active:opacity-80 touch-press cursor-pointer ${
                isLight
                  ? 'bg-white border border-neutral-200 hover:border-black shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md'
                  : 'bg-[#0e0e0e] border border-white/10 hover:border-white/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors mb-3 ${
                isLight
                  ? 'bg-neutral-100 text-neutral-900 group-hover:bg-black group-hover:text-white'
                  : 'bg-white/5 border border-white/10 text-neutral-300 group-hover:text-white group-hover:bg-white/10'
              }`}>
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>

              <h3 className={`font-extrabold text-sm transition-colors ${
                isLight ? 'text-neutral-900 group-hover:text-black' : 'text-white group-hover:text-neutral-200'
              }`}>
                {name}
              </h3>

              <span className={`text-[11px] font-semibold mt-0.5 block ${
                isLight ? 'text-neutral-500' : 'text-neutral-500'
              }`}>
                {itemCount} {language === 'ar' ? 'أصناف' : 'items'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

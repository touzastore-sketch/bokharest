import React from 'react';
import { useApp } from '../context/AppContext';
import { Pizza, Utensils, Coffee, Wine, Cake, Salad, Sandwich, Flame } from 'lucide-react';

export const PopularCategories: React.FC = () => {
  const { categories, menuItems, language, t, setSelectedCategory, setActiveTab } = useApp();

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'salads':
        return Salad;
      case 'pastas':
        return Utensils;
      case 'pizzas':
        return Pizza;
      case 'sandwiches':
        return Sandwich;
      case 'platters':
        return Flame;
      case 'desserts':
        return Cake;
      case 'hot_drinks':
        return Coffee;
      case 'cold_drinks':
        return Wine;
      default:
        return Utensils;
    }
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setActiveTab('menu');
  };

  return (
    <section className="py-6 px-4 select-none">
      <div className="mb-4">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
          Curated Menu
        </span>
        <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-wide mt-0.5">
          {t('popular_categories')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.slice(0, 8).map((cat) => {
          const Icon = getCategoryIcon(cat.id);
          const name = language === 'ar' ? cat.name_ar : cat.name_en;
          const itemCount = menuItems.filter(i => i.category_id === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 hover:border-white/30 text-left rtl:text-right transition-all duration-200 group focus:outline-none active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-white/10 transition-colors mb-3">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-neutral-200 transition-colors">
                {name}
              </h3>

              <span className="text-[11px] text-neutral-500 font-medium mt-0.5 block">
                {itemCount} {language === 'ar' ? 'أصناف' : 'items'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

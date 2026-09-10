import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItemCard } from './MenuItemCard';
import { Search, X, Heart, SlidersHorizontal } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const MenuScreen: React.FC = () => {
  const {
    categories,
    menuItems,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    language,
    t,
    favorites,
  } = useApp();

  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Favorites filter
      if (onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }

      // Search query filter (search across Arabic and English names and descriptions)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesNameAr = item.name_ar.toLowerCase().includes(query);
        const matchesNameEn = item.name_en.toLowerCase().includes(query);
        const matchesDescAr = item.description_ar.toLowerCase().includes(query);
        const matchesDescEn = item.description_en.toLowerCase().includes(query);
        return matchesNameAr || matchesNameEn || matchesDescAr || matchesDescEn;
      }

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, onlyFavorites, favorites]);

  // Group items by category if "all" is selected and no search query
  const shouldGroup = selectedCategory === 'all' && !searchQuery.trim() && !onlyFavorites;

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto select-none animate-in fade-in duration-200">
      {/* Search Bar Header */}
      <div className="sticky top-16 z-30 bg-black/90 backdrop-blur-md pt-1 pb-3 -mx-4 px-4 border-b border-white/10 space-y-3">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="menu-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-[#111111] border border-white/15 rounded-2xl py-3 pl-11 pr-11 rtl:pr-11 rtl:pl-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-neutral-400 hover:text-white absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Favorites Filter Chip */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border focus:outline-none ${
              onlyFavorites
                ? 'bg-white text-black border-white'
                : 'bg-[#111111] text-neutral-400 border-white/15 hover:border-white/30'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-black' : ''}`} />
            <span>{t('favorites')}</span>
            {favorites.length > 0 && (
              <span className={`text-[10px] px-1 rounded-full ${onlyFavorites ? 'bg-black text-white' : 'bg-white/10 text-neutral-300'}`}>
                {favorites.length}
              </span>
            )}
          </button>

          {/* "All" Category Pill */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setOnlyFavorites(false);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border focus:outline-none ${
              selectedCategory === 'all' && !onlyFavorites
                ? 'bg-white text-black border-white'
                : 'bg-[#111111] text-neutral-400 border-white/15 hover:border-white/30'
            }`}
          >
            {t('all_categories')}
          </button>

          {/* Dynamic Categories List */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id && !onlyFavorites;
            const name = language === 'ar' ? cat.name_ar : cat.name_en;

            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOnlyFavorites(false);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border focus:outline-none ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-[#111111] text-neutral-400 border-white/15 hover:border-white/30'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Container */}
      <div className="mt-6 space-y-8">
        {filteredItems.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-white/15 flex items-center justify-center bg-white/5 mb-3">
              {onlyFavorites ? (
                <Heart className="w-6 h-6 text-neutral-400" />
              ) : (
                <Search className="w-6 h-6 text-neutral-400" />
              )}
            </div>
            <h3 className="font-bold text-white text-base">
              {onlyFavorites
                ? language === 'ar'
                  ? 'قائمة المفضلة فارغة حالياً'
                  : 'Your Favorites list is empty'
                : language === 'ar'
                ? 'لم يتم العثور على أطباق'
                : 'No menu items found'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
              {onlyFavorites
                ? language === 'ar'
                  ? 'اضغط على أيقونة القلب على أي طبق مميز في المنيو لإضافته لمفضلتك والرجوع إليه بسرعة'
                  : 'Tap the heart icon on any dish to save it to your favorites for quick access.'
                : language === 'ar'
                ? 'جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً'
                : 'Try different search keywords or choose another category.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyFavorites(false);
              }}
              className="mt-4 px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white hover:bg-white/10"
            >
              {onlyFavorites
                ? language === 'ar'
                  ? 'تصفح كافة الأصناف'
                  : 'Browse All Items'
                : language === 'ar'
                ? 'إعادة ضبط البحث'
                : 'Reset Search'}
            </button>
          </div>
        ) : shouldGroup ? (
          /* Grouped by Categories with Clear Premium Headings */
          categories.map((category) => {
            const itemsInCategory = menuItems.filter(
              (i) => i.category_id === category.id && i.available
            );
            if (itemsInCategory.length === 0) return null;

            const categoryName = language === 'ar' ? category.name_ar : category.name_en;

            return (
              <ScrollReveal key={category.id} yOffset={24} delay={0.04}>
                <section className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                    <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {categoryName}
                    </h2>
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="text-xs text-neutral-500 font-medium">
                      {itemsInCategory.length} {language === 'ar' ? 'أصناف' : 'items'}
                    </span>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {itemsInCategory.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            );
          })
        ) : (
          /* Single Flat Grid for Selected Category or Active Search */
          <ScrollReveal yOffset={20}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h2 className="font-serif-luxury text-xl font-bold text-white">
                  {onlyFavorites
                    ? t('favorites')
                    : selectedCategory === 'all'
                    ? language === 'ar'
                      ? 'نتائج البحث'
                      : 'Search Results'
                    : categories.find((c) => c.id === selectedCategory)?.[
                        language === 'ar' ? 'name_ar' : 'name_en'
                      ]}
                </h2>
                <span className="text-xs text-neutral-500">
                  {filteredItems.length} {language === 'ar' ? 'أصناف' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};

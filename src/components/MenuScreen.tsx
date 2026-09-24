import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItemCard } from './MenuItemCard';
import { Search, X, Heart, SlidersHorizontal, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { PullToRefresh } from './PullToRefresh';
import { CategoryServingNote } from './CategoryServingNote';
import { motion, AnimatePresence } from 'motion/react';
import { haptic } from '../utils/haptics';

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
    refreshMenu,
    isMenuRefreshing,
    pricingPolicy,
    theme,
  } = useApp();

  const isLight = theme === 'light';

  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = async () => {
    haptic.refresh();
    await refreshMenu();
    setJustRefreshed(true);
    setTimeout(() => {
      setJustRefreshed(false);
    }, 2800);
  };

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
      <div className={`sticky top-16 z-30 backdrop-blur-md pt-1 pb-3 -mx-4 px-4 border-b space-y-3 transition-colors ${
        isLight ? 'bg-white/95 border-neutral-200' : 'bg-black/90 border-white/10'
      }`}>
        {/* Search Input Box */}
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
            isLight ? 'text-neutral-400' : 'text-neutral-400'
          }`} />
          <input
            id="menu-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className={`w-full rounded-2xl py-3 pl-11 pr-11 rtl:pr-11 rtl:pl-11 text-sm focus:outline-none transition-colors border ${
              isLight
                ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 shadow-xs'
                : 'bg-[#111111] border-white/15 text-white placeholder-neutral-500 focus:border-white/50'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 rounded-full absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-neutral-400 hover:text-neutral-900' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1.5 px-0.5">
          {/* Favorites Filter Chip */}
          <button
            onClick={() => {
              haptic.favorite();
              setOnlyFavorites(!onlyFavorites);
            }}
            className={`flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press shadow-xs ${
              onlyFavorites
                ? 'bg-amber-400 text-black border-amber-400 shadow-amber-500/20'
                : isLight
                ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:border-neutral-400 hover:text-black'
                : 'bg-[#161616] text-neutral-200 border-white/20 hover:border-white/40 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-black' : isLight ? 'text-neutral-500' : 'text-neutral-400'}`} />
            <span>{t('favorites')}</span>
            {favorites.length > 0 && (
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                onlyFavorites ? 'bg-black text-amber-300' : isLight ? 'bg-neutral-200 text-neutral-900' : 'bg-white/15 text-white'
              }`}>
                {favorites.length}
              </span>
            )}
          </button>

          {/* "All" Category Pill */}
          <button
            onClick={() => {
              if (selectedCategory !== 'all' || onlyFavorites) {
                haptic.toggle();
              }
              setSelectedCategory('all');
              setOnlyFavorites(false);
            }}
            className={`min-h-[48px] px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press shadow-xs ${
              selectedCategory === 'all' && !onlyFavorites
                ? 'bg-amber-400 text-black border-amber-400 shadow-amber-500/20'
                : isLight
                ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:border-neutral-400 hover:text-black'
                : 'bg-[#161616] text-neutral-200 border-white/20 hover:border-white/40 hover:text-white'
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
                  if (selectedCategory !== cat.id || onlyFavorites) {
                    haptic.toggle();
                  }
                  setSelectedCategory(cat.id);
                  setOnlyFavorites(false);
                }}
                className={`min-h-[48px] px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press shadow-xs ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-400 shadow-amber-500/20'
                    : isLight
                    ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:border-neutral-400 hover:text-black'
                    : 'bg-[#161616] text-neutral-200 border-white/20 hover:border-white/40 hover:text-white'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Subtle Live Status & Manual Refresh Bar */}
        <div className={`flex items-center justify-between text-[11px] pt-0.5 px-0.5 ${
          isLight ? 'text-neutral-500' : 'text-neutral-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isMenuRefreshing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 opacity-75'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isMenuRefreshing ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            </span>
            <span className={`font-medium ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              {isMenuRefreshing
                ? t('refreshing_menu')
                : language === 'ar'
                ? 'قائمة اليوم الفاخرة'
                : "Today's Fine Dining Offerings"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] hidden sm:inline ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
              {language === 'ar' ? 'اسحب لأسفل للتحديث' : 'Pull down to refresh'}
            </span>
            <button
              id="menu-pull-refresh-trigger"
              onClick={handleRefresh}
              disabled={isMenuRefreshing}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all focus:outline-none cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-white/5 hover:bg-white/10 active:bg-white/20 border-white/10 hover:border-white/25 text-neutral-300 hover:text-white'
              }`}
              title={t('refresh_now')}
              aria-label={t('refresh_now')}
            >
              <RefreshCw className={`w-3 h-3 ${isMenuRefreshing ? 'animate-spin' : isLight ? 'text-neutral-600' : 'text-neutral-400'}`} />
              <span className="text-[11px] font-medium">{t('refresh_now')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pull-to-Refresh Wrapper */}
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isMenuRefreshing}>
        {/* Dynamic Visual Refresh Toast / Shimmer Confirmation */}
        <AnimatePresence>
          {justRefreshed && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className={`mt-4 mb-2 p-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-xs ${
                isLight
                  ? 'bg-white/95 border-neutral-300 shadow-neutral-900/10'
                  : 'bg-neutral-900/95 border-white/25'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-neutral-950 text-white' : 'bg-white text-black'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className={`font-bold tracking-wide ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                    {language === 'ar'
                      ? 'تم تحديث قائمة بوخارست بلاك الفاخرة'
                      : 'Bokharest Black Menu Refreshed'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {language === 'ar'
                      ? 'معروض الآن أحدث أطباق وتشكيلات الشيف الطازجة'
                      : "Presenting Chef's latest creations & seasonal selections"}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items Container */}
        <div className={`mt-5 space-y-8 transition-all duration-300 ${isMenuRefreshing ? 'filter brightness-90' : ''}`}>
          {/* Official Restaurant Tax & Pricing Notice */}
          <div className={`py-2.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-600 shadow-xs'
              : 'bg-[#111111] border-white/10 text-neutral-400'
          }`}>
            <span className="leading-relaxed">
              {language === 'ar' ? pricingPolicy.taxNotice_ar : pricingPolicy.taxNotice_en}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            /* Empty Search / Filter State */
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 ${
                isLight ? 'bg-neutral-100 border-neutral-300 text-neutral-500' : 'border-white/15 bg-white/5 text-neutral-400'
              }`}>
                {onlyFavorites ? (
                  <Heart className="w-6 h-6" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </div>
              <h3 className={`font-black text-base ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                {onlyFavorites
                  ? language === 'ar'
                    ? 'قائمة المفضلة فارغة حالياً'
                    : 'Your Favorites list is empty'
                  : language === 'ar'
                  ? 'لم يتم العثور على أطباق'
                  : 'No menu items found'}
              </h3>
              <p className={`text-xs mt-1 max-w-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
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
                className={`mt-4 px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                  isLight
                    ? 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
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
            /* Grouped by Categories with Clear Premium Headings and Notes */
            categories.map((category) => {
              const itemsInCategory = menuItems.filter(
                (i) => i.category_id === category.id && i.available
              );
              if (itemsInCategory.length === 0) return null;

              const categoryName = language === 'ar' ? category.name_ar : category.name_en;
              const categoryNote = language === 'ar' ? category.note_ar : category.note_en;

              return (
                <ScrollReveal key={category.id} yOffset={24} delay={0.04}>
                  <section className="space-y-4">
                    {/* Section Header */}
                    <div className={`border-b pb-2.5 ${isLight ? 'border-neutral-200' : 'border-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <h2 className={`font-serif-luxury text-xl sm:text-2xl font-black tracking-wide ${
                          isLight ? 'text-neutral-950' : 'text-white'
                        }`}>
                          {categoryName}
                        </h2>
                        <div className={`h-[1px] flex-1 ${isLight ? 'bg-neutral-200' : 'bg-white/10'}`} />
                        <span className={`text-xs font-semibold ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                          {itemsInCategory.length} {language === 'ar' ? 'أصناف' : 'items'}
                        </span>
                      </div>
                      {categoryNote && (
                        <CategoryServingNote note={categoryNote} language={language} />
                      )}
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
                {(() => {
                  const activeCat = categories.find((c) => c.id === selectedCategory);
                  const catNote = activeCat ? (language === 'ar' ? activeCat.note_ar : activeCat.note_en) : null;
                  return (
                    <div className={`border-b pb-2.5 ${isLight ? 'border-neutral-200' : 'border-white/10'}`}>
                      <div className="flex items-center justify-between">
                        <h2 className={`font-serif-luxury text-xl font-black ${
                          isLight ? 'text-neutral-950' : 'text-white'
                        }`}>
                          {onlyFavorites
                            ? t('favorites')
                            : selectedCategory === 'all'
                            ? language === 'ar'
                              ? 'نتائج البحث'
                              : 'Search Results'
                            : activeCat?.[language === 'ar' ? 'name_ar' : 'name_en']}
                        </h2>
                        <span className={`text-xs font-semibold ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                          {filteredItems.length} {language === 'ar' ? 'أصناف' : 'items'}
                        </span>
                      </div>
                      {catNote && (
                        <CategoryServingNote note={catNote} language={language} />
                      )}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

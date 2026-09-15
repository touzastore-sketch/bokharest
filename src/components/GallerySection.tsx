import React from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Maximize2 } from 'lucide-react';
import { getOptimizedImageUrl } from '../services/cloudinaryService';

export const GallerySection: React.FC = () => {
  const { language, openGallery, galleryImages } = useApp();

  return (
    <section className="px-4 py-8 select-none">
      {/* Clean Minimal Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <Camera className="w-4 h-4 text-neutral-300" />
          </div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-wide">
            {language === 'ar' ? 'معرض صور بوخارست' : 'Bokharest Gallery'}
          </h2>
        </div>

        <button
          id="open-full-gallery-btn"
          onClick={() => openGallery(0)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-medium tracking-wide transition-all active:scale-95 focus:outline-none cursor-pointer"
        >
          <span>{language === 'ar' ? 'عرض بالكامل' : 'View All'}</span>
        </button>
      </div>

      {/* Pure Luxury Photo Grid - No categories, no text clutter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {galleryImages.map((image, index) => {
          const isSpanTwo = index === 0;

          return (
            <div
              key={image.id}
              id={`gallery-item-${image.id}`}
              onClick={() => openGallery(index)}
              className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black/60 cursor-pointer shadow-md transition-all duration-300 hover:border-white/40 hover:shadow-2xl ${
                isSpanTwo ? 'col-span-2 row-span-2 aspect-[4/3] sm:aspect-[16/11]' : 'aspect-square'
              }`}
            >
              {/* Pure Photo */}
              <img
                src={getOptimizedImageUrl(image.url || image.localUrl)}
                onError={(e) => {
                  if (image.localUrl) {
                    (e.currentTarget as HTMLImageElement).src = getOptimizedImageUrl(image.localUrl);
                  }
                }}
                alt={language === 'ar' ? image.title_ar : image.title_en}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-106 filter brightness-95 group-hover:brightness-105"
                loading="lazy"
              />

              {/* Very subtle dark edge on hover with zoom icon only */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-200">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

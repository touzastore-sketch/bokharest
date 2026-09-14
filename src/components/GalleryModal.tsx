import React, { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles, Image as ImageIcon } from 'lucide-react';

export const GalleryModal: React.FC = () => {
  const {
    isGalleryOpen,
    setIsGalleryOpen,
    selectedGalleryIndex,
    setSelectedGalleryIndex,
    language,
    galleryImages,
  } = useApp();

  const totalImages = galleryImages.length;
  const currentImage = galleryImages[selectedGalleryIndex] || galleryImages[0];

  const handleNext = useCallback(() => {
    setSelectedGalleryIndex((selectedGalleryIndex + 1) % totalImages);
  }, [selectedGalleryIndex, setSelectedGalleryIndex, totalImages]);

  const handlePrev = useCallback(() => {
    setSelectedGalleryIndex((selectedGalleryIndex - 1 + totalImages) % totalImages);
  }, [selectedGalleryIndex, setSelectedGalleryIndex, totalImages]);

  const handleClose = useCallback(() => {
    setIsGalleryOpen(false);
  }, [setIsGalleryOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isGalleryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        if (language === 'ar') handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (language === 'ar') handleNext();
        else handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isGalleryOpen, handleClose, handleNext, handlePrev, language]);

  if (!isGalleryOpen || !currentImage) return null;

  return (
    <div 
      id="gallery-modal-overlay"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-in fade-in duration-300"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'gallery-modal-overlay') {
          handleClose();
        }
      }}
    >
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-300" />
          </div>
          <span className="text-xs font-serif-luxury tracking-[0.15em] uppercase font-bold text-white">
            Bokharest Gallery
          </span>
        </div>

        {/* Counter & Close Button */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-neutral-200">
            <span className="text-white font-bold">{String(selectedGalleryIndex + 1).padStart(2, '0')}</span>
            <span className="text-neutral-500 mx-1">/</span>
            <span>{String(totalImages).padStart(2, '0')}</span>
          </div>

          <button
            id="close-gallery-btn"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-150 active:scale-95 active:opacity-80 touch-press focus:outline-none cursor-pointer"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Navigation Arrow Left */}
        <button
          id="gallery-prev-btn"
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 z-20 min-h-[48px] min-w-[48px] w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all duration-150 active:scale-95 active:opacity-80 touch-press shadow-2xl focus:outline-none cursor-pointer group"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Image Container with high visual polish */}
        <div className="relative max-w-4xl max-h-[62vh] sm:max-h-[68vh] w-full h-full flex items-center justify-center">
          {/* Subtle Ambient Behind Glow */}
          <div className="absolute inset-0 bg-white/[0.04] blur-3xl rounded-full pointer-events-none" />

          <img
            key={currentImage.id}
            src={currentImage.url || currentImage.localUrl}
            onError={(e) => {
              if (currentImage.localUrl) {
                (e.currentTarget as HTMLImageElement).src = currentImage.localUrl;
              }
            }}
            alt={language === 'ar' ? currentImage.title_ar : currentImage.title_en}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] border border-white/10 select-none animate-in fade-in zoom-in-95 duration-200"
          />
        </div>

        {/* Navigation Arrow Right */}
        <button
          id="gallery-next-btn"
          onClick={handleNext}
          className="absolute right-2 sm:right-6 z-20 min-h-[48px] min-w-[48px] w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all duration-150 active:scale-95 active:opacity-80 touch-press shadow-2xl focus:outline-none cursor-pointer group"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip - Pure Photos */}
      <div className="relative z-20 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-2 no-scrollbar max-w-4xl mx-auto">
          {galleryImages.map((img, idx) => {
            const isActive = idx === selectedGalleryIndex;
            return (
              <button
                key={img.id}
                id={`thumb-${img.id}`}
                onClick={() => setSelectedGalleryIndex(idx)}
                className={`relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'border-white ring-2 ring-white/70 scale-105 opacity-100 shadow-lg' 
                    : 'border-white/20 opacity-40 hover:opacity-80 hover:border-white/40'
                }`}
              >
                <img
                  src={img.url || img.localUrl}
                  onError={(e) => {
                    if (img.localUrl) {
                      (e.currentTarget as HTMLImageElement).src = img.localUrl;
                    }
                  }}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

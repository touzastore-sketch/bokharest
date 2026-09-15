import React from 'react';
import { CLOUDINARY_ASSETS, getOptimizedImageUrl } from '../services/cloudinaryService';

const LOGO_SRC = getOptimizedImageUrl(CLOUDINARY_ASSETS.logo);
const LOGO_FALLBACK = getOptimizedImageUrl(CLOUDINARY_ASSETS.logoFallback);

interface BrandLogoProps {
  variant?: 'hero' | 'header' | 'icon' | 'splash';
  className?: string;
  imgClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'header', className = '', imgClassName = '' }) => {
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <img
          src={LOGO_SRC}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
          }}
          alt="Bokharest"
          className={`w-full h-full object-contain filter drop-shadow-md ${imgClassName}`}
        />
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        {/* Emblem with Logo */}
        <div className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center bg-black/80 shrink-0 p-1 overflow-hidden shadow-lg group-hover:border-white/50 transition-colors">
          <img
            src={LOGO_SRC}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
            }}
            alt="Bokharest Black"
            className="w-full h-full object-contain filter drop-shadow"
          />
        </div>
        {/* Typography */}
        <div className="flex flex-col text-left rtl:text-right leading-tight">
          <span className="font-serif-luxury text-sm tracking-[0.22em] font-bold text-white uppercase">
            Bokharest
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] tracking-[0.35em] text-neutral-400 font-semibold uppercase">
              Black
            </span>
            <span className="text-[10px] text-neutral-400 font-arabic-luxury font-medium">
              | بوخارست
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Official Brand Logo with Ambient Glow */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 mb-5 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white/[0.08] blur-2xl animate-pulse" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <img
              src={LOGO_SRC}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
              }}
              alt="Bokharest Black Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_40px_rgba(255,255,255,0.2)] transform transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        <h1 className="font-serif-luxury text-2xl tracking-[0.35em] font-bold text-white uppercase mb-1 drop-shadow-sm">
          Bokharest
        </h1>
        <p className="text-xs tracking-[0.6em] text-neutral-400 font-semibold uppercase mb-3">
          Black
        </p>

        <div className="flex items-center gap-3 my-1.5 w-36 justify-center">
          <div className="h-[1px] flex-1 bg-white/25" />
          <div className="w-1.5 h-1.5 rotate-45 bg-white/70" />
          <div className="h-[1px] flex-1 bg-white/25" />
        </div>

        <h2 className="font-arabic-luxury text-xl font-bold text-white mt-1">
          بوخارست بلاك
        </h2>
        <span className="font-arabic-luxury text-[11px] text-neutral-400 tracking-wider mt-1">
          مطعم وكافيه فاخر
        </span>
      </div>
    );
  }

  // Hero variant
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Official Brand Logo in Hero */}
      <div className="w-28 h-28 sm:w-36 sm:h-36 mb-4 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-white/[0.04] blur-xl" />
        <img
          src={LOGO_SRC}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
          }}
          alt="Bokharest Black Logo"
          className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
        />
      </div>

      <h1 className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.3em] font-bold text-white uppercase">
        Bokharest
      </h1>
      <p className="text-xs sm:text-sm tracking-[0.55em] text-neutral-400 font-semibold uppercase mt-1">
        Black
      </p>

      {/* Decorative hairline */}
      <div className="flex items-center gap-3 my-3 w-40 justify-center">
        <div className="h-[1px] flex-1 bg-white/25" />
        <div className="w-1.5 h-1.5 rotate-45 bg-white/60" />
        <div className="h-[1px] flex-1 bg-white/25" />
      </div>

      <h2 className="font-arabic-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-md">
        بوخارست بلاك
      </h2>
    </div>
  );
};


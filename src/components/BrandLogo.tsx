import React from 'react';
import { useApp } from '../context/AppContext';
import { CLOUDINARY_ASSETS, getOptimizedImageUrl } from '../services/cloudinaryService';

const LOGO_SRC = getOptimizedImageUrl(CLOUDINARY_ASSETS.logo);
const LOGO_FALLBACK = getOptimizedImageUrl(CLOUDINARY_ASSETS.logoFallback);

interface BrandLogoProps {
  variant?: 'hero' | 'header' | 'icon' | 'splash';
  className?: string;
  imgClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'header', className = '', imgClassName = '' }) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

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
      <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
        {/* Emblem with Logo */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-sm transition-colors ${
          isLight 
            ? 'border border-neutral-300 bg-white group-hover:border-black' 
            : 'border border-white/25 bg-black/80 group-hover:border-white/50 shadow-lg'
        }`}>
          <img
            src={LOGO_SRC}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
            }}
            alt="Bokharest Black"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Typography */}
        <div className="flex flex-col text-left rtl:text-right leading-tight">
          <span className={`font-serif-luxury text-sm tracking-[0.22em] font-extrabold uppercase ${
            isLight ? 'text-black' : 'text-white'
          }`}>
            Bokharest
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] tracking-[0.35em] font-bold uppercase ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}>
              Black
            </span>
            <span className={`text-[10px] font-arabic-luxury font-bold ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}>
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
          <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
            isLight ? 'bg-amber-400/20' : 'bg-white/[0.08]'
          }`} />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <img
              src={LOGO_SRC}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
              }}
              alt="Bokharest Black Logo"
              className={`w-full h-full object-contain transform transition-transform duration-700 ease-out ${
                isLight
                  ? 'filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.15)]'
                  : 'filter drop-shadow-[0_12px_40px_rgba(255,255,255,0.2)]'
              }`}
            />
          </div>
        </div>

        <h1 className={`font-serif-luxury text-2xl tracking-[0.35em] font-black uppercase mb-1 ${
          isLight ? 'text-black' : 'text-white drop-shadow-sm'
        }`}>
          Bokharest
        </h1>
        <p className={`text-xs tracking-[0.6em] font-bold uppercase mb-3 ${
          isLight ? 'text-neutral-600' : 'text-neutral-400'
        }`}>
          Black
        </p>

        <div className="flex items-center gap-3 my-1.5 w-36 justify-center">
          <div className={`h-[1px] flex-1 ${isLight ? 'bg-black/20' : 'bg-white/25'}`} />
          <div className={`w-1.5 h-1.5 rotate-45 ${isLight ? 'bg-amber-500' : 'bg-white/70'}`} />
          <div className={`h-[1px] flex-1 ${isLight ? 'bg-black/20' : 'bg-white/25'}`} />
        </div>

        <h2 className={`font-arabic-luxury text-xl font-black mt-1 ${
          isLight ? 'text-black' : 'text-white'
        }`}>
          بوخارست بلاك
        </h2>
        <span className={`font-arabic-luxury text-[11px] tracking-wider mt-1 font-semibold ${
          isLight ? 'text-neutral-600' : 'text-neutral-400'
        }`}>
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
        <div className={`absolute inset-0 rounded-full blur-xl ${
          isLight ? 'bg-amber-500/10' : 'bg-white/[0.04]'
        }`} />
        <img
          src={LOGO_SRC}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
          }}
          alt="Bokharest Black Logo"
          className={`w-full h-full object-contain relative z-10 ${
            isLight
              ? 'filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
              : 'filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]'
          }`}
        />
      </div>

      <h1 className={`font-serif-luxury text-2xl sm:text-3xl tracking-[0.3em] font-black uppercase ${
        isLight ? 'text-neutral-950' : 'text-white'
      }`}>
        Bokharest
      </h1>
      <p className={`text-xs sm:text-sm tracking-[0.55em] font-bold uppercase mt-1 ${
        isLight ? 'text-neutral-600' : 'text-neutral-400'
      }`}>
        Black
      </p>

      {/* Decorative hairline */}
      <div className="flex items-center gap-3 my-3 w-40 justify-center">
        <div className={`h-[1px] flex-1 ${isLight ? 'bg-neutral-300' : 'bg-white/25'}`} />
        <div className={`w-1.5 h-1.5 rotate-45 ${isLight ? 'bg-amber-500' : 'bg-white/60'}`} />
        <div className={`h-[1px] flex-1 ${isLight ? 'bg-neutral-300' : 'bg-white/25'}`} />
      </div>

      <h2 className={`font-arabic-luxury text-2xl sm:text-3xl md:text-4xl font-black tracking-wide ${
        isLight ? 'text-neutral-950' : 'text-white drop-shadow-md'
      }`}>
        بوخارست بلاك
      </h2>
    </div>
  );
};


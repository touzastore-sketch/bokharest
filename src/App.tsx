import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { MoreScreen } from './components/MoreScreen';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Reservations } from './components/Reservations';
import { GalleryModal } from './components/GalleryModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { ImageUploadCenterModal } from './components/ImageUploadCenterModal';
import { ImageMigrationModal } from './components/ImageMigrationModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CLOUDINARY_ASSETS, getOptimizedImageUrl } from './services/cloudinaryService';

const AppContent: React.FC = () => {
  const {
    language,
    theme,
    activeTab,
    selectedItemForDetail,
    setSelectedItemForDetail,
    isCartOpen,
    setIsCartOpen,
    isReservationOpen,
    setIsReservationOpen,
    isGalleryOpen,
    setIsGalleryOpen,
    isImageUploadCenterOpen,
    setIsImageUploadCenterOpen,
    isAdminOpen,
    closeAdmin,
  } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  // Standalone Admin Route detection (/admin or #/admin or ?view=admin)
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.startsWith('#/admin') ||
      search.includes('view=admin') ||
      search.includes('page=admin') ||
      search.includes('admin=true')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleRouteCheck = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);
    return () => {
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  // Android back button / history handling
  useEffect(() => {
    const handlePopState = () => {
      if (isAdminOpen || isAdminRoute) {
        closeAdmin();
        setIsAdminRoute(false);
      } else if (isImageUploadCenterOpen) {
        setIsImageUploadCenterOpen(false);
      } else if (isGalleryOpen) {
        setIsGalleryOpen(false);
      } else if (selectedItemForDetail) {
        setSelectedItemForDetail(null);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isReservationOpen) {
        setIsReservationOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminOpen, isAdminRoute, closeAdmin, selectedItemForDetail, isCartOpen, isReservationOpen, isGalleryOpen, isImageUploadCenterOpen, setSelectedItemForDetail, setIsCartOpen, setIsReservationOpen, setIsGalleryOpen, setIsImageUploadCenterOpen]);

  // If visiting /admin route or opened via app state, render standalone Admin Dashboard directly
  if (isAdminOpen || isAdminRoute) {
    return (
      <AdminDashboard
        onClose={() => {
          closeAdmin();
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div 
      id="app-root"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col justify-between relative overflow-x-hidden transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#f8f9fa] text-neutral-900 selection:bg-neutral-200 selection:text-black'
          : 'bg-black text-white selection:bg-neutral-800 selection:text-white'
      }`}
    >
      {/* 15. Splash Screen (Loading Screen) with the Official Brand Logo */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Luxury Brand Logo Background for the Entire App (from top to bottom) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none"
      >
        {/* Soft luxury ambient backdrop radial lighting */}
        <div 
          className={`absolute inset-0 pointer-events-none ${
            theme === 'light'
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.015)_0%,rgba(248,249,250,0.95)_80%)]'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.85)_80%)]'
          }`} 
        />

        {/* Central Prominent Brand Watermark Emblem */}
        <div 
          className={`w-[90vw] max-w-[620px] aspect-square select-none pointer-events-none flex items-center justify-center ${
            theme === 'light'
              ? 'opacity-[0.035] filter grayscale contrast-125'
              : 'opacity-[0.11] filter drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]'
          }`}
        >
          <img
            src={getOptimizedImageUrl(CLOUDINARY_ASSETS.logo)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getOptimizedImageUrl(CLOUDINARY_ASSETS.logoFallback);
            }}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Main Top Header */}
      <Header />

      {/* Main Screen Views */}
      <main className="flex-1 w-full max-w-4xl mx-auto overflow-x-hidden relative z-10">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'menu' && <MenuScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'more' && <MoreScreen />}
      </main>

      {/* Item Detail Modal (Section 7) */}
      <ItemDetailModal />

      {/* Shopping Cart Drawer / Order System (Section 8 & 9 & 25) */}
      <CartDrawer />

      {/* Table Reservations Modal / WhatsApp Booking System */}
      <Reservations isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} isModal={true} />

      {/* Fullscreen Interactive Luxury Gallery Lightbox */}
      <GalleryModal />

      {/* Firebase Storage Image Upload Center Modal */}
      <ImageUploadCenterModal
        isOpen={isImageUploadCenterOpen}
        onClose={() => setIsImageUploadCenterOpen(false)}
      />

      {/* Direct Cloud Image Migration Live Progress Modal */}
      <ImageMigrationModal />

      {/* Floating Quick Order Cart Pill (appears when items are added) */}
      <FloatingCartBar />

      {/* 4. Main Bottom Navigation Bar */}
      <BottomNavigation />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

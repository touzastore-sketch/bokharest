import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
import { getOptimizedImageUrl } from '../services/cloudinaryService';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Send,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ClipboardList,
  Receipt,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { haptic } from '../utils/haptics';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartServiceCharge,
    cartVat,
    cartTotal,
    pricingPolicy,
    customerInfo,
    setCustomerInfo,
    sendWhatsAppOrder,
    language,
    t,
    setActiveTab,
    restaurantInfo,
    theme,
  } = useApp();

  const isLight = theme === 'light';

  const [activeStep, setActiveStep] = useState<'items' | 'details'>('items');
  const [orderSentUrl, setOrderSentUrl] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setOrderSentUrl(null);
    setOrderMessage(null);
    setActiveStep('items');
    setPhoneError(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (activeStep === 'items') {
      setActiveStep('details');
      return;
    }

    // Gentle phone validation (if entered, check minimum length)
    const phoneDigits = (customerInfo.phone || '').replace(/\D/g, '');
    if (customerInfo.phone && phoneDigits.length < 8) {
      setPhoneError(true);
      return;
    }

    // Trigger high-quality celebratory haptic feedback
    haptic.order();

    // Trigger WhatsApp order
    const result = sendWhatsAppOrder();
    if (result.success) {
      setOrderSentUrl(result.url);
      setOrderMessage(result.message);

      // تفريغ السلة أوتوماتيكياً بمجرد إتمام الطلب بنجاح
      clearCart();

      // Attempt to launch WhatsApp
      try {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback handled by modal UI
      }
    }
  };

  const handleCopy = () => {
    if (orderMessage) {
      haptic.toggle();
      navigator.clipboard.writeText(orderMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const BackArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const totalItemsCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200 overscroll-contain"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between shadow-2xl animate-in slide-in-from-right rtl:slide-in-from-left duration-300 select-none overflow-hidden overscroll-contain transition-colors ${
          isLight
            ? 'bg-white border-l rtl:border-r rtl:border-l-0 border-neutral-200'
            : 'bg-[#0a0a0a] border-l rtl:border-r rtl:border-l-0 border-white/15'
        }`}
      >
        {/* Top Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 transition-colors ${
          isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-black/80 border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            <h2 className={`font-serif-luxury text-xl font-black tracking-wide ${
              isLight ? 'text-neutral-950' : 'text-white'
            }`}>
              {t('your_order')}
            </h2>
            {cart.length > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full shadow-sm ${
                isLight ? 'bg-amber-600 text-white' : 'bg-amber-400 text-black'
              }`}>
                {totalItemsCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  haptic.stepper();
                  clearCart();
                }}
                className={`min-h-[40px] px-2.5 py-1.5 text-xs transition-all duration-150 flex items-center gap-1.5 rounded-xl focus:outline-none cursor-pointer active:scale-95 active:opacity-80 ${
                  isLight
                    ? 'text-neutral-500 hover:text-red-600 hover:bg-neutral-100'
                    : 'text-neutral-400 hover:text-red-400 hover:bg-white/5'
                }`}
                title={t('clear_order')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">{t('clear_order')}</span>
              </button>
            )}

            <button
              onClick={() => {
                haptic.tab();
                handleClose();
              }}
              aria-label="Close cart"
              className={`min-h-[40px] min-w-[40px] p-2 rounded-full transition-all duration-150 focus:outline-none cursor-pointer flex items-center justify-center active:scale-95 active:opacity-80 ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two Step Navigation Tabs (if cart has items and not order success) */}
        {cart.length > 0 && !orderSentUrl && (
          <div className={`flex border-b px-4 pt-2.5 gap-2 shrink-0 transition-colors ${
            isLight ? 'border-neutral-200 bg-neutral-100' : 'border-white/10 bg-neutral-950/90'
          }`}>
            <button
              type="button"
              onClick={() => {
                haptic.tab();
                setActiveStep('items');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeStep === 'items'
                  ? isLight
                    ? 'border-neutral-900 text-neutral-950 bg-white shadow-sm'
                    : 'border-amber-400 text-amber-300 bg-[#141414] shadow-sm'
                  : isLight
                  ? 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>{language === 'ar' ? `الأصناف (${totalItemsCount})` : `Items (${totalItemsCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                haptic.tab();
                setActiveStep('details');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeStep === 'details'
                  ? isLight
                    ? 'border-neutral-900 text-neutral-950 bg-white shadow-sm'
                    : 'border-amber-400 text-amber-300 bg-[#141414] shadow-sm'
                  : isLight
                  ? 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>{language === 'ar' ? 'بياناتك والتأكيد' : 'Details & Checkout'}</span>
              {(customerInfo.name || customerInfo.phone || customerInfo.address) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 scroll-smooth ${
            activeStep === 'details' ? 'pb-48 sm:pb-52' : 'pb-28 sm:pb-32'
          }`}
        >
          {/* If an order was just placed, show confirmation card */}
          {orderSentUrl && orderMessage ? (
            <div className="bg-[#121212] border border-white/20 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-lg">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {t('order_sent_success')}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {language === 'ar'
                      ? 'تم إرسال سلة طلبك بنجاح وحفظها في سجل (طلباتي).'
                      : 'Cart has been sent and your order is saved in My Orders.'}
                  </p>
                </div>
              </div>

              {/* Order Message Preview */}
              <div
                className="bg-black/80 rounded-xl p-3 border border-white/10 font-mono text-[11px] text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text"
                dir="ltr"
              >
                {orderMessage}
              </div>

              {/* Actions & WhatsApp Web Fallback */}
              <div className="space-y-2 pt-2">
                <a
                  href={orderSentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('open_whatsapp_web')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors focus:outline-none cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span>{t('copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('copy_order')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      handleClose();
                      setActiveTab('orders');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'سجل طلباتي' : 'My Orders'}</span>
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق ومتابعة التصفح' : 'Close & Continue Browsing'}
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart View */
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className={`w-20 h-20 rounded-full border flex items-center justify-center mb-4 shadow-inner ${
                isLight ? 'border-neutral-300 bg-neutral-100 text-neutral-600' : 'border-white/15 bg-white/5 text-neutral-400'
              }`}>
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className={`font-serif-luxury text-xl font-bold mb-1 ${
                isLight ? 'text-neutral-900' : 'text-white'
              }`}>
                {t('empty_cart_title')}
              </h3>
              <p className={`text-xs max-w-xs leading-relaxed mb-6 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}>
                {t('empty_cart_desc')}
              </p>
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('menu');
                }}
                className={`min-h-[48px] px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center gap-2 active:scale-95 active:opacity-80 cursor-pointer shadow-lg ${
                  isLight
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/20'
                }`}
              >
                <span>{t('view_menu')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          ) : activeStep === 'items' ? (
            /* STEP 1: Items List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className={isLight ? 'text-neutral-600 font-semibold' : 'text-neutral-400'}>
                  {language === 'ar' ? 'الأصناف المضافة للطلب' : 'Added Order Items'}
                </span>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400/90'}`}>
                  {language === 'ar' ? 'اضغط + أو - لتعديل الكمية' : 'Use +/- to adjust qty'}
                </span>
              </div>

              {cart.map((cartItem) => {
                const { item, quantity, notes } = cartItem;
                const name = language === 'ar' ? item.name_ar : item.name_en;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl flex items-center gap-3 transition-all shadow-sm border ${
                      isLight
                        ? 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                        : 'bg-[#121212] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Thumbnail */}
                    <img
                      src={getOptimizedImageUrl(item.image || UNIFIED_MENU_ITEM_IMAGE)}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200/50"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          {name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 rounded-md transition-colors"
                          title={language === 'ar' ? 'حذف الصنف' : 'Remove item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className={`text-xs mt-0.5 flex items-baseline gap-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        <span className={`font-serif-luxury font-black text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                          {(item.price * quantity).toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{t('egp')}</span>
                        {quantity > 1 && (
                          <span className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            ({item.price} {t('egp')} / {language === 'ar' ? 'قطعة' : 'ea'})
                          </span>
                        )}
                      </div>

                      {/* Display Serving Option Note if chosen */}
                      {notes && (
                        <div className="mt-1">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-lg max-w-full truncate font-medium border ${
                            isLight
                              ? 'text-amber-900 bg-amber-100 border-amber-300'
                              : 'text-amber-300/90 bg-amber-500/15 border-amber-500/25'
                          }`}>
                            {notes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className={`flex items-center gap-1.5 border rounded-full p-1 shrink-0 ${
                      isLight ? 'bg-neutral-100 border-neutral-300' : 'bg-black border-white/20'
                    }`}>
                      <button
                        onClick={() => {
                          haptic.stepper();
                          updateQuantity(item.id, quantity - 1);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 ${
                          isLight
                            ? 'bg-white hover:bg-neutral-200 text-neutral-900 shadow-xs'
                            : 'bg-white/10 hover:bg-white hover:text-black text-white'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-xs font-black min-w-5 text-center ${
                        isLight ? 'text-neutral-950' : 'text-white'
                      }`}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          haptic.stepper();
                          updateQuantity(item.id, quantity + 1);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 font-bold ${
                          isLight
                            ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                            : 'bg-amber-400 text-black hover:bg-amber-300'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Call-to-action button to step 2 inside the list */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    haptic.tab();
                    setActiveStep('details');
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md ${
                    isLight
                      ? 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-neutral-900/15'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20'
                  }`}
                >
                  <span>{language === 'ar' ? 'متابعة واستكمال بيانات الطلب' : 'Proceed to Order Details'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Customer Information & Final Invoice Details */
            <div className="flex flex-col gap-4">
              {/* Selected Items Quick Recap Header */}
              <div className={`p-3 border rounded-2xl flex items-center justify-between text-xs ${
                isLight ? 'bg-neutral-100 border-neutral-200 text-neutral-800' : 'bg-[#141414] border-white/10 text-neutral-300'
              }`}>
                <div className="flex items-center gap-2">
                  <ClipboardList className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span className="font-semibold">
                    {language === 'ar'
                      ? `تم اختيار ${totalItemsCount} أصناف في السلة`
                      : `${totalItemsCount} items selected in cart`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep('items')}
                  className={`text-xs font-bold underline cursor-pointer shrink-0 ${
                    isLight ? 'text-neutral-900 hover:text-black' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  {language === 'ar' ? 'تعديل الأصناف ←' : 'Edit items →'}
                </button>
              </div>

              {/* Customer Information Card (Spacious, flexible layout with full keyboard tolerance) */}
              <div className={`p-4 sm:p-5 rounded-3xl flex flex-col gap-4 sm:gap-5 shadow-sm border ${
                isLight
                  ? 'bg-white border-neutral-300 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
                  : 'bg-[#121212] border-2 border-amber-500/40 shadow-2xl'
              }`}>
                {/* Section Header */}
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-neutral-200' : 'border-white/10'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isLight
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-black flex items-center gap-2 ${
                        isLight ? 'text-neutral-950' : 'text-white'
                      }`}>
                        <span>{language === 'ar' ? 'بيانات العميل والتوصيل' : 'Customer & Delivery Info'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isLight
                            ? 'bg-neutral-200 text-neutral-800'
                            : 'bg-amber-400/25 text-amber-300'
                        }`}>
                          {language === 'ar' ? 'تأكيد الطلب' : 'Checkout'}
                        </span>
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${
                        isLight ? 'text-neutral-500' : 'text-neutral-400'
                      }`}>
                        {language === 'ar'
                          ? 'أدخل بياناتك وسيتم إرسال الطلب مباشرة إلى واتساب بوخارست بلاك'
                          : 'Enter your details to confirm your order directly on WhatsApp'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields Container */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  {/* Field 1: Customer Name */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <label htmlFor="customer-name-field" className={`flex items-center gap-1.5 ${
                        isLight ? 'text-neutral-900' : 'text-neutral-200'
                      }`}>
                        <User className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-700' : 'text-amber-400'}`} />
                        <span>{t('customer_name')}</span>
                      </label>
                      <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {language === 'ar' ? 'الاسم الكريم' : 'Full Name'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="customer-name-field"
                        type="text"
                        autoComplete="name"
                        value={customerInfo.name}
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder={language === 'ar' ? 'اكتب اسمك هنا (مثال: أحمد محمد)' : 'e.g. Ahmed Mohamed'}
                        className={`w-full min-h-[50px] sm:min-h-[46px] border rounded-xl px-4 py-3 text-base sm:text-sm transition-all shadow-inner focus:outline-none ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10'
                            : 'bg-black/90 border-white/20 text-white placeholder:text-neutral-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Field 2: Customer Phone */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <label htmlFor="customer-phone-field" className={`flex items-center gap-1.5 ${
                        isLight ? 'text-neutral-900' : 'text-neutral-200'
                      }`}>
                        <Phone className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-700' : 'text-amber-400'}`} />
                        <span>{t('customer_phone')}</span>
                      </label>
                      <span className={`text-[10px] font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                        {language === 'ar' ? 'مطلوب للتواصل والتأكيد' : 'Required'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="customer-phone-field"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        dir="ltr"
                        value={customerInfo.phone}
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }}
                        onChange={(e) => {
                          setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }));
                          if (phoneError) setPhoneError(false);
                        }}
                        placeholder="010XXXXXXXX"
                        className={`w-full min-h-[50px] sm:min-h-[46px] border rounded-xl px-4 py-3 text-base sm:text-sm font-mono text-left shadow-inner transition-all focus:outline-none focus:ring-2 ${
                          phoneError
                            ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20'
                            : isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-neutral-900/10'
                            : 'bg-black/90 border-white/20 text-white placeholder:text-neutral-500 focus:border-amber-400 focus:ring-amber-400/25'
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] text-red-500 mt-0.5 font-bold">
                        {language === 'ar'
                          ? 'يرجى إدخال رقم هاتف صحيح للتواصل'
                          : 'Please enter a valid contact phone number'}
                      </p>
                    )}
                  </div>

                  {/* Field 3: Delivery Address (عنوان التوصيل) */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <label htmlFor="customer-address-field" className={`flex items-center gap-1.5 ${
                        isLight ? 'text-neutral-900' : 'text-neutral-200'
                      }`}>
                        <MapPin className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-700' : 'text-amber-400'}`} />
                        <span>{language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}</span>
                      </label>
                      <span className={`text-[10px] font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                        {language === 'ar' ? 'مطلوب للتوصيل' : 'For Delivery'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="customer-address-field"
                        type="text"
                        autoComplete="street-address"
                        value={customerInfo.address || ''}
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder={
                          language === 'ar'
                            ? 'المنطقة، الشارع، رقم العمارة، الشقة / علامة مميزة...'
                            : 'Area, street name, building no., floor / apartment...'
                        }
                        className={`w-full min-h-[50px] sm:min-h-[46px] border rounded-xl px-4 py-3 text-base sm:text-sm transition-all shadow-inner focus:outline-none focus:ring-2 ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-neutral-900/10'
                            : 'bg-black/90 border-white/20 text-white placeholder:text-neutral-500 focus:border-amber-400 focus:ring-amber-400/25'
                        }`}
                      />
                    </div>
                    <p className={`text-[11px] leading-normal ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {language === 'ar'
                        ? '📍 سيتم إرفاق العنوان تلقائياً في رسالة الطلب لتسليمه لك في أسرع وقت.'
                        : '📍 The delivery address will be included in your order message.'}
                    </p>
                  </div>

                  {/* Field 4: Special Notes */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <label htmlFor="customer-notes-field" className={`flex items-center gap-1.5 ${
                        isLight ? 'text-neutral-900' : 'text-neutral-200'
                      }`}>
                        <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-700' : 'text-amber-400'}`} />
                        <span>{t('special_notes')}</span>
                      </label>
                      <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {language === 'ar' ? 'كتابة مباشرة' : 'Direct writing'}
                      </span>
                    </div>

                    <textarea
                      id="customer-notes-field"
                      rows={4}
                      value={customerInfo.notes}
                      onFocus={(e) => {
                        setTimeout(() => {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 150);
                      }}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder={
                        language === 'ar'
                          ? 'اكتب أي ملاحظات أو تفضيلات خاصة بالطلب أو عنوان التوصيل أو تحضير المأكولات والمشروبات...'
                          : 'Write any special notes, order preferences, delivery instructions, or food preparation details...'
                      }
                      className={`w-full min-h-[110px] border rounded-xl px-4 py-3 text-base sm:text-sm resize-y shadow-inner leading-relaxed transition-all focus:outline-none focus:ring-2 ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-neutral-900/10'
                          : 'bg-black/90 border-white/20 text-white placeholder:text-neutral-500 focus:border-amber-400 focus:ring-amber-400/25'
                      }`}
                    />

                    <p className={`text-[11px] leading-normal ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {language === 'ar'
                        ? '✍️ الملاحظات ستصل مع رسالة الطلب على الواتساب ليتم تنفيذها في المطبخ/البار.'
                        : '✍️ Notes will be attached to your WhatsApp order message for our kitchen/bar team.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Summary Card with Collapsible Tax/Fee Breakdown */}
              <div className={`p-4 border rounded-2xl flex flex-col gap-3 ${
                isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#121212] border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${
                    isLight ? 'text-neutral-900' : 'text-neutral-200'
                  }`}>
                    <Receipt className={`w-4 h-4 ${isLight ? 'text-neutral-700' : 'text-amber-400'}`} />
                    <span>{language === 'ar' ? 'ملخص الحساب' : 'Bill Summary'}</span>
                  </div>

                  {/* Toggle breakdown details */}
                  <button
                    type="button"
                    onClick={() => setShowBillDetails((prev) => !prev)}
                    className={`text-[11px] flex items-center gap-1 font-bold cursor-pointer ${
                      isLight ? 'text-neutral-700 hover:text-black' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <span>
                      {showBillDetails
                        ? language === 'ar'
                          ? 'إخفاء التفاصيل'
                          : 'Hide details'
                        : language === 'ar'
                        ? pricingPolicy.serviceChargeEnabled || pricingPolicy.vatEnabled
                          ? 'عرض تفاصيل الخدمة والضريبة'
                          : 'عرض تفاصيل الحساب'
                        : pricingPolicy.serviceChargeEnabled || pricingPolicy.vatEnabled
                        ? 'Show fee breakdown'
                        : 'Show bill breakdown'}
                    </span>
                    {showBillDetails ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Main Total Highlight */}
                <div className={`flex items-baseline justify-between pt-1 border-t ${
                  isLight ? 'border-neutral-200' : 'border-white/10'
                }`}>
                  <div>
                    <span className={`text-sm font-bold block ${isLight ? 'text-neutral-900' : 'text-white'}`}>{t('total')}</span>
                    <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {pricingPolicy.serviceChargeEnabled && pricingPolicy.vatEnabled
                        ? (language === 'ar'
                            ? `شامل الخدمة (${Math.round(pricingPolicy.serviceChargeRate * 100)}%) والضريبة (${Math.round(pricingPolicy.vatRate * 100)}%)`
                            : `Incl. Service (${Math.round(pricingPolicy.serviceChargeRate * 100)}%) & VAT (${Math.round(pricingPolicy.vatRate * 100)}%)`)
                        : pricingPolicy.vatEnabled
                        ? (language === 'ar'
                            ? `شامل الضريبة (${Math.round(pricingPolicy.vatRate * 100)}%)`
                            : `Incl. VAT (${Math.round(pricingPolicy.vatRate * 100)}%)`)
                        : pricingPolicy.serviceChargeEnabled
                        ? (language === 'ar'
                            ? `شامل الخدمة (${Math.round(pricingPolicy.serviceChargeRate * 100)}%)`
                            : `Incl. Service (${Math.round(pricingPolicy.serviceChargeRate * 100)}%)`)
                        : (language === 'ar'
                            ? 'الأسعار صافية بدون ضرائب أو رسوم إضافية'
                            : 'All prices net, no additional taxes or fees')}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-serif-luxury text-2xl font-black ${
                      isLight ? 'text-neutral-950' : 'text-amber-400'
                    }`}>
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold ${
                      isLight ? 'text-neutral-700' : 'text-amber-300'
                    }`}>{t('egp')}</span>
                  </div>
                </div>

                {/* Collapsible Fee Breakdown */}
                {showBillDetails && (
                  <div className={`space-y-2 pt-2 border-t text-xs animate-in fade-in duration-150 ${
                    isLight ? 'border-neutral-200' : 'border-white/5'
                  }`}>
                    <div className={`flex items-center justify-between ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      <span>{language === 'ar' ? 'المجموع الفرعي للأصناف' : 'Items Subtotal'}</span>
                      <span className={`font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{cartSubtotal.toFixed(2)} {t('egp')}</span>
                    </div>

                    {pricingPolicy.serviceChargeEnabled && cartServiceCharge > 0 && (
                      <div className={`flex items-center justify-between ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        <span>
                          {language === 'ar'
                            ? `رسوم الخدمة (${Math.round(pricingPolicy.serviceChargeRate * 100)}%)`
                            : `Service Charge (${Math.round(pricingPolicy.serviceChargeRate * 100)}%)`}
                        </span>
                        <span className={`font-mono ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>+{cartServiceCharge.toFixed(2)} {t('egp')}</span>
                      </div>
                    )}

                    {pricingPolicy.vatEnabled && cartVat > 0 && (
                      <div className={`flex items-center justify-between ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        <span>
                          {language === 'ar'
                            ? `ضريبة القيمة المضافة (${Math.round(pricingPolicy.vatRate * 100)}%)`
                            : `VAT (${Math.round(pricingPolicy.vatRate * 100)}%)`}
                        </span>
                        <span className={`font-mono ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>+{cartVat.toFixed(2)} {t('egp')}</span>
                      </div>
                    )}

                    {!pricingPolicy.serviceChargeEnabled && !pricingPolicy.vatEnabled && (
                      <div className="flex items-center justify-between text-emerald-600 font-semibold">
                        <span>{language === 'ar' ? 'الضرائب والرسوم' : 'Taxes & Fees'}</span>
                        <span className="font-bold">{language === 'ar' ? 'معفية / غير مفعلة (٠ ج.م)' : 'Disabled / 0 EGP'}</span>
                      </div>
                    )}

                    <div className={`py-1 px-2 rounded-lg text-[10px] text-center ${
                      isLight ? 'bg-neutral-200/60 text-neutral-600' : 'bg-white/5 text-neutral-400'
                    }`}>
                      {language === 'ar' ? pricingPolicy.taxNotice_ar : pricingPolicy.taxNotice_en}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Sleek Bottom Checkout Bar */}
        {cart.length > 0 && !orderSentUrl && (
          <div className={`p-3.5 sm:p-4 border-t space-y-2 shrink-0 shadow-2xl transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-black/95 border-white/15'
          }`}>
            {activeStep === 'items' ? (
              /* Footer for Step 1 */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className={isLight ? 'text-neutral-600' : 'text-neutral-400'}>
                    <span className="font-semibold">{language === 'ar' ? 'الإجمالي التقديري:' : 'Estimated Total:'}</span>
                    <span className={`text-[10px] block ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {pricingPolicy.serviceChargeEnabled && pricingPolicy.vatEnabled
                        ? (language === 'ar'
                            ? `شامل الخدمة ${Math.round(pricingPolicy.serviceChargeRate * 100)}% والضريبة ${Math.round(pricingPolicy.vatRate * 100)}%`
                            : `Incl. ${Math.round(pricingPolicy.serviceChargeRate * 100)}% Service & ${Math.round(pricingPolicy.vatRate * 100)}% VAT`)
                        : pricingPolicy.vatEnabled
                        ? (language === 'ar'
                            ? `شامل الضريبة ${Math.round(pricingPolicy.vatRate * 100)}%`
                            : `Incl. ${Math.round(pricingPolicy.vatRate * 100)}% VAT`)
                        : pricingPolicy.serviceChargeEnabled
                        ? (language === 'ar'
                            ? `شامل الخدمة ${Math.round(pricingPolicy.serviceChargeRate * 100)}%`
                            : `Incl. ${Math.round(pricingPolicy.serviceChargeRate * 100)}% Service`)
                        : (language === 'ar'
                            ? 'الأسعار صافية بدون ضرائب أو رسوم إضافية'
                            : 'All prices net, no additional taxes or fees')}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-serif-luxury text-xl font-black ${
                      isLight ? 'text-neutral-950' : 'text-amber-400'
                    }`}>
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold ${
                      isLight ? 'text-neutral-700' : 'text-amber-300'
                    }`}>{t('egp')}</span>
                  </div>
                </div>

                <button
                  id="cart-proceed-step2-btn"
                  onClick={() => {
                    haptic.tab();
                    setActiveStep('details');
                  }}
                  className={`w-full min-h-[46px] py-3 px-5 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer shadow-md ${
                    isLight
                      ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                      : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
                  }`}
                >
                  <span>{language === 'ar' ? 'متابعة كتابة البيانات والملاحظات' : 'Proceed to Details & Notes'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Footer for Step 2: Final WhatsApp Checkout */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className={`flex items-center gap-1.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    <button
                      type="button"
                      onClick={() => setActiveStep('items')}
                      className={`flex items-center gap-1 cursor-pointer underline text-[11px] font-semibold ${
                        isLight ? 'text-neutral-700 hover:text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <BackArrowIcon className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تعديل الأصناف' : 'Back to items'}</span>
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{t('total')}:</span>
                    <span className={`font-serif-luxury text-xl font-black ${
                      isLight ? 'text-neutral-950' : 'text-amber-400'
                    }`}>
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold ${
                      isLight ? 'text-neutral-700' : 'text-amber-300'
                    }`}>{t('egp')}</span>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <button
                  id="cart-checkout-whatsapp-btn"
                  onClick={handleCheckout}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-150 shadow-xl shadow-emerald-600/25 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.4]" />
                  <span>{t('continue_whatsapp')}</span>
                </button>

                <p className={`text-[10px] text-center leading-tight ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  {language === 'ar' ? (
                    <>
                      سيتم إرسال تفاصيل طلبك مباشرة إلى واتساب بوخارست بلاك (<bdi dir="ltr" className={`font-mono ${isLight ? 'text-neutral-700 font-bold' : 'text-neutral-400'}`}>{restaurantInfo.phoneDisplay}</bdi>)
                    </>
                  ) : (
                    <>
                      Order will be sent directly to Bokharest Black WhatsApp (<bdi dir="ltr" className={`font-mono ${isLight ? 'text-neutral-700 font-bold' : 'text-neutral-400'}`}>{restaurantInfo.phoneDisplay}</bdi>)
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

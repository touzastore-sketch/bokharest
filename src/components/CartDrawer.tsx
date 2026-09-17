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
  } = useApp();

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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-in fade-in duration-200 overscroll-contain"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border-l rtl:border-r rtl:border-l-0 border-white/15 h-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between shadow-2xl animate-in slide-in-from-right rtl:slide-in-from-left duration-300 select-none overflow-hidden overscroll-contain"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/80 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif-luxury text-xl font-bold text-white tracking-wide">
              {t('your_order')}
            </h2>
            {cart.length > 0 && (
              <span className="text-xs bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-full shadow-sm">
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
                className="min-h-[40px] px-2.5 py-1.5 text-xs text-neutral-400 hover:text-red-400 transition-all duration-150 flex items-center gap-1.5 rounded-xl hover:bg-white/5 focus:outline-none cursor-pointer active:scale-95 active:opacity-80"
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
              className="min-h-[40px] min-w-[40px] p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-150 focus:outline-none cursor-pointer flex items-center justify-center active:scale-95 active:opacity-80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two Step Navigation Tabs (if cart has items and not order success) */}
        {cart.length > 0 && !orderSentUrl && (
          <div className="flex border-b border-white/10 bg-neutral-950/90 px-4 pt-2.5 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                haptic.tab();
                setActiveStep('items');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                activeStep === 'items'
                  ? 'border-amber-400 text-amber-300 bg-[#141414] shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? `الأصناف (${totalItemsCount})` : `Items (${totalItemsCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                haptic.tab();
                setActiveStep('details');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                activeStep === 'details'
                  ? 'border-amber-400 text-amber-300 bg-[#141414] shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'بياناتك والتأكيد' : 'Details & Checkout'}</span>
              {(customerInfo.name || customerInfo.phone || customerInfo.address) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
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
              <div className="w-20 h-20 rounded-full border border-white/15 flex items-center justify-center bg-white/5 mb-4 shadow-inner">
                <ClipboardList className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="font-serif-luxury text-xl font-bold text-white mb-1">
                {t('empty_cart_title')}
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mb-6">
                {t('empty_cart_desc')}
              </p>
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('menu');
                }}
                className="min-h-[48px] px-7 py-3.5 rounded-full bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all duration-150 flex items-center gap-2 active:scale-95 active:opacity-80 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <span>{t('view_menu')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          ) : activeStep === 'items' ? (
            /* STEP 1: Items List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>{language === 'ar' ? 'الأصناف المضافة للطلب' : 'Added Order Items'}</span>
                <span className="text-[11px] text-amber-400/90 font-medium">
                  {language === 'ar' ? 'اضغط + أو - لتعديل الكمية' : 'Use +/- to adjust qty'}
                </span>
              </div>

              {cart.map((cartItem) => {
                const { item, quantity, notes } = cartItem;
                const name = language === 'ar' ? item.name_ar : item.name_en;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-3 transition-all hover:border-white/20 shadow-sm"
                  >
                    {/* Thumbnail */}
                    <img
                      src={getOptimizedImageUrl(item.image || UNIFIED_MENU_ITEM_IMAGE)}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-neutral-900 shrink-0 border border-white/5"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white truncate">
                          {name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1 rounded-md transition-colors"
                          title={language === 'ar' ? 'حذف الصنف' : 'Remove item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs text-neutral-400 mt-0.5 flex items-baseline gap-1">
                        <span className="font-serif-luxury font-bold text-white text-sm">
                          {(item.price * quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-amber-400">{t('egp')}</span>
                        {quantity > 1 && (
                          <span className="text-[10px] text-neutral-500">
                            ({item.price} {t('egp')} / {language === 'ar' ? 'قطعة' : 'ea'})
                          </span>
                        )}
                      </div>

                      {/* Display Serving Option Note if chosen */}
                      {notes && (
                        <div className="mt-1">
                          <span className="inline-block text-[10px] text-amber-300/90 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-lg max-w-full truncate">
                            {notes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-black border border-white/20 rounded-full p-1 shrink-0">
                      <button
                        onClick={() => {
                          haptic.stepper();
                          updateQuantity(item.id, quantity - 1);
                        }}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white min-w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          haptic.stepper();
                          updateQuantity(item.id, quantity + 1);
                        }}
                        className="w-7 h-7 rounded-full bg-amber-400 text-black hover:bg-amber-300 flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 font-bold"
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
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
              <div className="p-3 bg-[#141414] border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <ClipboardList className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? `تم اختيار ${totalItemsCount} أصناف في السلة`
                      : `${totalItemsCount} items selected in cart`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep('items')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold underline cursor-pointer shrink-0"
                >
                  {language === 'ar' ? 'تعديل الأصناف ←' : 'Edit items →'}
                </button>
              </div>

              {/* Customer Information Card (Spacious, flexible layout with full keyboard tolerance) */}
              <div className="p-4 sm:p-5 bg-[#121212] border-2 border-amber-500/40 rounded-3xl flex flex-col gap-4 sm:gap-5 shadow-2xl">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>{language === 'ar' ? 'بيانات العميل والتوصيل' : 'Customer & Delivery Info'}</span>
                        <span className="text-[10px] bg-amber-400/25 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          {language === 'ar' ? 'تأكيد الطلب' : 'Checkout'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {language === 'ar'
                          ? 'أدخل بياناتك وسيتم إرسال الطلب مباشرة إلى واتساب بوخارست بلاك'
                          : 'Enter your details to confirm your order directly on WhatsApp'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields Container using CSS Grid / Flexbox */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  {/* Field 1: Customer Name */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label htmlFor="customer-name-field" className="flex items-center gap-1.5 text-neutral-200">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('customer_name')}</span>
                      </label>
                      <span className="text-[10px] text-neutral-400">
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
                        className="w-full min-h-[50px] sm:min-h-[46px] bg-black/90 border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Field 2: Customer Phone */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label htmlFor="customer-phone-field" className="flex items-center gap-1.5 text-neutral-200">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('customer_phone')}</span>
                      </label>
                      <span className="text-[10px] text-amber-400 font-medium">
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
                        className={`w-full min-h-[50px] sm:min-h-[46px] bg-black/90 border rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-all font-mono text-left shadow-inner ${
                          phoneError
                            ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 focus:border-amber-400 focus:ring-amber-400/25'
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] text-red-400 mt-0.5 font-medium">
                        {language === 'ar'
                          ? 'يرجى إدخال رقم هاتف صحيح للتواصل'
                          : 'Please enter a valid contact phone number'}
                      </p>
                    )}
                  </div>

                  {/* Field 3: Delivery Address (عنوان التوصيل) */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label htmlFor="customer-address-field" className="flex items-center gap-1.5 text-neutral-200">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}</span>
                      </label>
                      <span className="text-[10px] text-amber-400 font-medium">
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
                        className="w-full min-h-[50px] sm:min-h-[46px] bg-black/90 border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 transition-all shadow-inner"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      {language === 'ar'
                        ? '📍 سيتم إرفاق العنوان تلقائياً في رسالة الطلب لتسليمه لك في أسرع وقت.'
                        : '📍 The delivery address will be included in your order message.'}
                    </p>
                  </div>

                  {/* Field 4: Special Notes (Dedicated spacious multiline direct writing only - NO chips/options) */}
                  <div className="flex flex-col gap-1.5 scroll-mt-28">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label htmlFor="customer-notes-field" className="flex items-center gap-1.5 text-neutral-200">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('special_notes')}</span>
                      </label>
                      <span className="text-[10px] text-neutral-400">
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
                      className="w-full min-h-[110px] bg-black/90 border border-white/20 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 transition-all resize-y shadow-inner leading-relaxed"
                    />

                    <p className="text-[11px] text-neutral-400 leading-normal">
                      {language === 'ar'
                        ? '✍️ الملاحظات ستصل مع رسالة الطلب على الواتساب ليتم تنفيذها في المطبخ/البار.'
                        : '✍️ Notes will be attached to your WhatsApp order message for our kitchen/bar team.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Summary Card with Collapsible Tax/Fee Breakdown */}
              <div className="p-4 bg-[#121212] border border-white/10 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>{language === 'ar' ? 'ملخص الحساب' : 'Bill Summary'}</span>
                  </div>

                  {/* Toggle breakdown details */}
                  <button
                    type="button"
                    onClick={() => setShowBillDetails((prev) => !prev)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
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
                <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
                  <div>
                    <span className="text-white text-sm font-bold block">{t('total')}</span>
                    <span className="text-[10px] text-neutral-400">
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
                    <span className="font-serif-luxury text-2xl text-amber-400 font-bold">
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">{t('egp')}</span>
                  </div>
                </div>

                {/* Collapsible Fee Breakdown (Preserves mobile screen real-estate) */}
                {showBillDetails && (
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>{language === 'ar' ? 'المجموع الفرعي للأصناف' : 'Items Subtotal'}</span>
                      <span className="font-medium text-white">{cartSubtotal.toFixed(2)} {t('egp')}</span>
                    </div>

                    {pricingPolicy.serviceChargeEnabled && cartServiceCharge > 0 && (
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>
                          {language === 'ar'
                            ? `رسوم الخدمة (${Math.round(pricingPolicy.serviceChargeRate * 100)}%)`
                            : `Service Charge (${Math.round(pricingPolicy.serviceChargeRate * 100)}%)`}
                        </span>
                        <span className="font-mono text-neutral-300">+{cartServiceCharge.toFixed(2)} {t('egp')}</span>
                      </div>
                    )}

                    {pricingPolicy.vatEnabled && cartVat > 0 && (
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>
                          {language === 'ar'
                            ? `ضريبة القيمة المضافة (${Math.round(pricingPolicy.vatRate * 100)}%)`
                            : `VAT (${Math.round(pricingPolicy.vatRate * 100)}%)`}
                        </span>
                        <span className="font-mono text-neutral-300">+{cartVat.toFixed(2)} {t('egp')}</span>
                      </div>
                    )}

                    {!pricingPolicy.serviceChargeEnabled && !pricingPolicy.vatEnabled && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>{language === 'ar' ? 'الضرائب والرسوم' : 'Taxes & Fees'}</span>
                        <span className="font-medium">{language === 'ar' ? 'معفية / غير مفعلة (٠ ج.م)' : 'Disabled / 0 EGP'}</span>
                      </div>
                    )}

                    <div className="py-1 px-2 rounded-lg bg-white/5 text-[10px] text-neutral-400 text-center">
                      {language === 'ar' ? pricingPolicy.taxNotice_ar : pricingPolicy.taxNotice_en}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Sleek Bottom Checkout Bar (Very slim, never covers inputs) */}
        {cart.length > 0 && !orderSentUrl && (
          <div className="p-3.5 sm:p-4 bg-black/95 border-t border-white/15 space-y-2 shrink-0 shadow-2xl">
            {activeStep === 'items' ? (
              /* Footer for Step 1 */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="text-neutral-400">
                    <span>{language === 'ar' ? 'الإجمالي التقديري:' : 'Estimated Total:'}</span>
                    <span className="text-[10px] text-neutral-500 block">
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
                    <span className="font-serif-luxury text-xl font-bold text-amber-400">
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">{t('egp')}</span>
                  </div>
                </div>

                <button
                  id="cart-proceed-step2-btn"
                  onClick={() => {
                    haptic.tab();
                    setActiveStep('details');
                  }}
                  className="w-full min-h-[46px] py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-150 shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer"
                >
                  <span>{language === 'ar' ? 'متابعة كتابة البيانات والملاحظات' : 'Proceed to Details & Notes'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Footer for Step 2: Final WhatsApp Checkout */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <button
                      type="button"
                      onClick={() => setActiveStep('items')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer underline text-[11px]"
                    >
                      <BackArrowIcon className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تعديل الأصناف' : 'Back to items'}</span>
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] text-neutral-400">{t('total')}:</span>
                    <span className="font-serif-luxury text-xl font-bold text-amber-400">
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">{t('egp')}</span>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <button
                  id="cart-checkout-whatsapp-btn"
                  onClick={handleCheckout}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-150 shadow-xl shadow-emerald-600/30 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.4]" />
                  <span>{t('continue_whatsapp')}</span>
                </button>

                <p className="text-[10px] text-center text-neutral-500 leading-tight">
                  {language === 'ar' ? (
                    <>
                      سيتم إرسال تفاصيل طلبك مباشرة إلى واتساب بوخارست بلاك (<bdi dir="ltr" className="font-mono text-neutral-400">{restaurantInfo.phoneDisplay}</bdi>)
                    </>
                  ) : (
                    <>
                      Order will be sent directly to Bokharest Black WhatsApp (<bdi dir="ltr" className="font-mono text-neutral-400">{restaurantInfo.phoneDisplay}</bdi>)
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

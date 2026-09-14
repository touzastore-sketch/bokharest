import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
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
  ClipboardList,
  Receipt,
  FileText,
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

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setOrderSentUrl(null);
    setOrderMessage(null);
    setActiveStep('items');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border-l rtl:border-r rtl:border-l-0 border-white/15 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right rtl:slide-in-from-left duration-300 select-none overflow-hidden"
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
              {(customerInfo.name || customerInfo.phone) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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
                      src={item.image || UNIFIED_MENU_ITEM_IMAGE}
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
            <div className="space-y-4">
              {/* Selected Items Quick Recap */}
              <div className="p-3 bg-neutral-950/80 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  <span>
                    {language === 'ar'
                      ? `تم اختيار ${totalItemsCount} أصناف`
                      : `${totalItemsCount} items selected`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep('items')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold underline cursor-pointer"
                >
                  {language === 'ar' ? 'تعديل الأصناف ←' : 'Edit items →'}
                </button>
              </div>

              {/* Customer Information Card (Organized and spacious) */}
              <div className="p-4 bg-[#121212] border-2 border-amber-500/30 rounded-2xl space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {language === 'ar' ? 'بيانات العميل للتواصل' : 'Customer Contact Details'}
                      </h4>
                      <p className="text-[10px] text-neutral-400">
                        {language === 'ar'
                          ? 'لتأكيد وتجهيز طلبك باسمك الرسمي'
                          : 'Used to prepare and link your official order'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('customer_name')}</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('customer_phone')}</span>
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={customerInfo.phone}
                    onChange={(e) => {
                      setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }));
                      if (phoneError) setPhoneError(false);
                    }}
                    placeholder="010XXXXXXXX"
                    className={`w-full bg-black/70 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono text-left shadow-inner ${
                      phoneError
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-amber-400'
                    }`}
                  />
                </div>

                {/* Special Notes / Side Dish */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('special_notes')}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder={t('notes_placeholder')}
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none shadow-inner leading-relaxed"
                  />
                  <p className="text-[10px] text-amber-300/80 mt-1">
                    {language === 'ar'
                      ? '💡 يمكنك كتابة اختيار الطبق الجانبي أو أي تفضيلات خاصة للطلب هنا'
                      : '💡 You can specify your side dish choice or custom requests here'}
                  </p>
                </div>
              </div>

              {/* Invoice Breakdown Card */}
              <div className="p-4 bg-[#121212] border border-white/10 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-bold text-neutral-300">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ar' ? 'تفاصيل الحساب والفاتورة' : 'Bill Breakdown'}</span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    {language === 'ar' ? 'المجموع الفرعي للأصناف' : 'Items Subtotal'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif-luxury text-sm font-medium text-white">
                      {cartSubtotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400">{t('egp')}</span>
                  </div>
                </div>

                {/* Service Charge 12% */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    {language === 'ar' ? 'رسوم الخدمة (12%)' : 'Service Charge (12%)'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xs text-neutral-300">
                      +{cartServiceCharge.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400">{t('egp')}</span>
                  </div>
                </div>

                {/* VAT 14% */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    {language === 'ar' ? 'ضريبة القيمة المضافة (14%)' : 'VAT (14%)'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xs text-neutral-300">
                      +{cartVat.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400">{t('egp')}</span>
                  </div>
                </div>

                {/* Final Total Line */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-bold">
                  <div>
                    <span className="text-white block">{t('total')}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {language === 'ar' ? 'شامل الخدمة والضريبة' : 'Incl. Service & VAT'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif-luxury text-xl text-amber-400 font-bold">
                      {cartTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-amber-300 font-semibold">{t('egp')}</span>
                  </div>
                </div>

                {/* Tax Notice */}
                <div className="py-1 px-2 rounded-lg bg-white/5 text-[10px] text-neutral-400 text-center">
                  {language === 'ar' ? pricingPolicy.taxNotice_ar : pricingPolicy.taxNotice_en}
                </div>
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
                      {language === 'ar' ? 'شامل الخدمة 12% والضريبة 14%' : 'Incl. 12% Service & 14% VAT'}
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

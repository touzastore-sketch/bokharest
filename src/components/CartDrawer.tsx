import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
import { X, Trash2, Plus, Minus, Send, Copy, Check, MessageSquare, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
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

  const [orderSentUrl, setOrderSentUrl] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setOrderSentUrl(null);
    setOrderMessage(null);
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border-l rtl:border-r rtl:border-l-0 border-white/15 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right rtl:slide-in-from-left duration-300 select-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-2">
            <h2 className="font-serif-luxury text-xl font-bold text-white tracking-wide">
              {t('your_order')}
            </h2>
            {cart.length > 0 && (
              <span className="text-xs bg-white text-black font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  haptic.stepper();
                  clearCart();
                }}
                className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 focus:outline-none cursor-pointer"
                title={t('clear_order')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('clear_order')}</span>
              </button>
            )}

            <button
              onClick={() => {
                haptic.tab();
                handleClose();
              }}
              aria-label="Close cart"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* If an order was just placed, show confirmation card with WhatsApp links & fallback */}
          {orderSentUrl && orderMessage ? (
            <div className="bg-[#121212] border border-white/20 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {t('order_sent_success')}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {language === 'ar'
                      ? 'تم تفريغ سلة طلبك بنجاح وحفظ الطلب في سجل (طلباتي).'
                      : 'Cart has been cleared and your order is saved in My Orders.'}
                  </p>
                </div>
              </div>

              {/* Order Message Preview */}
              <div className="bg-black/80 rounded-xl p-3 border border-white/10 font-mono text-[11px] text-neutral-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text" dir="ltr">
                {orderMessage}
              </div>

              {/* Actions & WhatsApp Web Fallback */}
              <div className="space-y-2 pt-2">
                <a
                  href={orderSentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('open_whatsapp_web')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors focus:outline-none"
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
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-colors focus:outline-none"
                  >
                    <span>{language === 'ar' ? 'سجل طلباتي' : 'My Orders'}</span>
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  {language === 'ar' ? 'إغلاق ومتابعة التصفح' : 'Close & Continue Browsing'}
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart View */
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-20 h-20 rounded-full border border-white/15 flex items-center justify-center bg-white/5 mb-4">
                <MessageSquare className="w-8 h-8 text-neutral-400" />
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
                className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <span>{t('view_menu')}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Items List */
            <div className="space-y-3">
              {cart.map((cartItem) => {
                const { item, quantity, notes } = cartItem;
                const name = language === 'ar' ? item.name_ar : item.name_en;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-3"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.image || UNIFIED_MENU_ITEM_IMAGE}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-neutral-900 shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {name}
                      </h4>
                      <div className="text-xs text-neutral-400 mt-0.5 flex items-baseline gap-1">
                        <span className="font-serif-luxury font-semibold text-white">
                          {item.price * quantity}
                        </span>
                        <span className="text-[10px]">{t('egp')}</span>
                        {quantity > 1 && (
                          <span className="text-[10px] text-neutral-500">
                            ({item.price} {t('egp')} / {language === 'ar' ? 'قطعة' : 'ea'})
                          </span>
                        )}
                      </div>
                      {notes && (
                        <p className="text-[10px] text-neutral-400 italic mt-0.5 truncate">
                          "{notes}"
                        </p>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-black border border-white/20 rounded-full px-2 py-1 shrink-0">
                      <button
                        onClick={() => {
                          haptic.stepper();
                          updateQuantity(item.id, quantity - 1);
                        }}
                        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white min-w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          haptic.stepper();
                          updateQuantity(item.id, quantity + 1);
                        }}
                        className="w-5 h-5 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Customer Information Input Form */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {language === 'ar' ? 'بيانات التواصل للطلب' : 'Contact Details for Order'}
                </h4>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {t('customer_name')}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {t('customer_phone')}
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
                    className={`w-full bg-[#141414] border rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono text-left ${
                      phoneError ? 'border-red-500' : 'border-white/15 focus:border-white/50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {t('special_notes')}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder={t('notes_placeholder')}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-black border-t border-white/15 space-y-2.5">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-neutral-400">
                {language === 'ar' ? 'المجموع الفرعي للأصناف' : 'Items Subtotal'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-luxury text-sm sm:text-base font-medium text-white">
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
                <span className="font-mono text-xs sm:text-sm text-neutral-300">
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
                <span className="font-mono text-xs sm:text-sm text-neutral-300">
                  +{cartVat.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400">{t('egp')}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-base font-bold">
              <div>
                <span className="text-white block">{t('total')}</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  {language === 'ar' ? 'شامل الخدمة والضريبة' : 'Incl. Service & VAT'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-luxury text-2xl text-white">
                  {cartTotal.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-300 font-semibold">{t('egp')}</span>
              </div>
            </div>

            {/* Pricing Policy Notice */}
            <div className="py-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-neutral-400 text-center">
              {language === 'ar' ? pricingPolicy.taxNotice_ar : pricingPolicy.taxNotice_en}
            </div>

            {/* Primary CTA Button: WhatsApp Order */}
            <button
              id="cart-checkout-whatsapp-btn"
              onClick={handleCheckout}
              className="w-full py-3.5 px-6 rounded-2xl bg-white text-black hover:bg-neutral-200 active:scale-[0.99] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-white/10 focus:outline-none"
            >
              {/* WhatsApp stylized monochrome icon */}
              <Send className="w-4 h-4 stroke-[2.2]" />
              <span>{t('continue_whatsapp')}</span>
            </button>

            <p className="text-[10px] text-center text-neutral-500 leading-tight">
              {language === 'ar' ? (
                <>
                  سيتم إرسال تفاصيل طلبك مباشرة إلى واتساب بوخارست بلاك الرسمي (<bdi dir="ltr" className="font-mono text-neutral-400 font-medium">{restaurantInfo.phoneDisplay}</bdi>)
                </>
              ) : (
                <>
                  Your order will be sent directly to official Bokharest Black WhatsApp (<bdi dir="ltr" className="font-mono text-neutral-400 font-medium">{restaurantInfo.phoneDisplay}</bdi>)
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

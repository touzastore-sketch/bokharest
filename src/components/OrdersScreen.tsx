import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Clock, CheckCircle2, RotateCcw, ArrowRight, ArrowLeft, Send, Calendar, Users, Plus, Check } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const OrdersScreen: React.FC = () => {
  const {
    cart,
    cartTotal,
    orderHistory,
    reservationHistory,
    language,
    t,
    setIsCartOpen,
    setIsReservationOpen,
    setActiveTab,
    addToCart,
    menuItems,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'reservations'>('orders');

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const handleRepeatOrder = (order: typeof orderHistory[0]) => {
    order.items.forEach((ordItem) => {
      const match = menuItems.find(
        (m) => m.name_en === ordItem.name_en || m.name_ar === ordItem.name_ar
      );
      if (match) {
        addToCart(match, ordItem.quantity);
      }
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md sm:max-w-xl mx-auto select-none space-y-6">
      {/* Title */}
      <ScrollReveal yOffset={16}>
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Activity & Records
          </span>
          <h1 className="font-serif-luxury text-2xl font-bold text-white tracking-wide mt-0.5">
            {t('orders')}
          </h1>
        </div>
      </ScrollReveal>

      {/* Switcher Tab: Orders vs Reservations */}
      <ScrollReveal yOffset={18} delay={0.05}>
        <div className="flex rounded-2xl bg-[#121212] border border-white/10 p-1">
          <button
            id="orders-tab-toggle-orders"
            onClick={() => setActiveSubTab('orders')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'طلبات الطعام' : 'Food Orders'}</span>
            {orderHistory.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeSubTab === 'orders' ? 'bg-black text-white' : 'bg-white/15 text-neutral-300'
                }`}
              >
                {orderHistory.length}
              </span>
            )}
          </button>

          <button
            id="orders-tab-toggle-reservations"
            onClick={() => setActiveSubTab('reservations')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'reservations'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('reservations')}</span>
            {reservationHistory.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeSubTab === 'reservations'
                    ? 'bg-black text-white'
                    : 'bg-white/15 text-neutral-300'
                }`}
              >
                {reservationHistory.length}
              </span>
            )}
          </button>
        </div>
      </ScrollReveal>

      {/* VIEW 1: RESERVATIONS SUB-TAB */}
      {activeSubTab === 'reservations' && (
        <ScrollReveal yOffset={20}>
          <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              {t('reservation_history')}
            </h2>
            <button
              id="orders-book-table-btn"
              onClick={() => setIsReservationOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>{t('book_table')}</span>
            </button>
          </div>

          {reservationHistory.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 mb-3">
                <Calendar className="w-6 h-6 text-neutral-500" />
              </div>
              <h3 className="font-bold text-white text-base">{t('no_reservations')}</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                {t('no_reservations_desc')}
              </p>
              <button
                onClick={() => setIsReservationOpen(true)}
                className="mt-5 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                {t('book_table')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reservationHistory.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                    <span className="font-mono text-neutral-400">{res.id}</span>
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تم الإرسال لواتساب' : 'Sent to WhatsApp'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">
                        {t('reservation_date')}
                      </span>
                      <span className="font-bold text-white font-mono" dir="ltr">{res.date}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">
                        {t('reservation_time')}
                      </span>
                      <span className="font-bold text-white font-mono" dir="ltr">{res.time}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">
                        {t('guests_count')}
                      </span>
                      <span className="font-bold text-white">
                        {res.guests} {language === 'ar' ? 'أفراد' : 'guests'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">
                        {t('customer_name')}
                      </span>
                      <span className="font-bold text-white truncate block">
                        {res.customerName}
                      </span>
                    </div>
                  </div>

                  {res.seatingArea && (
                    <div className="text-[11px] text-neutral-400 pt-1 border-t border-white/5 flex items-center justify-between">
                      <span className="text-neutral-500">{t('seating_preference')}:</span>
                      <span className="text-neutral-200 font-medium">{res.seatingArea}</span>
                    </div>
                  )}

                  {res.occasion && (
                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span className="text-neutral-500">{t('occasion')}:</span>
                      <span className="text-neutral-200">{res.occasion}</span>
                    </div>
                  )}

                  {res.specialRequests && (
                    <div className="text-[11px] text-neutral-400 pt-1 border-t border-white/5">
                      <span className="text-neutral-500 block text-[10px]">{t('special_requests')}:</span>
                      <span className="text-neutral-300 italic">{res.specialRequests}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </ScrollReveal>
      )}

      {/* VIEW 2: ORDERS SUB-TAB */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Cart Banner if has items */}
          {cart.length > 0 && (
            <ScrollReveal yOffset={20}>
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] border border-white/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {language === 'ar' ? 'طلبك الحالي غير المكتمل' : 'Current Active Cart'}
                      </h3>
                      <span className="text-[11px] text-neutral-400">
                        {cart.length} {language === 'ar' ? 'أصناف في السلة' : 'distinct items'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="font-serif-luxury text-lg font-bold text-white">
                      {cartTotal}
                    </span>
                    <span className="text-xs text-neutral-400 ml-1 rtl:mr-1 rtl:ml-0">
                      {t('egp')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('continue_whatsapp')}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </ScrollReveal>
          )}

          {/* Sent Orders History */}
          <ScrollReveal yOffset={20} delay={0.08}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  {language === 'ar' ? 'سجل الطلبات المرسلة' : 'Sent Orders History'}
                </h2>
                <span className="text-xs text-neutral-500">
                  {orderHistory.length} {language === 'ar' ? 'طلبات' : 'orders'}
                </span>
              </div>

            {orderHistory.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 mb-3">
                  <ShoppingBag className="w-6 h-6 text-neutral-500" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {t('empty_orders_title')}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                  {t('empty_orders_desc')}
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-5 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  {t('view_menu')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map((order) => {
                  const formattedDate = new Date(order.date).toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US',
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>

                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'تم إرسالها لواتساب' : 'Sent to WhatsApp'}</span>
                        </div>
                      </div>

                      {/* Items summary */}
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-neutral-300">
                            <span>
                              {it.quantity} × {language === 'ar' ? it.name_ar : it.name_en}
                            </span>
                            <span className="text-neutral-400">
                              {it.price * it.quantity} {t('egp')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Reorder Button */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-neutral-400">{t('total')}:</span>
                          <span className="font-serif-luxury font-bold text-white text-base">
                            {order.total}
                          </span>
                          <span className="text-[11px] text-neutral-400">{t('egp')}</span>
                        </div>

                        <button
                          onClick={() => handleRepeatOrder(order)}
                          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{language === 'ar' ? 'إعادة الطلب' : 'Reorder'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </ScrollReveal>
        </div>
      )}
    </div>
  );
};

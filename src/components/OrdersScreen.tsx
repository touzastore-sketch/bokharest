import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Clock, CheckCircle2, RotateCcw, ArrowRight, ArrowLeft, Send, Calendar, Users, Plus, Check, Trash2, MapPin } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const OrdersScreen: React.FC = () => {
  const {
    cart,
    cartTotal,
    orderHistory,
    deleteOrder,
    clearAllOrders,
    reservationHistory,
    deleteReservation,
    clearAllReservations,
    language,
    t,
    setIsCartOpen,
    setIsReservationOpen,
    setActiveTab,
    addToCart,
    menuItems,
    theme,
  } = useApp();

  const isLight = theme === 'light';

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

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب من سجلك؟' : 'Are you sure you want to delete this order from history?')) {
      deleteOrder(orderId);
    }
  };

  const handleDeleteReservation = (resId: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الحجز من سجلك؟' : 'Are you sure you want to delete this reservation?')) {
      deleteReservation(resId);
    }
  };

  const handleClearOrders = () => {
    if (confirm(language === 'ar' ? 'هل تريد مسح سجل كافة الطلبات؟' : 'Clear all order history?')) {
      clearAllOrders();
    }
  };

  const handleClearReservations = () => {
    if (confirm(language === 'ar' ? 'هل تريد مسح سجل كافة حجوزات الطاولات؟' : 'Clear all reservations history?')) {
      clearAllReservations();
    }
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md sm:max-w-xl mx-auto select-none space-y-6">
      {/* Title */}
      <ScrollReveal yOffset={16}>
        <div>
          <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${
            isLight ? 'text-neutral-500' : 'text-neutral-400'
          }`}>
            Activity & Records
          </span>
          <h1 className={`font-serif-luxury text-2xl font-black tracking-wide mt-0.5 ${
            isLight ? 'text-neutral-950' : 'text-white'
          }`}>
            {t('orders')}
          </h1>
        </div>
      </ScrollReveal>

      {/* Switcher Tab: Orders vs Reservations */}
      <ScrollReveal yOffset={18} delay={0.05}>
        <div className={`flex rounded-2xl p-1 border ${
          isLight ? 'bg-neutral-100 border-neutral-300' : 'bg-[#121212] border-white/10'
        }`}>
          <button
            id="orders-tab-toggle-orders"
            onClick={() => setActiveSubTab('orders')}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-95 active:opacity-80 touch-press ${
              activeSubTab === 'orders'
                ? isLight
                  ? 'bg-neutral-950 text-white shadow-md'
                  : 'bg-white text-black shadow-md'
                : isLight
                ? 'text-neutral-600 hover:text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'ar' ? 'طلبات الطعام' : 'Food Orders'}</span>
            {orderHistory.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeSubTab === 'orders'
                    ? isLight
                      ? 'bg-white text-neutral-900'
                      : 'bg-black text-white'
                    : isLight
                    ? 'bg-neutral-200 text-neutral-800'
                    : 'bg-white/15 text-neutral-300'
                }`}
              >
                {orderHistory.length}
              </span>
            )}
          </button>

          <button
            id="orders-tab-toggle-reservations"
            onClick={() => setActiveSubTab('reservations')}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-95 active:opacity-80 touch-press ${
              activeSubTab === 'reservations'
                ? isLight
                  ? 'bg-neutral-950 text-white shadow-md'
                  : 'bg-white text-black shadow-md'
                : isLight
                ? 'text-neutral-600 hover:text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('reservations')}</span>
            {reservationHistory.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeSubTab === 'reservations'
                    ? isLight
                      ? 'bg-white text-neutral-900'
                      : 'bg-black text-white'
                    : isLight
                    ? 'bg-neutral-200 text-neutral-800'
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
          <div className={`flex items-center justify-between border-b pb-2 ${
            isLight ? 'border-neutral-200' : 'border-white/10'
          }`}>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold uppercase tracking-wider ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}>
                {t('reservation_history')}
              </h2>
              {reservationHistory.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isLight ? 'bg-neutral-200 text-neutral-800' : 'bg-white/10 text-neutral-300'
                }`}>
                  {reservationHistory.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {reservationHistory.length > 0 && (
                <button
                  onClick={handleClearReservations}
                  className={`flex items-center gap-1 text-[11px] transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer ${
                    isLight ? 'text-neutral-500 hover:text-rose-600' : 'text-neutral-400 hover:text-rose-400'
                  }`}
                  title={language === 'ar' ? 'مسح الكل' : 'Clear all'}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{language === 'ar' ? 'مسح الكل' : 'Clear'}</span>
                </button>
              )}
              <button
                id="orders-book-table-btn"
                onClick={() => setIsReservationOpen(true)}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${
                  isLight
                    ? 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'
                    : 'text-white bg-white/10 hover:bg-white/20 border-white/15'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{t('book_table')}</span>
              </button>
            </div>
          </div>

          {reservationHistory.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 ${
                isLight ? 'bg-neutral-100 border-neutral-300' : 'border-white/10 bg-white/5'
              }`}>
                <Calendar className={`w-6 h-6 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`} />
              </div>
              <h3 className={`font-bold text-base ${isLight ? 'text-neutral-950' : 'text-white'}`}>{t('no_reservations')}</h3>
              <p className={`text-xs mt-1 max-w-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                {t('no_reservations_desc')}
              </p>
              <button
                onClick={() => setIsReservationOpen(true)}
                className={`mt-5 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors ${
                  isLight ? 'bg-neutral-950 text-white hover:bg-neutral-800' : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {t('book_table')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reservationHistory.map((res) => (
                <div
                  key={res.id}
                  className={`p-4 rounded-2xl border space-y-3 shadow-sm ${
                    isLight ? 'bg-white border-neutral-200 shadow-neutral-900/5' : 'bg-[#0e0e0e] border-white/10'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs pb-2 border-b ${
                    isLight ? 'border-neutral-100' : 'border-white/5'
                  }`}>
                    <span className={`font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{res.id}</span>
                    {res.status === 'confirmed' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-[11px] font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تم تأكيد الحجز' : 'Reservation Confirmed'}</span>
                      </div>
                    ) : res.status === 'cancelled' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 text-[11px] font-bold">
                        <span>{language === 'ar' ? 'حجز ملغي' : 'Cancelled'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 text-[11px] font-bold">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>{language === 'ar' ? 'قيد المراجعة والتأكيد' : 'Pending Confirmation'}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`block text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        {t('reservation_date')}
                      </span>
                      <span className={`font-bold font-mono ${isLight ? 'text-neutral-950' : 'text-white'}`} dir="ltr">{res.date}</span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        {t('reservation_time')}
                      </span>
                      <span className={`font-bold font-mono ${isLight ? 'text-neutral-950' : 'text-white'}`} dir="ltr">{res.time}</span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        {t('guests_count')}
                      </span>
                      <span className={`font-bold ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                        {res.guests} {language === 'ar' ? 'أفراد' : 'guests'}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        {t('customer_name')}
                      </span>
                      <span className={`font-bold truncate block ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                        {res.customerName}
                      </span>
                    </div>
                  </div>

                  {res.seatingArea && (
                    <div className={`text-[11px] pt-1 border-t flex items-center justify-between ${
                      isLight ? 'border-neutral-100 text-neutral-600' : 'border-white/5 text-neutral-400'
                    }`}>
                      <span className="text-neutral-500">{t('seating_preference')}:</span>
                      <span className={`font-medium ${isLight ? 'text-neutral-900' : 'text-neutral-200'}`}>{res.seatingArea}</span>
                    </div>
                  )}

                  {res.occasion && (
                    <div className={`text-[11px] flex items-center justify-between ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>
                      <span className="text-neutral-500">{t('occasion')}:</span>
                      <span className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>{res.occasion}</span>
                    </div>
                  )}

                  {res.specialRequests && (
                    <div className={`text-[11px] pt-1 border-t ${
                      isLight ? 'border-neutral-100 text-neutral-600' : 'border-white/5 text-neutral-400'
                    }`}>
                      <span className="text-neutral-500 block text-[10px]">{t('special_requests')}:</span>
                      <span className={`italic ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>{res.specialRequests}</span>
                    </div>
                  )}

                  <div className={`pt-2 border-t flex items-center justify-end ${
                    isLight ? 'border-neutral-100' : 'border-white/5'
                  }`}>
                    <button
                      onClick={() => handleDeleteReservation(res.id)}
                      className={`px-2.5 py-1 text-[11px] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                        isLight ? 'text-neutral-500' : 'text-neutral-400'
                      }`}
                      title={language === 'ar' ? 'حذف الحجز' : 'Delete reservation'}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{language === 'ar' ? 'حذف الحجز' : 'Delete'}</span>
                    </button>
                  </div>
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
              <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${
                isLight
                  ? 'bg-neutral-950 text-white border-neutral-800'
                  : 'bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] border-white/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isLight ? 'bg-white text-black' : 'bg-white text-black'
                    }`}>
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
                  className="w-full py-3 px-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-md cursor-pointer"
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
              <div className={`flex items-center justify-between border-b pb-2 ${
                isLight ? 'border-neutral-200' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-2">
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    {language === 'ar' ? 'سجل الطلبات المرسلة' : 'Sent Orders History'}
                  </h2>
                  {orderHistory.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isLight ? 'bg-neutral-200 text-neutral-800' : 'bg-white/10 text-neutral-300'
                    }`}>
                      {orderHistory.length}
                    </span>
                  )}
                </div>
                {orderHistory.length > 0 && (
                  <button
                    onClick={handleClearOrders}
                    className={`flex items-center gap-1 text-[11px] transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer ${
                      isLight ? 'text-neutral-500 hover:text-rose-600' : 'text-neutral-400 hover:text-rose-400'
                    }`}
                    title={language === 'ar' ? 'مسح كافة الطلبات' : 'Clear all orders'}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'ar' ? 'مسح الكل' : 'Clear'}</span>
                  </button>
                )}
              </div>

            {orderHistory.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 ${
                  isLight ? 'bg-neutral-100 border-neutral-300' : 'border-white/10 bg-white/5'
                }`}>
                  <ShoppingBag className={`w-6 h-6 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`} />
                </div>
                <h3 className={`font-black text-base ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                  {t('empty_orders_title')}
                </h3>
                <p className={`text-xs mt-1 max-w-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {t('empty_orders_desc')}
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`mt-5 min-h-[48px] px-7 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 active:opacity-80 touch-press cursor-pointer ${
                    isLight ? 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-md' : 'bg-white text-black hover:bg-neutral-200'
                  }`}
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
                      className={`p-4 rounded-2xl border space-y-3 shadow-sm ${
                        isLight ? 'bg-white border-neutral-200 shadow-neutral-900/5' : 'bg-[#0e0e0e] border-white/10'
                      }`}
                    >
                      <div className={`flex items-center justify-between text-xs pb-2 border-b ${
                        isLight ? 'border-neutral-100' : 'border-white/5'
                      }`}>
                        <div className={`flex items-center gap-1.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>

                        {order.status === 'completed' ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'اكتمل واستلم' : 'Completed'}</span>
                          </div>
                        ) : order.status === 'preparing' ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 text-[11px] font-bold animate-pulse">
                            <span>👨‍🍳 {language === 'ar' ? 'جاري التحضير في المطبخ' : 'Preparing'}</span>
                          </div>
                        ) : order.status === 'cancelled' ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 text-[11px] font-bold">
                            <span>{language === 'ar' ? 'طلب ملغي' : 'Cancelled'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تم الإرسال / قيد الاستلام' : 'Order Received'}</span>
                          </div>
                        )}
                      </div>

                      {/* Items summary */}
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className={`flex items-center justify-between text-xs ${
                            isLight ? 'text-neutral-700' : 'text-neutral-300'
                          }`}>
                            <span>
                              {it.quantity} × {language === 'ar' ? it.name_ar : it.name_en}
                            </span>
                            <span className={isLight ? 'text-neutral-500 font-medium' : 'text-neutral-400'}>
                              {it.price * it.quantity} {t('egp')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address if present */}
                      {order.address && (
                        <div className={`flex items-start gap-1.5 text-xs pt-1.5 border-t ${
                          isLight ? 'border-neutral-100 text-neutral-700' : 'border-white/5 text-neutral-300'
                        }`}>
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className={`font-medium ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {language === 'ar' ? 'العنوان:' : 'Address:'}
                          </span>
                          <span className={`font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>{order.address}</span>
                        </div>
                      )}

                      {/* Special Notes if present */}
                      {order.notes && (
                        <div className={`text-[11px] pt-1 border-t ${
                          isLight ? 'border-neutral-100 text-neutral-600' : 'border-white/5 text-neutral-400'
                        }`}>
                          <span className="text-neutral-500 font-medium block text-[10px]">
                            {language === 'ar' ? 'ملاحظات الطلب:' : 'Order Notes:'}
                          </span>
                          <span className={`italic ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>{order.notes}</span>
                        </div>
                      )}

                      {/* Total & Reorder Button */}
                      <div className={`pt-2 border-t flex items-center justify-between ${
                        isLight ? 'border-neutral-100' : 'border-white/5'
                      }`}>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{t('total')}:</span>
                          <span className={`font-serif-luxury font-bold text-base ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                            {order.total}
                          </span>
                          <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{t('egp')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className={`min-h-[44px] min-w-[44px] p-2 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center active:scale-95 active:opacity-80 touch-press ${
                              isLight ? 'text-neutral-400' : 'text-neutral-500'
                            }`}
                            title={language === 'ar' ? 'حذف من السجل' : 'Delete from history'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRepeatOrder(order)}
                            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
                              isLight
                                ? 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-xs'
                                : 'bg-white/10 hover:bg-white hover:text-black text-white'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'إعادة الطلب' : 'Reorder'}</span>
                          </button>
                        </div>
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

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  Users,
  Send,
  Check,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  History,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { haptic } from '../utils/haptics';

interface ReservationsProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const Reservations: React.FC<ReservationsProps> = ({
  isOpen = true,
  onClose,
  isModal = true,
}) => {
  const {
    language,
    t,
    customerInfo,
    setCustomerInfo,
    sendWhatsAppReservation,
    reservationHistory,
    restaurantInfo,
  } = useApp();

  // Helper date calculations for quick shortcuts
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const dayAfterTomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  }, []);

  const formatDateValue = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateObj: Date) => {
    return dateObj.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // State
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'history'>('new');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateValue(today));
  const [selectedTime, setSelectedTime] = useState<string>('08:00 PM');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [seatingArea, setSeatingArea] = useState<string>('indoor');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Guest Contact Information
  const [guestName, setGuestName] = useState<string>(customerInfo.name || '');
  const [guestPhone, setGuestPhone] = useState<string>(customerInfo.phone || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Success Result State
  const [submittedResult, setSubmittedResult] = useState<{
    url: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (isModal && !isOpen) return null;

  // Official fine-dining operating hours: Strictly 9:00 AM to 3:00 AM
  const timeSlots = [
    // فترة الصباح والظهيرة (09:00 ص - 03:30 م)
    { id: '09:00 AM', label_ar: '09:00 ص', label_en: '9:00 AM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon', popular: true },
    { id: '09:30 AM', label_ar: '09:30 ص', label_en: '9:30 AM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '10:00 AM', label_ar: '10:00 ص', label_en: '10:00 AM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '10:30 AM', label_ar: '10:30 ص', label_en: '10:30 AM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '11:00 AM', label_ar: '11:00 ص', label_en: '11:00 AM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '11:30 AM', label_ar: '11:30 ص', label_en: '11:30 AM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '12:00 PM', label_ar: '12:00 ظ', label_en: '12:00 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '12:30 PM', label_ar: '12:30 م', label_en: '12:30 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '01:00 PM', label_ar: '01:00 م', label_en: '1:00 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon', popular: true },
    { id: '01:30 PM', label_ar: '01:30 م', label_en: '1:30 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '02:00 PM', label_ar: '02:00 م', label_en: '2:00 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '02:30 PM', label_ar: '02:30 م', label_en: '2:30 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '03:00 PM', label_ar: '03:00 م', label_en: '3:00 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },
    { id: '03:30 PM', label_ar: '03:30 م', label_en: '3:30 PM', group_ar: 'فترة الصباح والظهيرة', group_en: 'Morning & Noon' },

    // فترة المساء (04:00 م - 09:30 م)
    { id: '04:00 PM', label_ar: '04:00 م', label_en: '4:00 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '04:30 PM', label_ar: '04:30 م', label_en: '4:30 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '05:00 PM', label_ar: '05:00 م', label_en: '5:00 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '05:30 PM', label_ar: '05:30 م', label_en: '5:30 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '06:00 PM', label_ar: '06:00 م', label_en: '6:00 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '06:30 PM', label_ar: '06:30 م', label_en: '6:30 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '07:00 PM', label_ar: '07:00 م', label_en: '7:00 PM', group_ar: 'فترة المساء', group_en: 'Evening', popular: true },
    { id: '07:30 PM', label_ar: '07:30 م', label_en: '7:30 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '08:00 PM', label_ar: '08:00 م', label_en: '8:00 PM', group_ar: 'فترة المساء', group_en: 'Evening', popular: true },
    { id: '08:30 PM', label_ar: '08:30 م', label_en: '8:30 PM', group_ar: 'فترة المساء', group_en: 'Evening' },
    { id: '09:00 PM', label_ar: '09:00 م', label_en: '9:00 PM', group_ar: 'فترة المساء', group_en: 'Evening', popular: true },
    { id: '09:30 PM', label_ar: '09:30 م', label_en: '9:30 PM', group_ar: 'فترة المساء', group_en: 'Evening' },

    // فترة السهرة ومنتصف الليل (10:00 م - 03:00 ص)
    { id: '10:00 PM', label_ar: '10:00 م', label_en: '10:00 PM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night', popular: true },
    { id: '10:30 PM', label_ar: '10:30 م', label_en: '10:30 PM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night' },
    { id: '11:00 PM', label_ar: '11:00 م', label_en: '11:00 PM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night', popular: true },
    { id: '11:30 PM', label_ar: '11:30 م', label_en: '11:30 PM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night' },
    { id: '12:00 AM', label_ar: '12:00 ص', label_en: '12:00 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night', popular: true },
    { id: '12:30 AM', label_ar: '12:30 ص', label_en: '12:30 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night' },
    { id: '01:00 AM', label_ar: '01:00 ص', label_en: '1:00 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night', popular: true },
    { id: '01:30 AM', label_ar: '01:30 ص', label_en: '1:30 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night' },
    { id: '02:00 AM', label_ar: '02:00 ص', label_en: '2:00 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night' },
    { id: '02:30 AM', label_ar: '02:30 ص', label_en: '2:30 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night', popular: true },
    { id: '03:00 AM', label_ar: '03:00 ص', label_en: '3:00 AM', group_ar: 'سهرة ومنتصف الليل', group_en: 'Late Night' },
  ];

  const getTimeDisplay = (id: string): string => {
    const slot = timeSlots.find((s) => s.id === id);
    if (!slot) return id;
    return language === 'ar' ? slot.label_ar : slot.label_en;
  };

  // Seating Preferences
  const seatingOptions = [
    {
      id: 'indoor',
      title_ar: 'الصالة الداخلية الفاخرة',
      title_en: 'Indoor Luxury Lounge',
      desc_ar: 'أجواء راقية ومكيفة ومريحة',
      desc_en: 'Refined climate-controlled luxury',
    },
    {
      id: 'outdoor',
      title_ar: 'التراس الخارجي المفتوح',
      title_en: 'Outdoor Terrace',
      desc_ar: 'جلسة مميزة في الهواء الطلق',
      desc_en: 'Open-air al fresco dining',
    },
    {
      id: 'vip',
      title_ar: 'صالة VIP الخاصة',
      title_en: 'VIP Private Area',
      desc_ar: 'خصوصية كاملة للمناسبات الفاخرة',
      desc_en: 'Maximum privacy & dedicated service',
    },
    {
      id: 'nonsmoking',
      title_ar: 'منطقة غير المدخنين',
      title_en: 'Non-Smoking Zone',
      desc_ar: 'أجواء عائلية صحية وهادئة',
      desc_en: 'Quiet, clean air setting',
    },
  ];

  const handleGuestsChange = (delta: number) => {
    haptic.stepper();
    setGuestsCount((prev) => Math.max(1, Math.min(30, prev + delta)));
  };

  const handleClose = () => {
    haptic.tab();
    if (onClose) {
      onClose();
    }
    setSubmittedResult(null);
    setValidationError(null);
  };

  const handleCopy = () => {
    if (submittedResult?.message) {
      haptic.toggle();
      navigator.clipboard.writeText(submittedResult.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!guestName.trim()) {
      setValidationError(
        language === 'ar' ? 'يرجى كتابة اسم الضيف للتأكيد' : 'Please enter guest name'
      );
      return;
    }

    if (!guestPhone.trim() || guestPhone.trim().length < 8) {
      setValidationError(
        language === 'ar'
          ? 'يرجى إدخال رقم هاتف صحيح للتواصل وتأكيد الحجز'
          : 'Please provide a valid contact phone number'
      );
      return;
    }

    setValidationError(null);

    // Trigger celebratory reservation haptic impulse
    haptic.order();

    // Sync back to customer context
    setCustomerInfo((prev) => ({
      ...prev,
      name: guestName.trim(),
      phone: guestPhone.trim(),
    }));

    const finalTime = getTimeDisplay(selectedTime);
    const selectedSeatingObj = seatingOptions.find((s) => s.id === seatingArea);
    const seatingName = selectedSeatingObj
      ? language === 'ar'
        ? selectedSeatingObj.title_ar
        : selectedSeatingObj.title_en
      : seatingArea;

    const result = sendWhatsAppReservation({
      customerName: guestName.trim(),
      phoneNumber: guestPhone.trim(),
      date: selectedDate,
      time: finalTime,
      guests: guestsCount,
      seatingArea: seatingName,
      specialRequests: specialRequests.trim(),
    });

    if (result.success) {
      setSubmittedResult({
        url: result.url,
        message: result.message,
      });

      // Attempt immediate open via WhatsApp
      try {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback rendered on screen
      }
    }
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setValidationError(null);
    setSelectedDate(formatDateValue(today));
    setSelectedTime('08:00 PM');
    setGuestsCount(2);
    setSpecialRequests('');
  };

  const Chevron = language === 'ar' ? ChevronLeft : ChevronRight;

  const content = (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-luxury text-lg font-bold text-white tracking-wide">
              {t('table_reservation')}
            </h2>
            <p className="text-[11px] text-neutral-400">
              {language === 'ar' ? 'حجز مباشر وفوري عبر واتساب' : 'Direct VIP booking via WhatsApp'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab switcher: New Reservation vs History */}
          <button
            onClick={() => {
              haptic.tab();
              setActiveSubTab((prev) => (prev === 'new' ? 'history' : 'new'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors focus:outline-none cursor-pointer"
            title={activeSubTab === 'new' ? t('reservation_history') : t('new_reservation')}
          >
            {activeSubTab === 'new' ? (
              <>
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('reservation_history')}</span>
                {reservationHistory.length > 0 && (
                  <span className="text-[10px] bg-white text-black px-1.5 py-0.2 rounded-full font-bold">
                    {reservationHistory.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t('new_reservation')}</span>
              </>
            )}
          </button>

          {isModal && onClose && (
            <button
              onClick={handleClose}
              id="close-reservations-modal-btn"
              aria-label="Close Reservations"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* VIEW 1: RESERVATION HISTORY */}
        {activeSubTab === 'history' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {t('reservation_history')}
              </h3>
              <span className="text-xs text-neutral-500">
                {reservationHistory.length} {language === 'ar' ? 'حجوزات' : 'bookings'}
              </span>
            </div>

            {reservationHistory.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 mb-3">
                  <Calendar className="w-6 h-6 text-neutral-500" />
                </div>
                <h4 className="font-bold text-white text-base">
                  {t('no_reservations')}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                  {t('no_reservations_desc')}
                </p>
                <button
                  onClick={() => setActiveSubTab('new')}
                  className="mt-5 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  {t('book_table')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {reservationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                      <span className="font-mono text-neutral-400">{item.id}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'مرسل للواتساب' : 'Sent to WhatsApp'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">
                          {t('reservation_date')}
                        </span>
                        <span className="font-bold text-white">{item.date}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">
                          {t('reservation_time')}
                        </span>
                        <span className="font-bold text-white">{item.time}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">
                          {t('guests_count')}
                        </span>
                        <span className="font-bold text-white">
                          {item.guests} {language === 'ar' ? 'أفراد' : 'guests'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">
                          {t('customer_name')}
                        </span>
                        <span className="font-bold text-white truncate block">
                          {item.customerName}
                        </span>
                      </div>
                    </div>

                    {item.seatingArea && (
                      <div className="text-[11px] text-neutral-400 pt-1 border-t border-white/5">
                        <span className="text-neutral-500">{t('seating_preference')}: </span>
                        <span className="text-neutral-300">{item.seatingArea}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : submittedResult ? (
          /* VIEW 2: SUBMITTED CONFIRMATION RESULT */
          <div className="bg-[#121212] border border-white/20 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-lg">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {t('reservation_sent_success')}
                </h3>
                <p className="text-xs text-neutral-400">
                  {language === 'ar'
                    ? 'تم إعداد تفاصيل حجزك لفتح واتساب وتأكيد الطاولة'
                    : 'Your table request has been formatted for instant WhatsApp confirmation'}
                </p>
              </div>
            </div>

            {/* Formatted Message Preview */}
            <div className="bg-black/80 rounded-xl p-3.5 border border-white/10 font-mono text-[11px] text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {submittedResult.message}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <a
                href={submittedResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('open_whatsapp_web')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/15 transition-colors focus:outline-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('copy_reservation')}</span>
                  </>
                )}
              </button>

              <button
                onClick={resetForm}
                className="w-full py-2 text-neutral-400 hover:text-white text-xs transition-colors text-center mt-2 focus:outline-none"
              >
                {language === 'ar' ? 'تقديم حجز آخر' : 'Make Another Reservation'}
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 3: NEW RESERVATION FORM */
          <form onSubmit={handleSubmitReservation} className="space-y-6">
            {/* Banner description */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181818] to-[#101010] border border-white/10">
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t('table_reservation_desc')}
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-neutral-300" />
                <span>
                  {language === 'ar'
                    ? restaurantInfo.openingHours_ar
                    : restaurantInfo.openingHours_en}
                </span>
              </div>
            </div>

            {/* Validation Error Banner if present */}
            {validationError && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SECTION 1: DATE SELECTION */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                1. {t('reservation_date')}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Today */}
                <button
                  type="button"
                  id="res-date-today"
                  onClick={() => {
                    haptic.tab();
                    setSelectedDate(formatDateValue(today));
                  }}
                  className={`p-3 rounded-xl border text-center transition-all focus:outline-none cursor-pointer ${
                    selectedDate === formatDateValue(today)
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-[#141414] border-white/10 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  <span className="block text-[11px] font-bold">{t('today')}</span>
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    {formatDateDisplay(today)}
                  </span>
                </button>

                {/* Tomorrow */}
                <button
                  type="button"
                  id="res-date-tomorrow"
                  onClick={() => {
                    haptic.tab();
                    setSelectedDate(formatDateValue(tomorrow));
                  }}
                  className={`p-3 rounded-xl border text-center transition-all focus:outline-none cursor-pointer ${
                    selectedDate === formatDateValue(tomorrow)
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-[#141414] border-white/10 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  <span className="block text-[11px] font-bold">{t('tomorrow')}</span>
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    {formatDateDisplay(tomorrow)}
                  </span>
                </button>

                {/* Day After Tomorrow */}
                <button
                  type="button"
                  id="res-date-day-after"
                  onClick={() => {
                    haptic.tab();
                    setSelectedDate(formatDateValue(dayAfterTomorrow));
                  }}
                  className={`p-3 rounded-xl border text-center transition-all focus:outline-none cursor-pointer ${
                    selectedDate === formatDateValue(dayAfterTomorrow)
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-[#141414] border-white/10 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  <span className="block text-[11px] font-bold">
                    {t('day_after_tomorrow')}
                  </span>
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    {formatDateDisplay(dayAfterTomorrow)}
                  </span>
                </button>
              </div>

              {/* Custom Date Input */}
              <div className="pt-1">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    id="res-date-custom-input"
                    min={formatDateValue(today)}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors"
                  />
                  <div className="absolute right-3 rtl:right-auto rtl:left-3 pointer-events-none text-neutral-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: TIME SLOT SELECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                  2. {t('reservation_time')}
                </label>
                <div
                  dir="ltr"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs font-bold shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-neutral-300" />
                  <span>{getTimeDisplay(selectedTime)}</span>
                </div>
              </div>

              {/* القائمة المنسدلة لاختيار الوقت من 9 صباحاً إلى 3 بعد منتصف الليل */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-neutral-400">
                  {language === 'ar' ? 'قائمة المواعيد المتاحة (من ٠٩:٠٠ ص حتى ٠٣:٠٠ بعد منتصف الليل):' : 'Available Time Slots (9:00 AM – 3:00 AM):'}
                </label>
                <div className="relative">
                  <select
                    id="res-time-select-dropdown"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    dir="ltr"
                    className="w-full appearance-none bg-[#141414] border border-white/20 hover:border-white/40 focus:border-white rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer font-mono shadow-inner pr-10 rtl:pr-4 rtl:pl-10 text-left rtl:text-right"
                  >
                    <optgroup label={language === 'ar' ? '☀️ فترة الصباح والظهيرة (09:00 ص - 03:30 م)' : '☀️ Morning & Noon (9:00 AM – 3:30 PM)'}>
                      {timeSlots.filter(s => (language === 'ar' ? s.group_ar : s.group_en) === (language === 'ar' ? 'فترة الصباح والظهيرة' : 'Morning & Noon')).map(slot => (
                        <option key={slot.id} value={slot.id} className="bg-[#161616] text-white py-1.5">
                          {language === 'ar' ? `${slot.label_ar} (${slot.id})` : slot.label_en}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={language === 'ar' ? '🌆 فترة المساء (04:00 م - 09:30 م)' : '🌆 Evening (4:00 PM – 9:30 PM)'}>
                      {timeSlots.filter(s => (language === 'ar' ? s.group_ar : s.group_en) === (language === 'ar' ? 'فترة المساء' : 'Evening')).map(slot => (
                        <option key={slot.id} value={slot.id} className="bg-[#161616] text-white py-1.5">
                          {language === 'ar' ? `${slot.label_ar} (${slot.id})` : slot.label_en}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={language === 'ar' ? '🌙 سهرة ومنتصف الليل (10:00 م - 03:00 ص)' : '🌙 Late Night (10:00 PM – 3:00 AM)'}>
                      {timeSlots.filter(s => (language === 'ar' ? s.group_ar : s.group_en) === (language === 'ar' ? 'سهرة ومنتصف الليل' : 'Late Night')).map(slot => (
                        <option key={slot.id} value={slot.id} className="bg-[#161616] text-white py-1.5">
                          {language === 'ar' ? `${slot.label_ar} (${slot.id})` : slot.label_en}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* أزرار سريعة للمواعيد الأكثر طلباً */}
              <div className="pt-1">
                <span className="block text-[11px] text-neutral-400 mb-2">
                  {language === 'ar' ? 'أو اختر مباشرة من المواعيد الأكثر طلباً:' : 'Or quick select popular slots:'}
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.filter(s => s.popular).map((slot) => {
                    const isSelected = selectedTime === slot.id;
                    const label = language === 'ar' ? slot.label_ar : slot.label_en;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          if (selectedTime !== slot.id) {
                            haptic.tab();
                          }
                          setSelectedTime(slot.id);
                        }}
                        dir="ltr"
                        className={`py-2 px-2 rounded-xl text-xs font-semibold font-mono border transition-all focus:outline-none flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-md font-bold scale-[1.02]'
                            : 'bg-[#141414] border-white/10 text-neutral-300 hover:border-white/30'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: NUMBER OF GUESTS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                  3. {t('guests_count')}
                </label>
                <span className="text-xs text-neutral-400">
                  {guestsCount === 1
                    ? `1 ${t('guest_singular')}`
                    : `${guestsCount} ${t('guests')}`}
                </span>
              </div>

              <div className="p-3 bg-[#141414] border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {guestsCount === 1 && (language === 'ar' ? 'فردي' : 'Solo Dining')}
                      {guestsCount === 2 && (language === 'ar' ? 'طاولة لشخصين' : 'Couple / 2 Guests')}
                      {guestsCount >= 3 &&
                        guestsCount <= 5 &&
                        (language === 'ar' ? 'مجموعة صغيرة' : 'Small Group')}
                      {guestsCount >= 6 &&
                        (language === 'ar' ? 'تجمع / عائلة' : 'Large Party / Family')}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {language === 'ar' ? 'طاولة مجهزة بالكامل' : 'Reserved with dedicated service'}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-3 bg-black border border-white/20 rounded-full px-2 py-1">
                  <button
                    type="button"
                    id="res-guests-minus-btn"
                    onClick={() => handleGuestsChange(-1)}
                    disabled={guestsCount <= 1}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white text-white flex items-center justify-center transition-colors focus:outline-none"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-sm font-bold text-white min-w-6 text-center font-serif-luxury">
                    {guestsCount}
                  </span>

                  <button
                    type="button"
                    id="res-guests-plus-btn"
                    onClick={() => handleGuestsChange(1)}
                    disabled={guestsCount >= 30}
                    className="w-7 h-7 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-colors focus:outline-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Guest Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {[1, 2, 4, 6, 8, 10, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (guestsCount !== num) {
                        haptic.stepper();
                      }
                      setGuestsCount(num);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus:outline-none cursor-pointer ${
                      guestsCount === num
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {num} {language === 'ar' ? 'ضيوف' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 4: SEATING PREFERENCE */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                4. {t('seating_preference')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {seatingOptions.map((opt) => {
                  const isSelected = seatingArea === opt.id;
                  const title = language === 'ar' ? opt.title_ar : opt.title_en;
                  const desc = language === 'ar' ? opt.desc_ar : opt.desc_en;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (seatingArea !== opt.id) {
                          haptic.toggle();
                        }
                        setSeatingArea(opt.id);
                      }}
                      className={`p-3 rounded-2xl border text-left rtl:text-right transition-all flex items-start gap-3 focus:outline-none cursor-pointer ${
                        isSelected
                          ? 'bg-[#1a1a1a] border-white shadow-md'
                          : 'bg-[#121212] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-white bg-white' : 'border-white/30'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-white truncate">
                          {title}
                        </span>
                        <span className="block text-[10px] text-neutral-400 mt-0.5 leading-snug">
                          {desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 5: CONTACT INFORMATION */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                5. {t('contact_details_reservation')}
              </label>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  {t('customer_name')} *
                </label>
                <input
                  type="text"
                  id="res-guest-name-input"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder={language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                  className="w-full bg-[#141414] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  {t('customer_phone')} *
                </label>
                <input
                  type="tel"
                  id="res-guest-phone-input"
                  dir="ltr"
                  value={guestPhone}
                  onChange={(e) => {
                    setGuestPhone(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-[#141414] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors font-mono text-left"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  {t('special_requests')}
                </label>
                <textarea
                  id="res-special-requests-input"
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={t('special_requests_placeholder')}
                  className="w-full bg-[#141414] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* LIVE RESERVATION SUMMARY CARD */}
            <div className="p-4 rounded-2xl bg-black border border-white/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-white/10">
                <span>{language === 'ar' ? 'ملخص طلب الحجز' : 'Booking Summary'}</span>
                <span className="text-white font-semibold">{restaurantInfo.name_en}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{t('reservation_date')}:</span>
                <span className="text-white font-bold font-mono" dir="ltr">{selectedDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{t('reservation_time')}:</span>
                <span className="text-white font-bold font-mono" dir="ltr">
                  {getTimeDisplay(selectedTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{t('guests_count')}:</span>
                <span className="text-white font-bold">
                  {guestsCount} {guestsCount > 2 ? t('guests') : t('guest_singular')}
                </span>
              </div>
            </div>

            {/* Primary Submit CTA: Submit via WhatsApp */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                id="submit-reservation-whatsapp-btn"
                className="w-full py-4 px-6 rounded-2xl bg-white text-black hover:bg-neutral-200 active:scale-[0.99] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-white/10 focus:outline-none cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
                <span>{t('submit_reservation')}</span>
              </button>

              <p className="text-[10px] text-center text-neutral-500 leading-tight">
                {language === 'ar' ? (
                  <>
                    سيتم إرسال تفاصيل حجزك إلى واتساب بوخارست بلاك (<bdi dir="ltr" className="font-mono text-neutral-400 font-medium">{restaurantInfo.phoneDisplay}</bdi>) لتأكيد توفر الطاولة فوراً
                  </>
                ) : (
                  <>
                    Your booking will be sent to Bokharest Black WhatsApp (<bdi dir="ltr" className="font-mono text-neutral-400 font-medium">{restaurantInfo.phoneDisplay}</bdi>) for instant table confirmation
                  </>
                )}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  // If used as modal / bottom sheet
  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0a0a0a] border-l rtl:border-r rtl:border-l-0 border-white/15 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right rtl:slide-in-from-left duration-300"
        >
          {content}
        </div>
      </div>
    );
  }

  // Standalone embed
  return <div className="w-full max-w-2xl mx-auto rounded-3xl border border-white/15 overflow-hidden">{content}</div>;
};

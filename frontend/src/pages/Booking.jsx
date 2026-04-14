import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import Calendar from '@components/Calendar';
import CountryCodeSelector from '@components/CountryCodeSelector';
import { FiCalendar, FiClock, FiScissors, FiUser, FiMail, FiPhone, FiCheck, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Booking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [blockedDays, setBlockedDays] = useState([]);
  const [userPlanSessions, setUserPlanSessions] = useState(null);

  const [walkInData, setWalkInData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [walkInCountryCode, setWalkInCountryCode] = useState('+55');

  const services = [
    t('booking.haircut'),
    t('booking.beard'),
    t('booking.cutBeard'),
    t('booking.hydration'),
    t('booking.hairTreatment'),
    t('booking.pigmentation'),
  ];

  useEffect(() => {
    if (user?.planId) {
      checkPlanSessions();
    }
    fetchBlockedDays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild services list when language changes
  useEffect(() => {
    setSelectedService(prev => {
      const keys = ['haircut', 'beard', 'cutBeard', 'hydration', 'hairTreatment', 'pigmentation'];
      const found = keys.find(k => t(`booking.${k}`) === prev);
      return found ? t(`booking.${found}`) : '';
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes();
    }
  }, [selectedDate]);

  const checkPlanSessions = async () => {
    try {
      const userResponse = await api.get('/users/me');
      const { plan, bookings } = userResponse.data;

      if (plan) {
        const now = new Date();
        const monthBookings = bookings.filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate.getMonth() === now.getMonth() &&
                 bookingDate.getFullYear() === now.getFullYear() &&
                 b.status !== 'CANCELLED';
        });

        setUserPlanSessions({
          total: plan.sessions,
          used: monthBookings.length,
          remaining: plan.sessions - monthBookings.length,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar plano:', error);
    }
  };

  const fetchBlockedDays = async () => {
    try {
      const response = await api.get('/bookings/blocked-days');
      const blocked = response.data.map(b => b.date);
      setBlockedDays(blocked);
    } catch (error) {
      console.error('Erro ao carregar dias bloqueados:', error);
    }
  };

  const fetchAvailableTimes = async () => {
    try {
      const response = await api.get('/bookings/available', {
        params: { date: selectedDate },
      });
      setAvailableTimes(response.data.availableTimes);
      setScheduleConfig(response.data.scheduleConfig);
      setIsDayClosed(response.data.isDayClosed || false);
      setSelectedTime('');
    } catch (error) {
      toast.error(t('booking.errorBooking'));
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      toast.error(t('booking.selectService'));
      return;
    }
    if (step === 2 && !selectedDate) {
      toast.error(t('booking.selectDate'));
      return;
    }
    if (step === 3 && !selectedTime) {
      toast.error(t('booking.selectTime'));
      return;
    }
    if (user?.planId && userPlanSessions?.remaining <= 0 && !userPlanSessions) {
      toast.error(t('booking.noSessions'));
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        if (user.planId && userPlanSessions?.remaining <= 0) {
          toast.error(t('booking.limitReachedError'));
          setLoading(false);
          return;
        }

        await api.post('/bookings', {
          date: selectedDate,
          time: selectedTime,
          service: selectedService,
        });
        toast.success(t('booking.bookingSuccess'));
      } else {
        if (!walkInData.name || !walkInData.phone) {
          toast.error(t('booking.fillNamePhone'));
          setLoading(false);
          return;
        }
        await api.post('/bookings/walk-in', {
          name: walkInData.name,
          email: walkInData.email,
          phone: walkInCountryCode + walkInData.phone.replace(/[^\d]/g, ''),
          date: selectedDate,
          time: selectedTime,
          service: selectedService,
        });
        toast.success(t('booking.bookingSuccess'));
      }

      setStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedService('');
      setWalkInData({ name: '', email: '', phone: '' });
      setWalkInCountryCode('+55');
      if (user?.planId) checkPlanSessions();
    } catch (error) {
      toast.error(error.response?.data?.error || t('booking.errorBooking'));
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    const weekdays = [
      t('common.sunday'), t('common.monday'), t('common.tuesday'),
      t('common.wednesday'), t('common.thursday'), t('common.friday'),
      t('common.saturday')
    ];
    const months = [
      t('common.janShort'), t('common.febShort'), t('common.marShort'),
      t('common.aprShort'), t('common.mayShort'), t('common.junShort'),
      t('common.julShort'), t('common.augShort'), t('common.sepShort'),
      t('common.octShort'), t('common.novShort'), t('common.decShort')
    ];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const hasPlan = user?.planId;
  const isPaymentInPerson = !hasPlan;

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t('booking.title')} <span className="text-accent-400">{t('booking.titleAccent')}</span>
          </h1>
          <p className="text-dark-300 text-lg">
            {user ? t('booking.welcomeLoggedIn') : t('booking.noRegisterText')}
          </p>
        </div>

        {/* Aviso do Plano */}
        {user && userPlanSessions && (
          <div className="mb-8 p-4 bg-primary-600/20 border border-primary-600/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-400 font-semibold">{t('booking.yourPlan')}: {user.plan?.name || '-'}</p>
                <p className="text-dark-300 text-sm">
                  {t('booking.sessionsRemaining')}: <span className="text-white font-bold">{userPlanSessions.remaining}</span> {t('booking.of')} {userPlanSessions.total}
                </p>
              </div>
              {userPlanSessions.remaining === 0 && (
                <span className="px-3 py-1 bg-red-400/10 text-red-400 rounded-full text-sm font-semibold">
                  {t('booking.limitReached')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Aviso Pagamento Presencial */}
        {isPaymentInPerson && (
          <div className="mb-8 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl animate-slide-up">
            <div className="flex items-start gap-3">
              <FiCreditCard className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-yellow-400 font-semibold mb-1">{t('booking.paymentInPerson')}</p>
                <p className="text-dark-300 text-sm" dangerouslySetInnerHTML={{ __html: t('booking.paymentDesc') }} />
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s <= step
                      ? 'bg-gradient-gold text-dark-900'
                      : 'bg-dark-600 text-dark-400'
                  }`}
                >
                  {s < step ? <FiCheck /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-20 md:w-24 h-1 transition-all ${
                      s < step ? 'bg-accent-400' : 'bg-dark-600'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-lg mx-auto mt-2 text-xs md:text-sm text-dark-400">
            <span>{t('booking.service')}</span>
            <span>{t('booking.date')}</span>
            <span>{t('booking.time')}</span>
            <span>{t('booking.confirm')}</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-dark-700 p-6 md:p-8 rounded-xl border border-primary-600/30 shadow-premium animate-slide-up">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white mb-6">
                  {t('booking.chooseService')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className={`p-4 rounded-lg border transition-all flex items-center gap-3 text-left ${
                        selectedService === service
                          ? 'border-accent-400 bg-accent-400/10'
                          : 'border-primary-600/30 hover:border-accent-400/50'
                      }`}
                    >
                      <FiScissors className="text-accent-400 flex-shrink-0" />
                      <span className="text-white">{service}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Calendar */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white mb-6">
                  {t('booking.chooseDate')}
                </h2>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  blockedDays={blockedDays}
                />
                {isDayClosed && (
                  <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg flex items-center gap-3">
                    <FiAlertTriangle className="text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{t('booking.closedDayMsg')}</p>
                  </div>
                )}
                {selectedDate && (
                  <p className="text-center text-accent-400 font-semibold">
                    {t('booking.selectedDate')}: {formatDateDisplay(selectedDate)}
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Time */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white mb-6">
                  {t('booking.chooseTime')}
                </h2>
                {isDayClosed ? (
                  <div className="text-center py-12">
                    <FiCalendar className="mx-auto mb-4 text-red-400" size={48} />
                    <p className="text-red-400 mb-4">{t('booking.agendaClosed')}</p>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="text-accent-400 hover:text-accent-300 font-semibold"
                    >
                      {t('booking.chooseAnotherDate')}
                    </button>
                  </div>
                ) : availableTimes.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                            selectedTime === time
                              ? 'border-accent-400 bg-accent-400/10'
                              : 'border-primary-600/30 hover:border-accent-400/50'
                          }`}
                        >
                          <FiClock className="text-accent-400" />
                          <span className="text-white">{time}</span>
                        </button>
                      ))}
                    </div>
                    {scheduleConfig && (
                      <p className="text-center text-dark-400 text-sm">
                        {t('booking.operatingHours')}: {scheduleConfig.startTime} - {scheduleConfig.endTime}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-dark-400">
                    <FiCalendar className="mx-auto mb-4" size={48} />
                    <p>{t('booking.noAvailableTimes')}</p>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="mt-4 text-accent-400 hover:text-accent-300 font-semibold"
                    >
                      {t('booking.chooseAnotherDate')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white mb-6">
                  {t('booking.confirmBooking')}
                </h2>

                {/* Summary */}
                <div className="p-6 bg-dark-600 rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <FiScissors className="text-accent-400" />
                    <div>
                      <p className="text-dark-400 text-sm">{t('booking.service')}</p>
                      <p className="text-white font-semibold">{selectedService}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-accent-400" />
                    <div>
                      <p className="text-dark-400 text-sm">{t('booking.date')}</p>
                      <p className="text-white font-semibold">{formatDateDisplay(selectedDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiClock className="text-accent-400" />
                    <div>
                      <p className="text-dark-400 text-sm">{t('booking.time')}</p>
                      <p className="text-white font-semibold">{selectedTime}</p>
                    </div>
                  </div>
                </div>

                {/* Aviso de pagamento presencial no resumo */}
                {isPaymentInPerson && (
                  <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex items-start gap-3">
                    <FiCreditCard className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-yellow-400 font-semibold text-sm mb-1">{t('booking.paymentInPerson')}</p>
                      <p className="text-dark-300 text-xs">{t('booking.paymentSummary')}</p>
                    </div>
                  </div>
                )}

                {/* Walk-in info */}
                {!user && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('booking.yourData')}</h3>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                      <input
                        type="text"
                        value={walkInData.name}
                        onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                        placeholder={t('booking.namePlaceholder')}
                        required
                      />
                    </div>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                      <input
                        type="email"
                        value={walkInData.email}
                        onChange={(e) => setWalkInData({ ...walkInData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                        placeholder={t('booking.emailOptionalPlaceholder')}
                      />
                    </div>
                    <div className="flex gap-0">
                      <CountryCodeSelector value={walkInCountryCode} onChange={setWalkInCountryCode} />
                      <div className="relative flex-1">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                          type="tel"
                          value={walkInData.phone}
                          onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-r-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                          placeholder={t('booking.phonePlaceholder')}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-3 border border-accent-400 text-accent-400 font-bold rounded-lg hover:bg-accent-400 hover:text-dark-900 transition-all"
                >
                  {t('booking.back')}
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all"
                >
                  {t('booking.next')}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('booking.booking') : t('booking.confirmBookingBtn')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

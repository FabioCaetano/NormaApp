import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import { FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiCheck, FiX, FiEdit2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CountryCodeSelector from '@components/CountryCodeSelector';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileCountryCode, setProfileCountryCode] = useState('+55');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    fetchBookings();
    // Extract country code from existing phone if present
    if (user?.phone) {
      const match = user.phone.match(/^(\+\d+)/);
      if (match) setProfileCountryCode(match[1]);
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data);
    } catch (error) {
      toast.error(t('dashboard.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success(t('dashboard.bookingCanceled'));
      fetchBookings();
    } catch (error) {
      toast.error(t('dashboard.errorCanceling'));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profileData,
        phone: profileCountryCode + profileData.phone.replace(/[^\d]/g, ''),
      };
      const response = await api.put('/users/me', payload);
      updateUser(response.data);
      toast.success(t('dashboard.profileUpdated'));
      setEditingProfile(false);
    } catch (error) {
      toast.error(t('dashboard.errorUpdating'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'COMPLETED':
        return 'text-green-400 bg-green-400/10';
      case 'CANCELLED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-dark-400 bg-dark-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return t('dashboard.scheduled');
      case 'COMPLETED':
        return t('dashboard.completed');
      case 'CANCELLED':
        return t('dashboard.cancelled');
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'en' ? 'en-US' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const upcomingBookings = bookings.filter(b => b.status === 'SCHEDULED');
  const pastBookings = bookings.filter(b => b.status !== 'SCHEDULED');

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t('dashboard.greeting')}, <span className="text-accent-400">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-dark-300 text-lg">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-white">{t('dashboard.profile')}</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="text-accent-400 hover:text-accent-300 transition-colors"
                >
                  <FiEdit2 />
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-dark-200 text-sm mb-2">{t('dashboard.name')}</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-dark-200 text-sm mb-2">{t('dashboard.phone')}</label>
                    <div className="flex gap-0">
                      <CountryCodeSelector value={profileCountryCode} onChange={setProfileCountryCode} />
                      <div className="relative flex-1">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 bg-dark-600 border border-primary-600/30 rounded-r-lg text-white focus:border-accent-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all"
                    >
                      {t('dashboard.save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="flex-1 py-2 border border-dark-400 text-dark-400 rounded-lg hover:border-accent-400 hover:text-accent-400 transition-all"
                    >
                      {t('dashboard.cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo-norma.png" 
                      alt="Norma Brasil" 
                      className="h-12 w-auto object-contain"
                    />
                    <div>
                      <p className="text-white font-semibold">{user?.name}</p>
                      <p className="text-dark-400 text-sm">{t('dashboard.premiumClient')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-dark-300">
                    <FiMail className="text-accent-400" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-dark-300">
                    <FiPhone className="text-accent-400" />
                    <span className="text-sm">{user?.phone}</span>
                  </div>

                  {user?.plan && (
                    <div className="mt-6 p-4 bg-primary-600/20 rounded-lg border border-primary-600/30">
                      <p className="text-dark-400 text-sm">{t('dashboard.yourPlan')}</p>
                      <p className="text-white font-bold text-lg">{user.plan.name}</p>
                      <p className="text-accent-400">R$ {user.plan.price.toFixed(2).replace('.', ',')}{t('dashboard.perMonth')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            {/* Upcoming Bookings */}
            <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-slide-up mb-8">
              <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <FiCalendar className="text-accent-400" />
                {t('dashboard.upcoming')}
              </h2>

              {loading ? (
                <div className="text-center py-8 text-dark-400">{t('dashboard.loading')}</div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiCalendar className="text-accent-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{booking.service}</p>
                          <p className="text-dark-300 text-sm flex items-center gap-1">
                            <FiCalendar className="inline" size={14} />
                            {formatDate(booking.date)}
                          </p>
                          <p className="text-dark-300 text-sm flex items-center gap-1">
                            <FiClock className="inline" size={14} />
                            {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title={t('dashboard.cancelBooking')}
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-400">
                  <FiCalendar className="mx-auto mb-4" size={48} />
                  <p>{t('dashboard.noUpcoming')}</p>
                </div>
              )}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-slide-up">
                <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                  <FiClock className="text-accent-400" />
                  {t('dashboard.history')}
                </h2>
                <div className="space-y-4">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-dark-500 rounded-lg flex items-center justify-center">
                          <FiCheck className="text-dark-300" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{booking.service}</p>
                          <p className="text-dark-400 text-sm">
                            {formatDate(booking.date)} às {booking.time}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

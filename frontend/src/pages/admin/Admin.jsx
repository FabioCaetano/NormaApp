import { useState, useEffect } from 'react';
import api from '@services/api';
import {
  FiUsers, FiCalendar, FiDollarSign, FiClock, FiCheck, FiX, FiPlus, FiTrash2, FiEdit2,
  FiUser, FiMail, FiPhone, FiBell, FiSettings,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleConfigs, setScheduleConfigs] = useState([]);
  const [clientsNeedReminder, setClientsNeedReminder] = useState([]);
  const [blockedDays, setBlockedDays] = useState([]);
  const [selectedBlockMonth, setSelectedBlockMonth] = useState(new Date().getMonth() + 1);
  const [selectedBlockYear, setSelectedBlockYear] = useState(new Date().getFullYear());

  // Modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [blockData, setBlockData] = useState({ date: '', time: '', reason: '' });
  const [planData, setPlanData] = useState({ name: '', description: '', price: '', sessions: '' });

  useEffect(() => {
    fetchData();
    fetchScheduleConfigs();
    fetchClientsNeedReminder();
    fetchBlockedDays();
  }, [activeTab, selectedBlockMonth, selectedBlockYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, clientsRes, plansRes, leadsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/bookings'),
        api.get('/admin/clients'),
        api.get('/plans'),
        api.get('/admin/leads'),
      ]);

      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setClients(clientsRes.data);
      setPlans(plansRes.data);
      setLeads(leadsRes.data);
    } catch (error) {
      toast.error(t('admin.errorLoading') || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleConfigs = async () => {
    try {
      const response = await api.get('/admin/schedule-config');
      setScheduleConfigs(response.data);
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const fetchClientsNeedReminder = async () => {
    try {
      const response = await api.get('/admin/clients/need-reminder');
      setClientsNeedReminder(response.data);
    } catch (error) {
      console.error('Error loading reminder clients:', error);
    }
  };

  const fetchBlockedDays = async () => {
    try {
      const response = await api.get('/admin/blocked-days', {
        params: { month: selectedBlockMonth, year: selectedBlockYear },
      });
      setBlockedDays(response.data);
    } catch (error) {
      console.error('Error loading blocked days:', error);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      toast.success(t('admin.statusUpdated'));
      fetchData();
    } catch (error) {
      toast.error(t('admin.errorUpdatingStatus'));
    }
  };

  const handleBlockSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/block-schedule', blockData);
      toast.success(t('admin.slotBlocked'));
      setShowBlockModal(false);
      setBlockData({ date: '', time: '', reason: '' });
    } catch (error) {
      toast.error(t('admin.errorBlockingSlot'));
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/plans', planData);
      toast.success(t('admin.planCreated'));
      setShowPlanModal(false);
      setPlanData({ name: '', description: '', price: '', sessions: '' });
      fetchData();
    } catch (error) {
      toast.error(t('admin.errorCreatingPlan'));
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm(t('admin.confirmDeletePlan'))) return;
    try {
      await api.delete(`/admin/plans/${planId}`);
      toast.success(t('admin.planDeleted'));
      fetchData();
    } catch (error) {
      toast.error(t('admin.errorDeletingPlan'));
    }
  };

  const handleAssignPlan = async (clientId, planId) => {
    try {
      await api.put(`/admin/clients/${clientId}/plan`, { planId });
      toast.success(t('admin.planAssigned'));
      fetchData();
    } catch (error) {
      toast.error(t('admin.errorAssigningPlan'));
    }
  };

  const handleSendReminder = async (clientId, clientName) => {
    if (!confirm(`${t('admin.sendReminder')} ${clientName}?`)) return;
    try {
      const response = await api.post(`/admin/clients/${clientId}/reminder`);
      toast.success(`${t('admin.reminderSent')} ${response.data.client.name}!`);
      fetchClientsNeedReminder();
      fetchData();
    } catch (error) {
      toast.error(t('admin.errorSendingReminder'));
    }
  };

  const handleScheduleConfigChange = (id, field, value) => {
    setScheduleConfigs(prev =>
      prev.map(config =>
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  const handleSaveScheduleConfigs = async () => {
    try {
      await api.put('/admin/schedule-config/batch', { configs: scheduleConfigs });
      toast.success(t('admin.scheduleSaved'));
      fetchScheduleConfigs();
    } catch (error) {
      toast.error(t('admin.errorSavingSchedule'));
    }
  };

  const handleBlockDay = async (date, reason) => {
    try {
      await api.post('/admin/block-day', { date, reason });
      toast.success(t('admin.dayBlocked'));
      fetchBlockedDays();
    } catch (error) {
      toast.error(error.response?.data?.error || t('admin.errorBlockingDay'));
    }
  };

  const handleUnblockDay = async (date) => {
    if (!confirm(t('admin.confirmUnblockDay', { date }))) return;
    try {
      await api.delete(`/admin/blocked-day/${date}`);
      toast.success(t('admin.dayUnblocked'));
      fetchBlockedDays();
    } catch (error) {
      toast.error(t('admin.errorUnblockingDay'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} ${t('admin.at')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-400/10 text-yellow-400';
      case 'COMPLETED':
        return 'bg-green-400/10 text-green-400';
      case 'CANCELLED':
        return 'bg-red-400/10 text-red-400';
      default:
        return 'bg-dark-600 text-dark-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return t('admin.scheduled');
      case 'COMPLETED':
        return t('admin.completed');
      case 'CANCELLED':
        return t('admin.cancelled');
      default:
        return status;
    }
  };

  const tabs = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: <FiDollarSign /> },
    { id: 'bookings', label: t('admin.bookings'), icon: <FiCalendar /> },
    { id: 'clients', label: t('admin.clients'), icon: <FiUsers /> },
    { id: 'plans', label: t('admin.plans'), icon: <FiDollarSign /> },
    { id: 'schedule', label: t('admin.schedule'), icon: <FiClock /> },
    { id: 'reminders', label: t('admin.reminders'), icon: <FiBell /> },
    { id: 'leads', label: t('admin.leads'), icon: <FiUser /> },
  ];

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t('admin.pageTitle')}
          </h1>
          <p className="text-dark-300 text-lg">{t('admin.pageSubtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-slide-up">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-gold text-dark-900'
                  : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="text-accent-400" size={32} />
                </div>
                <p className="text-dark-400 text-sm">{t('admin.totalClients')}</p>
                <p className="text-3xl font-bold text-white">{stats.totalClients || 0}</p>
              </div>
              <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
                <div className="flex items-center justify-between mb-4">
                  <FiCalendar className="text-accent-400" size={32} />
                </div>
                <p className="text-dark-400 text-sm">{t('admin.activeBookings')}</p>
                <p className="text-3xl font-bold text-white">{stats.totalBookings || 0}</p>
              </div>
              <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
                <div className="flex items-center justify-between mb-4">
                  <FiClock className="text-accent-400" size={32} />
                </div>
                <p className="text-dark-400 text-sm">{t('admin.todayBookings')}</p>
                <p className="text-3xl font-bold text-white">{stats.todayBookings || 0}</p>
              </div>
              <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
                <div className="flex items-center justify-between mb-4">
                  <FiBell className="text-accent-400" size={32} />
                </div>
                <p className="text-dark-400 text-sm">{t('admin.needReminder')}</p>
                <p className="text-3xl font-bold text-white">{stats.clientsNeedReminder || 0}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
              <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.quickActions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="p-4 bg-dark-600 rounded-lg border border-primary-600/30 hover:border-accent-400 transition-all flex items-center gap-3"
                >
                  <FiClock className="text-accent-400" />
                  <span className="text-white font-semibold">{t('admin.blockSchedule')}</span>
                </button>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="p-4 bg-dark-600 rounded-lg border border-primary-600/30 hover:border-accent-400 transition-all flex items-center gap-3"
                >
                  <FiPlus className="text-accent-400" />
                  <span className="text-white font-semibold">{t('admin.createPlan')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-fade-in">
            <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.allBookings')}</h3>
            {loading ? (
              <div className="text-center py-8 text-dark-400">{t('admin.loading')}</div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="text-accent-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {booking.user?.name || booking.clientName}
                        </p>
                        <p className="text-dark-300 text-sm">{booking.service}</p>
                        <p className="text-dark-400 text-sm">
                          {formatDate(booking.date)} {t('admin.at')} {booking.time}
                        </p>
                        {(booking.clientEmail || booking.clientPhone) && (
                          <div className="flex gap-4 mt-2 text-xs text-dark-400">
                            {booking.clientEmail && (
                              <span className="flex items-center gap-1">
                                <FiMail size={12} /> {booking.clientEmail}
                              </span>
                            )}
                            {booking.clientPhone && (
                              <span className="flex items-center gap-1">
                                <FiPhone size={12} /> {booking.clientPhone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      {booking.status === 'SCHEDULED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                            className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                            title={t('admin.markCompleted')}
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title={t('admin.cancel')}
                          >
                            <FiX />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">{t('admin.noBookingsFound')}</div>
            )}
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-fade-in">
            <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.manageClients')}</h3>
            {loading ? (
              <div className="text-center py-8 text-dark-400">{t('admin.loading')}</div>
            ) : clients.length > 0 ? (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src="/logo-norma.png"
                        alt="Norma Brasil"
                        className="h-12 w-auto object-contain flex-shrink-0"
                      />
                      <div>
                        <p className="text-white font-semibold">{client.name}</p>
                        <div className="flex gap-4 text-sm text-dark-400">
                          <span className="flex items-center gap-1"><FiMail size={12} /> {client.email}</span>
                          <span className="flex items-center gap-1"><FiPhone size={12} /> {client.phone}</span>
                        </div>
                        <p className="text-dark-400 text-xs mt-1">
                          {t('admin.memberSince')} {formatDate(client.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={client.planId || ''}
                        onChange={(e) => handleAssignPlan(client.id, e.target.value)}
                        className="px-3 py-2 bg-dark-500 border border-primary-600/30 rounded-lg text-white text-sm focus:border-accent-400 focus:outline-none"
                      >
                        <option value="">{t('admin.noPlan')}</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                      </select>
                      {client.plan && (
                        <span className="px-3 py-1 bg-primary-600/20 text-accent-400 rounded-lg text-sm font-semibold">
                          {client.plan.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">{t('admin.noClientsFound')}</div>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-white">{t('admin.managePlans')}</h3>
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-4 py-2 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all flex items-center gap-2"
              >
                <FiPlus />
                {t('admin.createPlanTitle')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-serif font-bold text-white">{plan.name}</h4>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <p className="text-dark-300 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-accent-400">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-dark-400 text-sm">{t('admin.perMonthLabel')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">{plan.sessions} {t('admin.sessionsPerMonth')}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${plan.isActive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {plan.isActive ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-fade-in">
            <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.capturedLeads')}</h3>
            {loading ? (
              <div className="text-center py-8 text-dark-400">{t('admin.loading')}</div>
            ) : leads.length > 0 ? (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src="/logo-norma.png"
                        alt="Norma Brasil"
                        className="h-10 w-auto object-contain"
                      />
                      <div>
                        <p className="text-white font-semibold">{lead.name}</p>
                        <div className="flex gap-4 text-sm text-dark-400">
                          {lead.email && <span className="flex items-center gap-1"><FiMail size={12} /> {lead.email}</span>}
                          <span className="flex items-center gap-1"><FiPhone size={12} /> {lead.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-dark-400 text-sm">{formatDate(lead.createdAt)}</p>
                      <span className="text-xs text-accent-400 bg-accent-400/10 px-2 py-1 rounded mt-1 inline-block">
                        {lead.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">{t('admin.noLeadsFound')}</div>
            )}
          </div>
        )}

        {/* Schedule Config Tab */}
        {activeTab === 'schedule' && (
          <div className="animate-fade-in space-y-8">
            {/* Configuração de Horários por Dia */}
            <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-white">{t('admin.scheduleConfig')}</h3>
                <button
                  onClick={handleSaveScheduleConfigs}
                  className="px-6 py-2 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all"
                >
                  {t('admin.saveChanges')}
                </button>
              </div>
              <div className="space-y-4">
                {scheduleConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex flex-col md:flex-row md:items-center gap-4"
                  >
                    <div className="flex items-center gap-4 md:w-40">
                      <span className="text-white font-semibold">
                        {t(['common.sunday', 'common.monday', 'common.tuesday', 'common.wednesday', 'common.thursday', 'common.friday', 'common.saturday'][config.dayOfWeek])}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.isOpen}
                          onChange={(e) => handleScheduleConfigChange(config.id, 'isOpen', e.target.checked)}
                          className="w-4 h-4 accent-accent-400"
                        />
                        <span className={`text-sm ${config.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                          {config.isOpen ? t('admin.open') : t('admin.closed')}
                        </span>
                      </label>
                    </div>
                    {config.isOpen && (
                      <div className="flex flex-wrap gap-4 flex-1">
                        <div>
                          <label className="block text-dark-400 text-xs mb-1">{t('admin.startTime')}</label>
                          <input
                            type="time"
                            value={config.startTime}
                            onChange={(e) => handleScheduleConfigChange(config.id, 'startTime', e.target.value)}
                            className="px-3 py-2 bg-dark-500 border border-primary-600/30 rounded-lg text-white text-sm focus:border-accent-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-400 text-xs mb-1">{t('admin.endTime')}</label>
                          <input
                            type="time"
                            value={config.endTime}
                            onChange={(e) => handleScheduleConfigChange(config.id, 'endTime', e.target.value)}
                            className="px-3 py-2 bg-dark-500 border border-primary-600/30 rounded-lg text-white text-sm focus:border-accent-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-400 text-xs mb-1">{t('admin.duration')}</label>
                          <select
                            value={config.slotDuration}
                            onChange={(e) => handleScheduleConfigChange(config.id, 'slotDuration', Number(e.target.value))}
                            className="px-3 py-2 bg-dark-500 border border-primary-600/30 rounded-lg text-white text-sm focus:border-accent-400 focus:outline-none"
                          >
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bloqueio de Dias */}
            <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
              <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.blockedDays')}</h3>

              {/* Filtro de mês */}
              <div className="flex gap-4 mb-6">
                <select
                  value={selectedBlockMonth}
                  onChange={(e) => setSelectedBlockMonth(Number(e.target.value))}
                  className="px-4 py-2 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                >
                  {t('admin.months', { returnObjects: true }).map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedBlockYear}
                  onChange={(e) => setSelectedBlockYear(Number(e.target.value))}
                  className="px-4 py-2 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Lista de dias bloqueados */}
              {blockedDays.length > 0 ? (
                <div className="space-y-3">
                  {blockedDays.map((day) => (
                    <div
                      key={day.date}
                      className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-semibold">{day.date}</p>
                        <p className="text-dark-400 text-sm">{day.reason || t('admin.noReason')}</p>
                        <p className="text-dark-500 text-xs">{day.slots.length} {t('admin.slotsBlocked')}</p>
                      </div>
                      <button
                        onClick={() => handleUnblockDay(day.date)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-400">
                  <FiCheck className="mx-auto mb-4 text-green-400" size={48} />
                  <p>{t('admin.noBlockedDays')}</p>
                </div>
              )}
            </div>

            {/* Bloquear Dia Inteiro */}
            <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium">
              <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.blockFullDay')}</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="date"
                  id="blockDayDate"
                  className="flex-1 px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                />
                <input
                  type="text"
                  id="blockDayReason"
                  placeholder={t('admin.reasonPlaceholder')}
                  className="flex-1 px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const date = document.getElementById('blockDayDate').value;
                    const reason = document.getElementById('blockDayReason').value;
                    if (date) {
                      handleBlockDay(date, reason);
                      document.getElementById('blockDayDate').value = '';
                      document.getElementById('blockDayReason').value = '';
                    } else {
                      toast.error(t('admin.selectDate'));
                    }
                  }}
                  className="px-6 py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all"
                >
                  {t('admin.blockDay')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">{t('admin.clientsForReminder')}</h3>
                <p className="text-dark-400 text-sm mt-1">
                  {t('admin.clientsForReminderDesc')}
                </p>
              </div>
              <div className="px-4 py-2 bg-accent-400/10 text-accent-400 rounded-lg font-bold">
                {clientsNeedReminder.length} {t('admin.clientsCount')}
              </div>
            </div>

            {clientsNeedReminder.length > 0 ? (
              <div className="space-y-4">
                {clientsNeedReminder.map((client) => {
                  const daysSince = client.lastBookingDate
                    ? Math.floor((Date.now() - new Date(client.lastBookingDate).getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={client.id}
                      className="p-4 bg-dark-600 rounded-lg border border-primary-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src="/logo-norma.png"
                          alt="Norma Brasil"
                          className="h-12 w-auto object-contain flex-shrink-0"
                        />
                        <div>
                          <p className="text-white font-semibold">{client.name}</p>
                          <div className="flex gap-4 text-sm text-dark-400">
                            <span className="flex items-center gap-1"><FiMail size={12} /> {client.email}</span>
                            <span className="flex items-center gap-1"><FiPhone size={12} /> {client.phone}</span>
                          </div>
                          <p className="text-xs mt-1">
                            {client.plan ? (
                              <span className="text-accent-400">{t('admin.plan')}: {client.plan.name}</span>
                            ) : (
                              <span className="text-dark-500">{t('admin.noPlan')}</span>
                            )}
                            {daysSince !== null && (
                              <span className="text-yellow-400 ml-2">• {daysSince} {t('admin.daysSinceLast')}</span>
                            )}
                            {daysSince === null && (
                              <span className="text-yellow-400 ml-2">• {t('admin.neverBooked')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {client.lastReminderSent && (
                          <p className="text-dark-500 text-xs">
                            {t('admin.lastReminder')}: {formatDate(client.lastReminderSent)}
                          </p>
                        )}
                        <button
                          onClick={() => handleSendReminder(client.id, client.name)}
                          className="px-4 py-2 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all flex items-center gap-2"
                        >
                          <FiBell />
                          {t('admin.remind')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiBell className="mx-auto mb-4 text-green-400" size={48} />
                <p>{t('admin.allClientsUpToDate')}</p>
                <p className="text-dark-500 text-sm mt-2">{t('admin.noReminderNeeded')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Block Schedule Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium-lg max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.blockScheduleTitle')}</h3>
            <form onSubmit={handleBlockSchedule} className="space-y-4">
              <div>
                <label className="block text-dark-200 text-sm mb-2">{t('admin.date')}</label>
                <input
                  type="date"
                  value={blockData.date}
                  onChange={(e) => setBlockData({ ...blockData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-dark-200 text-sm mb-2">{t('admin.time')}</label>
                <select
                  value={blockData.time}
                  onChange={(e) => setBlockData({ ...blockData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                  required
                >
                  <option value="">{t('admin.select')}</option>
                  {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-dark-200 text-sm mb-2">{t('admin.reasonOptional')}</label>
                <input
                  type="text"
                  value={blockData.reason}
                  onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                  placeholder={t('admin.reasonPlaceholder')}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all"
                >
                  {t('admin.block')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-3 border border-dark-400 text-dark-400 rounded-lg hover:border-accent-400 hover:text-accent-400 transition-all"
                >
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-700 p-6 rounded-xl border border-primary-600/30 shadow-premium-lg max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-white mb-6">{t('admin.createPlanTitle')}</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-dark-200 text-sm mb-2">{t('admin.planName')}</label>
                <input
                  type="text"
                  value={planData.name}
                  onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                  placeholder={t('admin.planNamePlaceholder')}
                  required
                />
              </div>
              <div>
                <label className="block text-dark-200 text-sm mb-2">{t('admin.description')}</label>
                <textarea
                  value={planData.description}
                  onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none resize-none"
                  rows="3"
                  placeholder={t('admin.descriptionPlaceholder')}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-200 text-sm mb-2">{t('admin.price')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planData.price}
                    onChange={(e) => setPlanData({ ...planData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                    placeholder={t('admin.pricePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-dark-200 text-sm mb-2">{t('admin.sessionsMonth')}</label>
                  <input
                    type="number"
                    value={planData.sessions}
                    onChange={(e) => setPlanData({ ...planData, sessions: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white focus:border-accent-400 focus:outline-none"
                    placeholder="2"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all"
                >
                  {t('admin.createPlan')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-3 border border-dark-400 text-dark-400 rounded-lg hover:border-accent-400 hover:text-accent-400 transition-all"
                >
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

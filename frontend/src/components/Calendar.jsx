import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Calendar({ selectedDate, onDateSelect, blockedDays = [], disabledDays = [] }) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleConfigs, setScheduleConfigs] = useState([]);

  useEffect(() => {
    // Buscar configurações de horários
    const configs = [
      { dayOfWeek: 0, isOpen: false },  // Domingo - fechado
      { dayOfWeek: 1, isOpen: true },   // Segunda
      { dayOfWeek: 2, isOpen: true },   // Terça
      { dayOfWeek: 3, isOpen: true },   // Quarta
      { dayOfWeek: 4, isOpen: true },   // Quinta
      { dayOfWeek: 5, isOpen: true },   // Sexta
      { dayOfWeek: 6, isOpen: true },   // Sábado
    ];
    setScheduleConfigs(configs);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
      });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Não permitir datas passadas
    if (date < today) return true;

    // Não permitir datas além de 60 dias
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (date > maxDate) return true;

    // Verificar se o dia da semana está fechado
    const dayOfWeek = date.getDay();
    const config = scheduleConfigs.find(c => c.dayOfWeek === dayOfWeek);
    if (config && !config.isOpen) return true;

    // Verificar se está na lista de dias bloqueados (usa data local)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    if (blockedDays.includes(dateStr)) return true;

    return false;
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    // Parsear a string de data como local (evita bug UTC que desloca 1 dia)
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    return date.toDateString() === selected.toDateString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-dark-700 rounded-xl border border-primary-600/30 p-6">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-accent-400"
        >
          <FiChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {t(`calendar.${['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'][currentDate.getMonth()]}`)} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-accent-400"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-dark-400 py-2">
            {t(`calendar.${day}`)}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const disabled = isDateDisabled(day.date);
          const selected = isSelected(day.date);
          const today = isToday(day.date);

          return (
            <button
              key={index}
              onClick={() => {
                const d = day.date;
                const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                !disabled && onDateSelect(localDate);
              }}
              disabled={disabled}
              className={`
                relative h-10 rounded-lg text-sm font-medium transition-all
                ${!day.isCurrentMonth ? 'text-dark-600' : ''}
                ${selected ? 'bg-gradient-gold text-dark-900 font-bold' : ''}
                ${today && !selected ? 'ring-2 ring-accent-400 text-white' : ''}
                ${!selected && !disabled && day.isCurrentMonth ? 'text-white hover:bg-dark-600' : ''}
                ${disabled ? 'text-dark-700 cursor-not-allowed line-through' : 'cursor-pointer'}
              `}
            >
              {day.date.getDate()}
              {selected && (
                <div className="absolute -top-1 -right-1">
                  <FiCheck className="text-dark-900" size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t border-primary-600/20">
        <div className="flex flex-wrap gap-4 text-xs text-dark-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-gold rounded"></div>
            <span>{t('calendar.selected')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-accent-400 rounded"></div>
            <span>{t('calendar.today')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-dark-700 line-through rounded"></div>
            <span>{t('calendar.unavailable')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

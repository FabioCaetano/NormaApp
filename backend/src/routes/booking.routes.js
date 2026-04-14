const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { notifyBooking } = require('../services/whatsapp');

const router = Router();

// Criar agendamento (cliente logado)
router.post('/', authMiddleware, async (req, res) => {
  const { date, time, service } = req.body;

  if (!date || !time || !service) {
    return res.status(400).json({ error: 'Data, horário e serviço são obrigatórios' });
  }

  // Verificar conflitos de horário
  const bookingDate = new Date(date);
  const existingBooking = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
      time,
      status: { not: 'CANCELLED' },
    },
  });

  if (existingBooking) {
    return res.status(409).json({ error: 'Horário já reservado' });
  }

  // Verificar se está bloqueado
  const blocked = await prisma.blockedSchedule.findFirst({
    where: { date: bookingDate, time },
  });

  if (blocked) {
    return res.status(409).json({ error: 'Horário bloqueado: ' + blocked.reason });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: req.userId,
      date: bookingDate,
      time,
      service,
      status: 'SCHEDULED',
      isWalkIn: false,
    },
    include: { user: { select: { name: true, phone: true } } },
  });

  // Enviar notificação WhatsApp (fire and forget)
  if (process.env.WHATSAPP_ENABLED === 'true') {
    notifyBooking(booking, process.env.BARBER_PHONE).catch(err => {
      console.error('Erro ao enviar notificação WhatsApp:', err);
    });
  }

  return res.status(201).json(booking);
});

// Criar agendamento avulso (sem login)
router.post('/walk-in', async (req, res) => {
  const { name, email, phone, date, time, service } = req.body;

  if (!name || !phone || !date || !time || !service) {
    return res.status(400).json({ error: 'Nome, telefone, data, horário e serviço são obrigatórios' });
  }

  const bookingDate = new Date(date);

  // Verificar conflitos
  const existingBooking = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
      time,
      status: { not: 'CANCELLED' },
    },
  });

  if (existingBooking) {
    return res.status(409).json({ error: 'Horário já reservado' });
  }

  const blocked = await prisma.blockedSchedule.findFirst({
    where: { date: bookingDate, time },
  });

  if (blocked) {
    return res.status(409).json({ error: 'Horário bloqueado: ' + blocked.reason });
  }

  const booking = await prisma.booking.create({
    data: {
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      date: bookingDate,
      time,
      service,
      status: 'SCHEDULED',
      isWalkIn: true,
    },
  });

  // Criar lead
  await prisma.lead.create({
    data: { name, email, phone, source: 'WEBSITE' },
  });

  // Enviar notificação WhatsApp (fire and forget)
  if (process.env.WHATSAPP_ENABLED === 'true') {
    notifyBooking(booking, process.env.BARBER_PHONE).catch(err => {
      console.error('Erro ao enviar notificação WhatsApp:', err);
    });
  }

  return res.status(201).json(booking);
});

// Obter dias bloqueados (público — usado na página de agendamento)
router.get('/blocked-days', async (req, res) => {
  const { month, year } = req.query;

  let where = {};
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    where.date = { gte: startDate, lte: endDate };
  }

  const blocked = await prisma.blockedSchedule.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  const blockedByDate = {};
  blocked.forEach(b => {
    const dateKey = b.date.toISOString().split('T')[0];
    if (!blockedByDate[dateKey]) {
      blockedByDate[dateKey] = { date: dateKey, reason: b.reason, slots: [] };
    }
    blockedByDate[dateKey].slots.push(b.time);
  });

  return res.json(Object.values(blockedByDate));
});

// Listar agendamentos do usuário
router.get('/my', authMiddleware, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.userId },
    orderBy: [{ date: 'desc' }, { time: 'desc' }],
  });

  return res.json(bookings);
});

// Cancelar agendamento
router.delete('/:id', authMiddleware, async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  if (booking.userId !== req.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });

  return res.json({ message: 'Agendamento cancelado com sucesso' });
});

// Listar horários disponíveis
router.get('/available', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Data é obrigatória' });
  }

  const bookingDate = new Date(date);
  const dayOfWeek = bookingDate.getDay();

  // Buscar configuração do dia da semana
  const scheduleConfig = await prisma.scheduleConfig.findUnique({
    where: { dayOfWeek },
  });

  // Se não há config ou dia está fechado, retornar vazio
  if (!scheduleConfig || !scheduleConfig.isOpen) {
    return res.json({ date, availableTimes: [], isDayClosed: true });
  }

  // Gerar horários baseado na configuração
  const workingHours = generateTimeSlots(
    scheduleConfig.startTime,
    scheduleConfig.endTime,
    scheduleConfig.slotDuration
  );

  // Buscar agendamentos existentes
  const existingBookings = await prisma.booking.findMany({
    where: {
      date: bookingDate,
      status: { not: 'CANCELLED' },
    },
    select: { time: true },
  });

  const bookedTimes = existingBookings.map(b => b.time);

  // Buscar horários bloqueados
  const blockedSchedules = await prisma.blockedSchedule.findMany({
    where: { date: bookingDate },
    select: { time: true },
  });

  const blockedTimes = blockedSchedules.map(b => b.time);

  const availableTimes = workingHours.filter(
    time => !bookedTimes.includes(time) && !blockedTimes.includes(time)
  );

  return res.json({ 
    date, 
    availableTimes,
    scheduleConfig: {
      startTime: scheduleConfig.startTime,
      endTime: scheduleConfig.endTime,
      slotDuration: scheduleConfig.slotDuration,
    }
  });
});

// Helper function
function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let current = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;

  while (current < end) {
    const hours = Math.floor(current / 60);
    const mins = current % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    current += duration;
  }

  return slots;
}

module.exports = router;

const { Router } = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = Router();

// Todas as rotas admin exigem autenticação e role ADMIN
router.use(authMiddleware);
router.use(adminOnly);

// Dashboard stats
router.get('/stats', async (req, res) => {
  const [
    totalClients,
    totalBookings,
    todayBookings,
    activePlans,
    totalLeads,
    clientsNeedReminder,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.booking.count({ where: { status: 'SCHEDULED' } }),
    prisma.booking.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: 'SCHEDULED',
      },
    }),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.lead.count(),
    // Clientes que não agendam há mais de 30 dias
    prisma.user.count({
      where: {
        role: 'CLIENT',
        OR: [
          { lastBookingDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          { lastBookingDate: null },
        ],
      },
    }),
  ]);

  return res.json({
    totalClients,
    totalBookings,
    todayBookings,
    activePlans,
    totalLeads,
    clientsNeedReminder,
  });
});

// Gerenciar Clientes
router.get('/clients', async (req, res) => {
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    include: { 
      plan: true, 
      bookings: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(clients);
});

router.put('/clients/:id/plan', async (req, res) => {
  const { planId } = req.body;

  const client = await prisma.user.update({
    where: { id: req.params.id },
    data: { planId },
    include: { plan: true },
  });

  return res.json(client);
});

// Enviar lembrete para cliente
router.post('/clients/:id/reminder', async (req, res) => {
  const client = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!client) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const daysSinceLastBooking = client.lastBookingDate
    ? Math.floor((Date.now() - new Date(client.lastBookingDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Atualizar último lembrete enviado
  await prisma.user.update({
    where: { id: req.params.id },
    data: { lastReminderSent: new Date() },
  });

  return res.json({
    message: `Lembrete enviado para ${client.name}`,
    client: {
      name: client.name,
      phone: client.phone,
      email: client.email,
      daysSinceLastBooking,
    },
  });
});

// Obter clientes que precisam de lembrete
router.get('/clients/need-reminder', async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const clients = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
      OR: [
        { lastBookingDate: { lt: thirtyDaysAgo } },
        { lastBookingDate: null },
      ],
    },
    include: { plan: true },
    orderBy: { lastBookingDate: 'asc' },
  });

  return res.json(clients);
});

// Gerenciar Planos
router.post('/plans', async (req, res) => {
  const { name, description, price, sessions } = req.body;

  const plan = await prisma.plan.create({
    data: { name, description, price, sessions },
  });

  return res.status(201).json(plan);
});

router.put('/plans/:id', async (req, res) => {
  const { name, description, price, sessions, isActive } = req.body;

  const plan = await prisma.plan.update({
    where: { id: req.params.id },
    data: { name, description, price, sessions, isActive },
  });

  return res.json(plan);
});

router.delete('/plans/:id', async (req, res) => {
  await prisma.plan.delete({
    where: { id: req.params.id },
  });

  return res.json({ message: 'Plano excluído com sucesso' });
});

// Gerenciar Agendamentos
router.get('/bookings', async (req, res) => {
  const { date, status } = req.query;

  const where = {};
  if (date) where.date = new Date(date);
  if (status) where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true, plan: true } } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  return res.json(bookings);
});

router.put('/bookings/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
  });

  // Se completou, atualizar último agendamento do cliente
  if (status === 'COMPLETED' && booking.userId) {
    await prisma.user.update({
      where: { id: booking.userId },
      data: { lastBookingDate: new Date() },
    });
  }

  return res.json(booking);
});

// Bloquear Horários
router.post('/block-schedule', async (req, res) => {
  const { date, time, reason } = req.body;

  const blocked = await prisma.blockedSchedule.create({
    data: { date: new Date(date), time, reason },
  });

  return res.status(201).json(blocked);
});

router.get('/blocked-schedules', async (req, res) => {
  const blocked = await prisma.blockedSchedule.findMany({
    orderBy: { date: 'desc' },
  });

  return res.json(blocked);
});

router.delete('/blocked-schedules/:id', async (req, res) => {
  await prisma.blockedSchedule.delete({
    where: { id: req.params.id },
  });

  return res.json({ message: 'Bloqueio removido com sucesso' });
});

// ===== CONFIGURAÇÃO DE HORÁRIOS =====

// Obter configurações de horários
router.get('/schedule-config', async (req, res) => {
  const configs = await prisma.scheduleConfig.findMany({
    orderBy: { dayOfWeek: 'asc' },
  });

  return res.json(configs);
});

// Atualizar configuração de horário
router.put('/schedule-config/:id', async (req, res) => {
  const { isOpen, startTime, endTime, slotDuration } = req.body;

  const config = await prisma.scheduleConfig.update({
    where: { id: req.params.id },
    data: { isOpen, startTime, endTime, slotDuration },
  });

  return res.json(config);
});

// Atualizar todas as configurações de horários
router.put('/schedule-config/batch', async (req, res) => {
  const { configs } = req.body;

  const updates = configs.map(async (config) => {
    return prisma.scheduleConfig.upsert({
      where: { dayOfWeek: config.dayOfWeek },
      update: {
        isOpen: config.isOpen,
        startTime: config.startTime,
        endTime: config.endTime,
        slotDuration: config.slotDuration,
      },
      create: {
        dayOfWeek: config.dayOfWeek,
        isOpen: config.isOpen,
        startTime: config.startTime,
        endTime: config.endTime,
        slotDuration: config.slotDuration,
      },
    });
  });

  const results = await Promise.all(updates);

  return res.json(results);
});

// Bloquear dia inteiro
router.post('/block-day', async (req, res) => {
  const { date, reason } = req.body;

  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  // Buscar config do dia
  const config = await prisma.scheduleConfig.findUnique({
    where: { dayOfWeek },
  });

  if (!config || !config.isOpen) {
    return res.status(400).json({ error: 'Dia já está fechado ou sem configuração' });
  }

  // Gerar todos os horários do dia
  const slots = generateTimeSlots(config.startTime, config.endTime, config.slotDuration);

  // Criar bloqueios para cada horário
  const blocks = slots.map(time => ({
    date: targetDate,
    time,
    reason: reason || 'Dia fechado',
  }));

  await prisma.blockedSchedule.createMany({ data: blocks });

  return res.json({ message: `Dia ${date} bloqueado com sucesso`, blockedSlots: slots.length });
});

// Obter dias bloqueados
router.get('/blocked-days', async (req, res) => {
  const { month, year } = req.query;

  let where = {};
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    where.date = { gte: startDate, lte: endDate };
  }

  // Agrupar bloqueios por data
  const blocked = await prisma.blockedSchedule.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  // Agrupar por data
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

// Remover bloqueios de um dia
router.delete('/blocked-day/:date', async (req, res) => {
  const { date } = req.params;

  const targetDate = new Date(date);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  await prisma.blockedSchedule.deleteMany({
    where: {
      date: {
        gte: targetDate,
        lt: nextDate,
      },
    },
  });

  return res.json({ message: `Bloqueios do dia ${date} removidos com sucesso` });
});

// Gerenciar Leads
router.get('/leads', async (req, res) => {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return res.json(leads);
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

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@normabrasi.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@normabrasi.com',
      phone: '(11) 99999-9999',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Administrador criado:', admin.email);

  // Criar planos
  const planos = [
    {
      name: 'Essencial',
      description: 'Corte de cabelo + barba com produtos premium',
      price: 89.90,
      sessions: 1,
    },
    {
      name: 'Premium',
      description: 'Corte + barba + tratamentos especiais + hidratação',
      price: 149.90,
      sessions: 2,
    },
    {
      name: 'VIP',
      description: 'Acesso ilimitado a todos os serviços + benefícios exclusivos',
      price: 249.90,
      sessions: 4,
    },
  ];

  for (const plano of planos) {
    const existingPlan = await prisma.plan.findFirst({ where: { name: plano.name } });
    
    if (existingPlan) {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: plano,
      });
    } else {
      await prisma.plan.create({
        data: plano,
      });
    }
    console.log('✅ Plano criado:', plano.name);
  }

  // Criar cliente de exemplo
  const clientPassword = await bcrypt.hash('client123', 10);
  const planoPremium = await prisma.plan.findFirst({ where: { name: 'Premium' } });
  
  const client = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'cliente@exemplo.com',
      phone: '(11) 98888-8888',
      password: clientPassword,
      role: 'CLIENT',
      planId: planoPremium?.id,
    },
  });
  console.log('✅ Cliente criado:', client.email);

  // Criar alguns horários bloqueados (exemplo)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.blockedSchedule.createMany({
    data: [
      {
        date: tomorrow,
        time: '12:00',
        reason: 'Horário de almoço',
      },
      {
        date: tomorrow,
        time: '12:30',
        reason: 'Horário de almoço',
      },
    ],
  });
  console.log('✅ Horários bloqueados criados');

  // Criar configurações de horários padrão
  const scheduleConfigs = [
    { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '18:00', slotDuration: 30 }, // Domingo - fechado
    { dayOfWeek: 1, isOpen: true, startTime: '09:00', endTime: '19:00', slotDuration: 30 },  // Segunda
    { dayOfWeek: 2, isOpen: true, startTime: '09:00', endTime: '19:00', slotDuration: 30 },  // Terça
    { dayOfWeek: 3, isOpen: true, startTime: '09:00', endTime: '19:00', slotDuration: 30 },  // Quarta
    { dayOfWeek: 4, isOpen: true, startTime: '09:00', endTime: '19:00', slotDuration: 30 },  // Quinta
    { dayOfWeek: 5, isOpen: true, startTime: '09:00', endTime: '19:00', slotDuration: 30 },  // Sexta
    { dayOfWeek: 6, isOpen: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },  // Sábado
  ];

  for (const config of scheduleConfigs) {
    await prisma.scheduleConfig.upsert({
      where: { dayOfWeek: config.dayOfWeek },
      update: config,
      create: config,
    });
  }
  console.log('✅ Configurações de horários criadas');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

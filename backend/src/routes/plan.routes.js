const { Router } = require('express');
const prisma = require('../lib/prisma');

const router = Router();

router.get('/', async (req, res) => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });

  return res.json(plans);
});

router.get('/:id', async (req, res) => {
  const plan = await prisma.plan.findUnique({
    where: { id: req.params.id },
  });

  if (!plan) {
    return res.status(404).json({ error: 'Plano não encontrado' });
  }

  return res.json(plan);
});

module.exports = router;

const { Router } = require('express');
const prisma = require('../lib/prisma');

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, phone, source } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  const lead = await prisma.lead.create({
    data: { name, email, phone, source: source || 'WEBSITE' },
  });

  return res.status(201).json(lead);
});

module.exports = router;

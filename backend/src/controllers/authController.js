const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Router } = require('express');
const prisma = require('../lib/prisma');

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    return res.status(409).json({ error: 'E-mail já cadastrado' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: passwordHash,
      role: 'CLIENT',
    },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, planId: user.planId },
    token,
  });
});

module.exports = router;

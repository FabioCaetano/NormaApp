const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = Router();

router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { plan: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

router.put('/me', authMiddleware, async (req, res) => {
  const { name, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name, phone },
    include: { plan: true },
  });

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

module.exports = router;

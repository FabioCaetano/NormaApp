const { Router } = require('express');
const authRouter = require('../controllers/authController');

const router = Router();

// Usar o router do controller diretamente
router.use(authRouter);

module.exports = router;

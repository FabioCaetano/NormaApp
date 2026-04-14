const express = require('express');
const cors = require('cors');
require('express-async-errors');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const planRoutes = require('./routes/plan.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const leadRoutes = require('./routes/lead.routes');
const { connectToWhatsApp, isConnected } = require('./services/whatsapp');

// Expor globalmente para as routes usarem
global.whatsappReady = isConnected;

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leads', leadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  return res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Conectar ao WhatsApp (se habilitado)
if (process.env.WHATSAPP_ENABLED === 'true') {
  connectToWhatsApp();
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.WHATSAPP_ENABLED === 'true') {
    console.log('📱 WhatsApp: iniciando conexão...');
  }
});

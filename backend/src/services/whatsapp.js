const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const path = require('path');
const fs = require('fs');

let sock = null;
let isReady = false;

// Diretório para salvar a sessão (persiste entre reinícios)
const AUTH_DIR = path.join(__dirname, '../../whatsapp-auth');

// Evitar loop infinito: só limpa auth uma vez por tentativa de conexão
let authCleaned = false;

async function connectToWhatsApp() {
  // Criar diretório de auth se não existir
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    authCleaned = true;
  }

  // Buscar versão mais recente do WhatsApp Web
  const { version } = await fetchLatestBaileysVersion();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: process.env.WHATSAPP_LOG_LEVEL || 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Exibir QR Code no terminal
    if (qr) {
      console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('');
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      isReady = false;

      // 405 = sessão inválida → limpar auth uma vez e reconectar
      if ((reason === DisconnectReason.badSession || reason === 405) && !authCleaned) {
        console.log('⚠️  Sessão inválida — limpando e gerando novo QR Code...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
        authCleaned = true;
      }

      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      console.log(`⚠️  WhatsApp desconectado (código: ${reason})`);
      console.log(shouldReconnect ? '🔄 Reconectando em 3s...' : '🔒 Desconectado. Escaneie o QR Code novamente.');

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      }
    }

    if (connection === 'open') {
      isReady = true;
      authCleaned = false; // reset para futuras reconexões
      console.log('✅ WhatsApp conectado com sucesso!');
    }
  });

  return sock;
}

/**
 * Enviar mensagem WhatsApp para um número
 * @param {string} phone - Número com código do país (ex: 5511999999999)
 * @param {string} message - Texto da mensagem
 */
async function sendMessage(phone, message) {
  if (!sock || !isReady) {
    console.warn('⚠️  WhatsApp não está conectado, mensagem não enviada');
    return false;
  }

  try {
    // Usar número exatamente como fornecido, sem adicionar código do país
    const jid = phone.replace(/\D/g, '') + '@s.whatsapp.net';

    await sock.sendMessage(jid, { text: message });
    console.log(`📨 Mensagem enviada para ${phone}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem para ${phone}:`, error.message);
    return false;
  }
}

/**
 * Formatar mensagem de agendamento para o cliente
 */
function formatClientMessage(booking) {
  const name = booking.clientName || booking.user?.name || 'Cliente';
  const date = new Date(booking.date).toLocaleDateString('pt-BR');
  const time = booking.time;
  const service = booking.service;

  return `✂️ *Norma Brasil Barbershop*\n\nOlá, *${name}*!\n\nSeu agendamento foi confirmado:\n\n📅 Data: ${date}\n⏰ Horário: ${time}\n✂️ Serviço: ${service}\n\nTe esperamos! 💈`;
}

/**
 * Formatar mensagem de agendamento para o barbeiro (admin)
 */
function formatBarberMessage(booking) {
  const name = booking.clientName || booking.user?.name || 'Cliente';
  const phone = booking.clientPhone || booking.user?.phone || 'N/A';
  const date = new Date(booking.date).toLocaleDateString('pt-BR');
  const time = booking.time;
  const service = booking.service;
  const type = booking.isWalkIn ? 'Avulso' : 'Cadastrado';

  return `🔔 *Novo Agendamento!*\n\n👤 Cliente: ${name}\n📱 Telefone: ${phone}\n📅 Data: ${date}\n⏰ Horário: ${time}\n✂️ Serviço: ${service}\n📋 Tipo: ${type}`;
}

/**
 * Enviar notificações de agendamento (cliente + barbeiro)
 */
async function notifyBooking(booking, barberPhone) {
  const results = { client: false, barber: false };

  // Notificar cliente
  const clientPhone = booking.clientPhone || booking.user?.phone;
  console.log('🔍 Debug notifyBooking:', {
    clientPhone,
    clientPhoneRaw: booking.clientPhone,
    userPhone: booking.user?.phone,
    barberPhone,
  });

  if (clientPhone) {
    results.client = await sendMessage(clientPhone, formatClientMessage(booking));
  } else {
    console.warn('⚠️  Telefone do cliente não encontrado no agendamento, notificação não enviada');
  }

  // Notificar barbeiro
  if (barberPhone) {
    results.barber = await sendMessage(barberPhone, formatBarberMessage(booking));
  }

  console.log('📊 Resultado:', results);
  return results;
}

/**
 * Retorna se o WhatsApp está conectado
 */
function isConnected() {
  return isReady;
}

module.exports = {
  connectToWhatsApp,
  sendMessage,
  notifyBooking,
  formatClientMessage,
  formatBarberMessage,
  isConnected,
};

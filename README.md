# 🪒 Norma Brasil - Plataforma Premium para Barbearia

![Norma Brasil](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Prisma](https://img.shields.io/badge/Database-SQLite%20%2B%20Prisma-lightgrey?style=for-the-badge&logo=prisma)

Plataforma web completa para a barbearia premium **Norma Brasil**, com sistema de agendamentos, planos mensais, área do cliente e painel administrativo.

---

## 🎨 Identidade Visual

Projeto desenvolvido com base na **logo oficial** da marca, que apresenta:
- **Dois barbeiros** (homem e mulher) estilo retrô vintage
- **Barber pole** clássico no centro
- **Selo verde premium** com 5 estrelas douradas
- **Tesouras cruzadas** como símbolo da barbearia
- **Faixa dourada** com o nome "NORMA"
- **Texto "BRASIL BARBERSHOP • HAIRSTYLES"**

### Paleta de Cores Extraída

| Cor | Código | Uso |
|-----|--------|-----|
| 🟢 Verde Premium | `#1B4332` / `#2D6A4F` | Cor principal, selo da logo |
| 🟡 Dourado Metálico | `#C9A84C` / `#D4AF37` | Faixa, estrelas, acentos |
| ⚫ Preto/Fundo Escuro | `#0A0A0A` / `#1A1A1A` | Background principal |
| ⚪ Branco | `#FFFFFF` | Texto, contraste |
| 🔴 Azul Vermelho (Barber Pole) | `#CC0000` / `#0033A0` | Elementos decorativos |

---

## 🚀 Funcionalidades

### 👤 Cliente
- ✅ Visualizar planos mensais
- ✅ Criar conta e realizar login
- ✅ Visualizar seu plano atual
- ✅ Agendar horários
- ✅ Ver histórico de agendamentos
- ✅ Cancelar agendamentos

### 🚶 Cliente Avulso
- ✅ Agendar sem necessidade de login
- ✅ Informar nome, email e telefone
- ✅ Registro automático como lead

### 👨‍💼 Administrador
- ✅ Dashboard com métricas
- ✅ Gerenciar agenda completa
- ✅ Criar/editar planos
- ✅ Gerenciar clientes
- ✅ Bloquear horários
- ✅ Visualizar leads capturados
- ✅ Atualizar status de agendamentos

---

## 🧱 Stack Tecnológica

### Frontend
- **React 18** com **Vite**
- **Tailwind CSS** para estilização
- **React Router DOM** para rotas
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações
- **React Icons** para ícones

### Backend
- **Node.js** com **Express**
- **Prisma ORM**
- **SQLite** (banco embarcado)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

---

## 📁 Estrutura do Projeto

```
NormaApp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.js            # Seed com dados iniciais
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── plan.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── lead.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── lib/
│   │   │   └── prisma.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logo-icon.svg      # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── admin/
│   │   │       └── Admin.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🗄️ Banco de Dados

### Models

#### User
- id, name, email, phone, password
- role (ADMIN/CLIENT)
- planId (relação com Plan)

#### Plan
- id, name, description, price
- sessions (por mês)
- isActive

#### Booking
- id, userId (opcional), clientName (avulso)
- date, time, service
- status (SCHEDULED/COMPLETED/CANCELLED)
- isWalkIn

#### BlockedSchedule
- id, date, time, reason

#### Lead
- id, name, email, phone, source

---

## 🚀 Instruções de Execução

### Pré-requisitos
- **Node.js** v18+ instalado
- **npm** ou **yarn**

### 1. Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar banco de dados (Prisma)
npx prisma generate
npx prisma migrate dev --name init

# Executar seed (dados iniciais)
npm run prisma:seed

# Iniciar servidor
npm run dev
```

O backend rodará em: `http://localhost:3333`

### 2. Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend rodará em: `http://localhost:5173`

---

## 🔐 Credenciais de Teste

### Administrador
- **Email:** `admin@normabrasi.com`
- **Senha:** `admin123`

### Cliente
- **Email:** `cliente@exemplo.com`
- **Senha:** `client123`

---

## 📱 Rotas da Aplicação

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Home premium com planos | Público |
| `/login` | Página de login | Público |
| `/register` | Página de registro | Público |
| `/booking` | Agendamento de horário | Público/Logado |
| `/dashboard` | Painel do cliente | Logado |
| `/admin` | Painel administrativo | Admin only |

---

## 🎯 Regras de Agendamento

✅ Não permite conflitos de horário  
✅ Não permite agendar em horários bloqueados  
✅ Separação clara entre cliente logado e avulso  
✅ Garantia de consistência na agenda  
✅ Horários disponíveis: 09:00-11:30, 14:00-18:30  
✅ Domingos não disponíveis para agendamento  

---

## ✨ Diferenciais de UX/UI

- 🎨 Interface moderna estilo barbearia premium
- 🎭 Animações suaves (hover, transições)
- ✨ Botões elegantes com gradiente dourado
- 🃏 Cards com sombra leve e bordas suaves
- 🌟 Design que transmite exclusividade
- 📱 Totalmente responsivo
- 🔄 Loading states em todas as ações
- ✔️ Validação de formulário com feedback visual
- 🎯 Tema reutilizável com variáveis centralizadas

---

## 🔮 Preparado para Escalar

- ✅ Estrutura modular e componentizada
- ✅ API RESTful documentada
- ✅ Pronto para integração com gateway de pagamento
- ✅ Autenticação JWT preparada para refresh token
- ✅ Banco de dados pode migrar para PostgreSQL/MySQL
- ✅ Tailwind configurado para customização fácil

---

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev          # Iniciar em modo desenvolvimento
npm start            # Iniciar em produção
npm run prisma:generate   # Gerar client Prisma
npm run prisma:migrate    # Executar migrações
npm run prisma:seed       # Popular banco de dados
npm run prisma:studio     # Abrir Prisma Studio (GUI)
```

### Frontend
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

---

## 🛠️ Próximos Passos (Future Enhancements)

- [ ] Integração com gateway de pagamento (Stripe/MercadoPago)
- [ ] Notificações por email/SMS
- [ ] Upload de fotos para portfólio
- [ ] Sistema de avaliações
- [ ] Chat entre cliente e barbeiro
- [ ] Relatórios avançados no admin
- [ ] Multi-unidades
- [ ] App mobile (React Native)

---

## 📄 Licença

Projeto desenvolvido para fins educacionais e comerciais da marca **Norma Brasil**.

---

## 👨‍💻 Desenvolvido com ❤️

Arquitetura profissional focada em:
- Qualidade visual premium
- Código limpo e modular
- Escalabilidade
- Experiência do usuário excepcional

---

**Norma Brasil** - *Tradição, elegância e cuidado masculino*
# NormaApp

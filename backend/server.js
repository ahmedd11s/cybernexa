const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// حماية HTTP Headers ومنع NoSQL Injection
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// منع هجمات Brute Force (5 محاولات كل 15 دقيقة)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { status: 'error', message: 'لقد تجاوزت الحد المسموح من المحاولات، يرجى المحاولة بعد 15 دقيقة' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// المسارات
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/intel', require('./routes/intelRoutes'));

app.get('/', (req, res) => res.json({ message: 'CYBERNEXA API is running with High Security 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Secure Server running on port ${PORT}`));
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

// 1. حماية HTTP Headers
app.use(helmet());

// 2. منع NoSQL Injection
app.use(mongoSanitize());

app.use(express.json({ limit: '10kb' })); // تحديد حجم البيانات لمنع DDoS
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// 3. Rate Limiting (منع Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط لكل IP
  message: { status: 'error', message: 'لقد تجاوزت الحد المسموح من المحاولات، يرجى المحاولة بعد 15 دقيقة' }
});

// تطبيق الحماية على مسارات الدخول والتسجيل فقط
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// باقي المسارات
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/intel', require('./routes/intelRoutes'));

app.get('/', (req, res) => res.json({ message: 'CYBERNEXA API is running with High Security 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Secure Server running on port ${PORT}`));
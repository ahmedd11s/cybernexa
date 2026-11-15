const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit'); // npm install express-rate-limit
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Suga شغال ورا proxy: من غيرها كل الزوار بيبانوا بنفس الـ IP، والكوكي Secure ممكن ما يتبعتش
app.set('trust proxy', 1);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// CORS: دومينات الموقع المسموحة (CLIENT_URL، ممكن أكتر من واحد مفصولين بفاصلة، بدون / في الآخر)
// الـ '*' مع credentials: true مش بيشتغل في المتصفح، فمابنستخدمهوش
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);

if (isProd && allowedOrigins.length === 0) {
  console.warn('⚠️  CLIENT_URL مش متحدد: الواجهة مش هتقدر تدخل. حط دومين موقعك في متغيرات البيئة.');
}

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);                       // طلبات بدون Origin (curl, نفس الدومين)
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (!isProd && allowedOrigins.length === 0) return cb(null, true); // تطوير محلي فقط
    return cb(null, false);
  },
  credentials: true
}));

// حد لمحاولات الدخول والتسجيل (تخمين كلمات المرور)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'محاولات كثيرة، حاول مرة تانية بعد 15 دقيقة' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// المسارات الأساسية
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/intel', require('./routes/intelRoutes'));

app.get('/', (req, res) => res.json({ message: 'CYBERNEXA API is running 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

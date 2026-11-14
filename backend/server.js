const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ضفنا دي عشان الكوكيز
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // تفعيل قراءة الكوكيز
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5500',
  credentials: true
}));

// استدعاء مسارات الـ Auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // تفعيل المسارات

// رسالة تجريبية
app.get('/', (req, res) => {
  res.send('CYBERNEXA API is running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
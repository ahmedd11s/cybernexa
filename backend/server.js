const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const connectDB = require('./config/db');

// تحميل المتغيرات والاتصال بقاعدة البيانات
dotenv.config();
connectDB();

const app = express();

// ==========================================
// Middleware
// ==========================================
app.use(express.json());
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5500',
  credentials: true
}));

// ==========================================
// المسارات (Routes)
// ==========================================
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');

app.use('/api/auth', authRoutes);   // مسارات الحسابات
app.use('/api/scans', scanRoutes);  // مسارات
 
const intelRoutes = require('./routes/intelRoutes');
app.use('/api/intel', intelRoutes);
أدوات الفحص

// رسالة ترحيبية للتأكد من عمل السيرفر
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'CYBERNEXA API is running 🚀',
    version: '1.0.0'
  });
});

// ==========================================
// تشغيل السيرفر
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
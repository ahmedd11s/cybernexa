const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// المسارات الأساسية (اللي اتأكدنا إن ملفاتها موجودة)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));

// مسار ترحيبي للتأكد من عمل السيرفر
app.get('/', (req, res) => res.json({ message: 'CYBERNEXA API is running 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
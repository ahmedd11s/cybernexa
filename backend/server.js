const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config(); // عشان يقرأ ملف .env
connectDB(); // عشان يتصل بقاعدة البيانات

const app = express();
app.use(express.json());
app.use(cors());

// رسالة تجريبية عشان نتأكد إن السيرفر شغال
app.get('/', (req, res) => {
  res.send('CYBERNEXA API is running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

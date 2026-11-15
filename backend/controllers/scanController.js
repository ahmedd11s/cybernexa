const Scan = require('../models/Scan');

const MAX_URL = 2048;
const MAX_FILE_NAME = 255;
const MAX_PASSWORD = 128;

// المدخلات لازم تكون نصوص (object مبعوت من برّه كان هيكسر .includes ويرجّع 500)
const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

// 1. فحص الروابط (فحص مبدئي بالكلمات، مش قاعدة بيانات تهديدات)
exports.scanUrl = async (req, res) => {
  try {
    const url = req.body.url;
    if (!isText(url, MAX_URL)) return res.status(400).json({ message: 'الرجاء إدخال رابط صحيح' });

    const lower = url.trim().toLowerCase();
    let riskScore = 10;
    let result = 'لا توجد مؤشرات مشبوهة (فحص مبدئي)';

    if (lower.includes('login') || lower.includes('free') || lower.includes('bank')) {
      riskScore = 85;
      result = 'مشبوه جداً (احتمالية فيشينج عالية)';
    } else if (lower.length < 10) {
      riskScore = 55; // كان 40 فالواجهة (حد 50) كانت بتعرضه أخضر رغم إنه "مشبوه"
      result = 'مشبوه (رابط قصير جداً)';
    }

    const newScan = await Scan.create({
      user: req.user._id, type: 'url', target: url.trim(), result, riskScore
    });

    res.status(200).json({ status: 'success', data: newScan });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء الفحص' });
  }
};

// 2. فحص قوة كلمة المرور (كلمة المرور نفسها ما بتتخزنش)
exports.scanPassword = async (req, res) => {
  try {
    const password = req.body.password;
    if (!isText(password, MAX_PASSWORD)) return res.status(400).json({ message: 'الرجاء إدخال كلمة مرور صحيحة' });

    let score = 0;
    if (password.length >= 8) score += 30; // كان > 8 فكلمة من 8 أحرف بالظبط كانت تاخد صفر
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 30;

    let result = 'ضعيفة جداً';
    if (score >= 80) result = 'قوية جداً';
    else if (score >= 50) result = 'متوسطة';

    const newScan = await Scan.create({
      user: req.user._id, type: 'password', target: '********', result, riskScore: 100 - score
    });

    res.status(200).json({ status: 'success', data: newScan });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء الفحص' });
  }
};

// 3. فحص الملفات (بالاسم والامتداد فقط، مش فحص محتوى)
exports.scanFile = async (req, res) => {
  try {
    const { fileName } = req.body;
    const fileSize = Number(req.body.fileSize) || 0;
    if (!isText(fileName, MAX_FILE_NAME)) return res.status(400).json({ message: 'الرجاء إرسال اسم ملف صحيح' });

    let riskScore = 5;
    let result = 'لا توجد مؤشرات مشبوهة (فحص مبدئي بالاسم فقط)';

    const dangerousExts = ['.exe', '.bat', '.cmd', '.com', '.scr', '.msi', '.vbs', '.ps1', '.jar', '.js'];
    const name = fileName.trim().toLowerCase();
    if (dangerousExts.some(ext => name.endsWith(ext))) {
      riskScore = 90;
      result = 'ملف خطير (تنفيذي)';
    } else if (fileSize > 50) {
      riskScore = 55; // كان 40 فالواجهة كانت بتعرضه أخضر
      result = 'حجم كبير (مشبوه)';
    }

    const newScan = await Scan.create({
      user: req.user._id, type: 'file', target: fileName.trim(), result, riskScore
    });

    res.status(200).json({ status: 'success', data: newScan });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء الفحص' });
  }
};

// 4. جلب سجل الفحوصات
exports.getHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id }).sort('-createdAt').limit(100);
    res.status(200).json({ status: 'success', data: scans });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في جلب السجل' });
  }
};

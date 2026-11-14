const Scan = require('../models/Scan');

// 1. فحص الروابط (محاكاة ذكاء اصطناعي للفحص)
exports.scanUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'الرجاء إدخال رابط' });

    // محاكاة للفحص (في الحقيقة هنا بنربط API حقيقي)
    let riskScore = 10;
    let result = 'آمن';
    
    if (url.includes('login') || url.includes('free') || url.includes('bank')) {
      riskScore = 85;
      result = 'مشبوه جداً (احتمالية فيشينج عالية)';
    } else if (url.length < 10) {
      riskScore = 40;
      result = 'مشبوه (رابط قصير جداً)';
    }

    // حفظ الفحص في قاعدة البيانات
    const newScan = await Scan.create({
      user: req.user._id,
      type: 'url',
      target: url,
      result: result,
      riskScore: riskScore
    });

    res.status(200).json({ status: 'success', data: newScan });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء الفحص' });
  }
};

// 2. فحص قوة كلمة المرور
exports.scanPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'الرجاء إدخال كلمة المرور' });

    let score = 0;
    if (password.length > 8) score += 30;
    if (password.match(/[A-Z]/)) score += 20;
    if (password.match(/[0-9]/)) score += 20;
    if (password.match(/[^a-zA-Z0-9]/)) score += 30;

    let result = 'ضعيفة جداً';
    if (score >= 80) result = 'قوية جداً';
    else if (score >= 50) result = 'متوسطة';

    const newScan = await Scan.create({
      user: req.user._id,
      type: 'password',
      target: '********', // مبنحفظش الباسورد الحقيقي أمنياً
      result: result,
      riskScore: 100 - score
    });

    res.status(200).json({ status: 'success', data: newScan });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء الفحص' });
  }
};

// 3. جلب سجل الفحوصات الخاص بالمستخدم
exports.getHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ status: 'success', data: scans });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في جلب السجل' });
  }
};
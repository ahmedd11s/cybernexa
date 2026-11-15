const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const crypto = require('crypto');

const sendTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

    const { user, token } = await authService.registerUser(req.body);
    sendTokenCookie(res, token);
    res.status(201).json({ status: 'success', message: 'تم إنشاء الحساب بنجاح', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

    const identifier = req.body.email || req.body.phone;
    const { user, token } = await authService.loginUser(identifier, req.body.password);
    
    // تسجيل حدث الدخول الناجح
    await AuditLog.create({ user: user._id, action: 'login_success', ipAddress: req.ip, userAgent: req.get('User-Agent') });

    sendTokenCookie(res, token);
    res.status(200).json({ status: 'success', message: 'تم تسجيل الدخول', data: { user } });
  } catch (err) {
    // تسجيل محاولة الدخول الفاشلة (لمراقبة الاختراقات)
    await AuditLog.create({ action: 'login_failed', ipAddress: req.ip, userAgent: req.get('User-Agent'), details: req.body.email || req.body.phone });
    res.status(401).json({ status: 'error', message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ status: 'success', message: 'تم تسجيل الخروج' });
};

// إنشاء كود OTP (لتفعيل الحساب)
exports.sendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    // هنا بنرجع الكود في الرد عشان تجربه (في الإنتاج بيتبعت إيميل)
    res.status(200).json({ status: 'success', message: 'تم إنشاء الكود', otp }); 
  } catch (e) { res.status(500).json({ message: 'حدث خطأ' }); }
};

// التحقق من كود OTP
exports.verifyOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.otpCode !== req.body.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'الكود غير صحيح أو انتهت صلاحيته' });
    }
    user.isVerified = true;
    user.otpCode = undefined;
    await user.save();
    res.status(200).json({ status: 'success', message: 'تم تفعيل الحساب بنجاح' });
  } catch (e) { res.status(500).json({ message: 'حدث خطأ' }); }
};
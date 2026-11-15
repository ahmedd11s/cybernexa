const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const AuditLog = require('../models/AuditLog'); // ضفنا ده

const sendTokenCookie = (res, token) => {
  res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
};

exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

    const identifier = req.body.email || req.body.phone;
    const { user, token } = await authService.loginUser(identifier, req.body.password);
    
    // تسجيل عملية ناجحة
    await AuditLog.create({ user: user._id, action: 'login_success', ipAddress: req.ip, userAgent: req.get('User-Agent') });

    sendTokenCookie(res, token);
    res.status(200).json({ status: 'success', message: 'تم تسجيل الدخول', data: { user } });
  } catch (err) {
    // تسجيل محاولة فاشلة (لمراقبة الاختراقات)
    await AuditLog.create({ action: 'login_failed', ipAddress: req.ip, userAgent: req.get('User-Agent'), details: req.body.email || req.body.phone });
    res.status(401).json({ status: 'error', message: err.message });
  }
};
// ... (باقي الدوال زي register زي ما هي)
const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const AuditLog = require('../models/AuditLog');

// الموقع على دومين والسيرفر على دومين تاني (Suga) = طلبات cross-site.
// 'strict' كان بيخلي المتصفح يتجاهل الكوكي. في الإنتاج لازم SameSite=None مع Secure.
// ملحوظة: لازم تحط NODE_ENV=production في متغيرات البيئة على Suga.
const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/'
};

const sendTokenCookie = (res, token) => {
  res.cookie('jwt', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

// تسجيل الأحداث ما يكسرش الطلب لو فشل
const audit = (data) => AuditLog.create(data).catch(() => {});

exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

    const { user, token } = await authService.registerUser(req.body);
    sendTokenCookie(res, token);
    res.status(201).json({ status: 'success', message: 'تم إنشاء الحساب بنجاح', data: { user } });
  } catch (err) {
    const message = err && err.code === 11000 ? 'هذا الحساب مسجل بالفعل' : err.message;
    res.status(400).json({ status: 'error', message });
  }
};

exports.login = async (req, res) => {
  const identifier = String(req.body.email || req.body.phone || '').slice(0, 100);
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

    const { user, token } = await authService.loginUser(req.body.email || req.body.phone, req.body.password);

    await audit({ user: user._id, action: 'login_success', ipAddress: req.ip, userAgent: req.get('User-Agent') });

    sendTokenCookie(res, token);
    res.status(200).json({ status: 'success', message: 'تم تسجيل الدخول', data: { user } });
  } catch (err) {
    await audit({ action: 'login_failed', ipAddress: req.ip, userAgent: req.get('User-Agent'), details: identifier });
    // رسالة واحدة لكل الحالات: ما نقولش هل الحساب موجود ولا كلمة المرور غلط
    res.status(401).json({ status: 'error', message: 'بيانات الدخول غير صحيحة' });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

exports.logout = (req, res) => {
  // لازم نفس خصائص الكوكي (secure/sameSite) وإلا المتصفح ممكن يتجاهل المسح
  res.clearCookie('jwt', cookieOptions);
  res.status(200).json({ status: 'success', message: 'تم تسجيل الخروج' });
};

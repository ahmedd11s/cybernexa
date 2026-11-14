const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');

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
    
    sendTokenCookie(res, token);
    res.status(200).json({ status: 'success', message: 'تم تسجيل الدخول', data: { user } });
  } catch (err) {
    res.status(401).json({ status: 'error', message: err.message });
  }
};

// مسار تسجيل الدخول بجوجل
exports.googleLogin = async (req, res) => {
  try {
    // البيانات دي بتيجي من الفرونت بعد ما يتحقق من جوجل
    const { user, token } = await authService.loginWithGoogle(req.body);
    sendTokenCookie(res, token);
    res.status(200).json({ status: 'success', message: 'تم الدخول بجوجل بنجاح', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

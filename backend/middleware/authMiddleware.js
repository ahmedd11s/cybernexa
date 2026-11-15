const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: 'غير مصرح لك بالدخول' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // select('-password'): ما نحمّلش هاش كلمة المرور مع المستخدم (وإلا ممكن يتبعت للواجهة في /auth/me)
    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) return res.status(401).json({ message: 'المستخدم غير موجود' });

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'التوكن غير صالح أو انتهت صلاحيته' });
  }
};

// حماية بالدور: استخدمها بعد protect، مثال: router.get('/all', restrictTo('admin'), handler)
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'غير مصرح لك بتنفيذ هذا الإجراء' });
  }
  next();
};

module.exports = { protect, restrictTo };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    // بنجيب التوكن من الكوكيز
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول' });
    }

    // فك تشفير التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // جلب المستخدم من الداتابيز
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'error', message: 'المستخدم غير موجود' });
    }

    // نخلي بيانات المستخدم متاحة في req
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'التوكن غير صالح أو انتهت صلاحيته' });
  }
};

module.exports = { protect };

const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const registerUser = async (userData) => {
  const { name, email, phone, password } = userData;

  if (email) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error('البريد الإلكتروني مسجل بالفعل');
  }
  if (phone) {
    const existing = await User.findOne({ phone });
    if (existing) throw new Error('رقم الهاتف مسجل بالفعل');
  }

  const user = await User.create({ name, email, phone, passwordHash: password });
  user.passwordHash = undefined;
  const token = generateToken(user._id);
  return { user, token };
};

const loginUser = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  user.passwordHash = undefined;
  const token = generateToken(user._id);
  return { user, token };
};

const loginWithGoogle = async (googleData) => {
  const { googleId, email, name } = googleData;

  let user = await User.findOne({ googleId });
  if (user) {
    const token = generateToken(user._id);
    return { user, token };
  }

  user = await User.findOne({ email });
  if (user) {
    user.googleId = googleId;
    await user.save();
    const token = generateToken(user._id);
    return { user, token };
  }

  user = await User.create({ name, email, googleId });
  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { registerUser, loginUser, loginWithGoogle };
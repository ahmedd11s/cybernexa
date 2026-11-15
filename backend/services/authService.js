const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const registerUser = async (userData) => {
  const { name, email, phone, password } = userData;
  if (email && await User.findOne({ email })) throw new Error('البريد الإلكتروني مسجل بالفعل');
  if (phone && await User.findOne({ phone })) throw new Error('رقم الهاتف مسجل بالفعل');
  
  const user = await User.create({ name, email, phone, passwordHash: password });
  user.passwordHash = undefined;
  return { user, token: generateToken(user._id) };
};

const loginUser = async (identifier, password) => {
  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
  if (!user || !(await user.comparePassword(password))) throw new Error('بيانات الدخول غير صحيحة');
  
  user.passwordHash = undefined;
  return { user, token: generateToken(user._id) };
};

const loginWithGoogle = async (googleData) => {
  const { googleId, email, name } = googleData;
  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({ email });
    if (user) { user.googleId = googleId; await user.save(); }
    else { user = await User.create({ name, email, googleId }); }
  }
  return { user, token: generateToken(user._id) };
};

module.exports = { registerUser, loginUser, loginWithGoogle };
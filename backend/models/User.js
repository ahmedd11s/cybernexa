const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // عشان يسمح يكون فاضي لو سجل برقم الموبايل
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true // عشان يسمح يكون فاضي لو سجل بالإيميل
  },
  passwordHash: {
    type: String,
    required: function() { return !this.googleId; } // الباسورد إجباري إلا لو مسجل بجوجل
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// تشفير الباسورد
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// مقارنة الباسورد
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

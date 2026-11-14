const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['url', 'password'],
    required: true
  },
  target: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  riskScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
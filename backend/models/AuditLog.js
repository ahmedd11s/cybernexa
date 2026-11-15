const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  details: String
}, { timestamps: true });
module.exports = mongoose.model('AuditLog', auditLogSchema);
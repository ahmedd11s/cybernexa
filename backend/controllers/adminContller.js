const User = require('../models/User');
const Scan = require('../models/Scan');
const AuditLog = require('../models/AuditLog');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScans = await Scan.countDocuments();
    const threatsDetected = await Scan.countDocuments({ riskScore: { $gte: 50 } });
    res.status(200).json({ status: 'success', data: { totalUsers, totalScans, threatsDetected } });
  } catch (error) { res.status(500).json({ message: 'حدث خطأ' }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort('-createdAt');
    res.status(200).json({ status: 'success', data: users });
  } catch (error) { res.status(500).json({ message: 'حدث خطأ' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', message: 'تم حذف المستخدم' });
  } catch (error) { res.status(500).json({ message: 'حدث خطأ' }); }
};

exports.getSuspiciousLogins = async (req, res) => {
  try {
    const failedLogins = await AuditLog.find({ action: 'login_failed' }).sort('-createdAt').limit(50);
    res.status(200).json({ status: 'success', data: failedLogins });
  } catch (error) { res.status(500).json({ message: 'حدث خطأ' }); }
};
const User = require('../models/User');
const Scan = require('../models/Scan');

// 1. جلب إحصائيات المنصة (عدد المستخدمين والفحوصات)
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalScans = await Scan.countDocuments();
        
        // حساب عدد التهديدات المكتشفة (الفحوصات اللي الـ riskScore بتاعها عالي)
        const threatsDetected = await Scan.countDocuments({ riskScore: { $gte: 50 } });

        res.status(200).json({
            status: 'success',
            data: { totalUsers, totalScans, threatsDetected }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'حدث خطأ في جلب الإحصائيات' });
    }
};

// 2. جلب كل المستخدمين المسجلين في المنصة
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort('-createdAt');
        res.status(200).json({ status: 'success', data: users });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'حدث خطأ في جلب المستخدمين' });
    }
};

// 3. حذف مستخدم
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: 'success', message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'حدث خطأ أثناء الحذف' });
    }
};
const express = require('express');
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// كل المسارات دي محمية، ولازم المستخدم يكون أدمن
router.use(protect);

// Middleware بسيط للتأكد إن المستخدم أدمن
router.use((req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'غير مصرح لك بالدخول لهذا القسم' });
    }
    next();
});

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
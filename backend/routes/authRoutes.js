const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // هنحتاجه

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);

// مسارات محمية (تحتاج تسجيل دخول)
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

// مسارات OTP
router.post('/send-otp', protect, authController.sendOTP);
router.post('/verify-otp', protect, authController.verifyOTP);

module.exports = router;
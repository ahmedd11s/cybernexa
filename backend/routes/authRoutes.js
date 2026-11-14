const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// مسارات التسجيل والدخول العادية
router.post('/register', authController.register);
router.post('/login', authController.login);

// مسار تسجيل الدخول بجوجل
router.post('/google', authController.googleLogin);

module.exports = router;

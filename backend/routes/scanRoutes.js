const express = require('express');
const scanController = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// كل المسارات دي محمية (لازم المستخدم يكون مسجل دخول)
router.use(protect);

router.post('/url', scanController.scanUrl);
router.post('/password', scanController.scanPassword);
router.post('/file', scanController.scanFile);
router.get('/history', scanController.getHistory);

module.exports = router;
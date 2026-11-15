const express = require('express');
const intelController = require('../controllers/intelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // لازم المستخدم يكون مسجل دخول
router.get('/', intelController.getIntelFeed);

module.exports = router;
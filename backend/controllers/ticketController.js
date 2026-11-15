const express = require('express');
const ticketController = require('../controllers/ticketController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // كل المسارات دي محتاجة تسجيل دخول

// للمستخدم العادي
router.post('/', ticketController.createTicket);
router.get('/my-tickets', ticketController.getMyTickets);

// للمدير فقط (كانت محمية بـ protect بس، فأي مستخدم كان يقدر يشوف كل التذاكر ويرد عليها)
router.get('/all', restrictTo('admin'), ticketController.getAllTickets);
router.put('/:id/reply', restrictTo('admin'), ticketController.replyTicket);

module.exports = router;

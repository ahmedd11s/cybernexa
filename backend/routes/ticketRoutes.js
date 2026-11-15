const express = require('express');
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.post('/', ticketController.createTicket);
router.get('/my-tickets', ticketController.getMyTickets);

// مسارات المدير
router.get('/all', ticketController.getAllTickets);
router.put('/:id/reply', ticketController.replyTicket);

module.exports = router;
const Ticket = require('../models/Ticket');

// إنشاء تذكرة جديدة
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'الرجاء إدخال الموضوع والرسالة' });

    const ticket = await Ticket.create({ user: req.user._id, subject, message });
    res.status(201).json({ status: 'success', data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء التذكرة' });
  }
};

// جلب تذاكر المستخدم الحالي
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ status: 'success', data: tickets });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ' });
  }
};

// (للمدير) جلب كل التذاكر
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user', 'name email').sort('-createdAt');
    res.status(200).json({ status: 'success', data: tickets });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ' });
  }
};

// (للمدير) الرد على تذكرة وإغلاقها
exports.replyTicket = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { adminReply, status: 'closed' }, { new: true });
    res.status(200).json({ status: 'success', data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ' });
  }
};
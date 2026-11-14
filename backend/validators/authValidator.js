const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'الاسم مطلوب',
    'string.min': 'الاسم يجب أن يكون حرفين على الأقل'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'يرجى إدخال بريد إلكتروني صحيح'
  }),
  phone: Joi.string().min(10).max(15).optional().messages({
    'string.min': 'رقم الهاتف قصير جداً'
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  }),
  googleId: Joi.string().optional()
}).or('email', 'phone', 'googleId'); // لازم واحدة منهم على الأقل

const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required().messages({
    'string.empty': 'كلمة المرور مطلوبة'
  })
}).or('email', 'phone');

module.exports = { registerSchema, loginSchema };

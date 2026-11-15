const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).optional(),
  password: Joi.string().min(8).optional(),
  googleId: Joi.string().optional()
}).or('email', 'phone', 'googleId');

const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required()
}).or('email', 'phone');

module.exports = { registerSchema, loginSchema };
const Joi = require('joi');

exports.login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.createUser = Joi.object({
  firstName: Joi.string().trim().min(2).required(),
  lastName: Joi.string().trim().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'gestionnaire', 'user').default('user'),
  store: Joi.string().hex().length(24).allow(null, ''),
});

exports.store = Joi.object({
  name: Joi.string().trim().min(2).required(),
  city: Joi.string().trim().min(2).required(),
  address: Joi.string().trim().allow(''),
  phone: Joi.string().trim().allow(''),
});

exports.assignManager = Joi.object({ managerId: Joi.string().hex().length(24).required() });

exports.equipment = Joi.object({
  name: Joi.string().trim().min(2).required(),
  description: Joi.string().trim().allow(''),
  category: Joi.string().trim().allow(''),
  store: Joi.string().hex().length(24),
  status: Joi.string().valid('disponible', 'maintenance'),
});

exports.reservation = Joi.object({
  equipment: Joi.string().hex().length(24).required(),
  startAt: Joi.date().iso().required(),
  durationHours: Joi.number().integer().min(1).max(720).required(),
});

exports.returnBody = Joi.object({
  delayMinutes: Joi.number().integer().min(0).max(100000).default(0),
  damageNotes: Joi.string().trim().max(1000).allow('').default(''),
});

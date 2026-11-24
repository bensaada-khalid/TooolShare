const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config');
const HttpError = require('../utils/httpError');

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(req.body.password))) {
    throw new HttpError(401, 'Email ou mot de passe incorrect');
  }
  const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
  res.json({ token, user });
};

exports.me = (req, res) => res.json(req.user);

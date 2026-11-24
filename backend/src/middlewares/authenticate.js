const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config');
const HttpError = require('../utils/httpError');

module.exports = async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Authentification requise');
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new HttpError(401, 'Session expirée ou invalide');
  }
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw new HttpError(401, 'Compte introuvable ou désactivé');
  req.user = user;
  next();
};

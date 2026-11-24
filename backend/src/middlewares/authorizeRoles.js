const HttpError = require('../utils/httpError');

module.exports = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) throw new HttpError(403, 'Accès refusé');
  next();
};

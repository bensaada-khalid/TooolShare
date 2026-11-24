module.exports = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Identifiant invalide';
  }
  if (err.code === 11000) {
    status = 409;
    message = 'Valeur déjà utilisée (doublon)';
  }
  if (status === 500) {
    console.error(err);
    message = 'Erreur interne du serveur';
  }
  res.status(status).json({ message });
};

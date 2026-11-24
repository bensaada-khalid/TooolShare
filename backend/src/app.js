const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { corsOrigin } = require('./config');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(helmet());
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/stores', require('./routes/store.routes'));
app.use('/api/equipment', require('./routes/equipment.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/reservations', require('./routes/reservation.routes'));
app.use('/api/stats', require('./routes/stats.routes'));

app.use((_req, res) => res.status(404).json({ message: 'Route introuvable' }));
app.use(errorHandler);

module.exports = app;

const router = require('express').Router();
const c = require('../controllers/stats.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

router.get('/', authenticate, authorizeRoles('admin', 'gestionnaire'), c.get);

module.exports = router;

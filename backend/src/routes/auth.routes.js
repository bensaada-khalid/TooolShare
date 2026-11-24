const router = require('express').Router();
const c = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');

router.post('/login', validate(schemas.login), c.login);
router.get('/me', authenticate, c.me);

module.exports = router;

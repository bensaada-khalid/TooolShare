const router = require('express').Router();
const c = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');

router.use(authenticate, authorizeRoles('admin'));
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', validate(schemas.createUser), c.create);

module.exports = router;

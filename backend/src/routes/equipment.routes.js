const router = require('express').Router();
const c = require('../controllers/equipment.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');

router.use(authenticate);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', authorizeRoles('admin', 'gestionnaire'), validate(schemas.equipment), c.create);
router.put('/:id', authorizeRoles('admin', 'gestionnaire'), validate(schemas.equipment), c.update);

module.exports = router;

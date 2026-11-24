const router = require('express').Router();
const c = require('../controllers/reservation.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');

router.use(authenticate);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', authorizeRoles('user'), validate(schemas.reservation), c.create);
router.patch('/:id/cancel', c.cancel);
router.patch('/:id/handover', authorizeRoles('admin', 'gestionnaire'), c.handover);
router.patch('/:id/return', authorizeRoles('admin', 'gestionnaire'), validate(schemas.returnBody), c.giveBack);

module.exports = router;

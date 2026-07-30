const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./users.controller');
const {
  createSchema,
  updateSchema,
  changePasswordSchema,
  idParamsSchema,
} = require('./users.validation');

const router = Router();

router.get('/', controller.list);
router.get('/:id', validate(idParamsSchema, 'params'), controller.getById);
router.post('/', validate(createSchema), controller.create);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateSchema), controller.update);
router.patch(
  '/:id/password',
  validate(idParamsSchema, 'params'),
  validate(changePasswordSchema),
  controller.changePassword
);
router.delete('/:id', validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;

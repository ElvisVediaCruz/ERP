const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./categories.controller');
const { createSchema, updateSchema, idParamsSchema } = require('./categories.validation');

const router = Router();

router.get('/', controller.list);
router.get('/:id', validate(idParamsSchema, 'params'), controller.getById);
router.post('/', validate(createSchema), controller.create);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateSchema), controller.update);
router.delete('/:id', validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;

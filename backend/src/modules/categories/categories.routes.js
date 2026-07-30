const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./categories.controller');
const { createSchema, updateSchema, idParamsSchema, statusSchema, listQuerySchema } = require('./categories.validation');

const router = Router();

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.get('/:id', validate(idParamsSchema, 'params'), controller.getById);
router.post('/', validate(createSchema), controller.create);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateSchema), controller.update);
router.patch('/:id/status', validate(idParamsSchema, 'params'), validate(statusSchema), controller.updateStatus);
router.delete('/:id', validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;

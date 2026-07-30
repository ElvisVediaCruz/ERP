const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./purchases.controller');
const { createSchema, listQuerySchema, idParamsSchema } = require('./purchases.validation');

const router = Router();

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.get('/:id', validate(idParamsSchema, 'params'), controller.getById);
router.post('/', validate(createSchema), controller.create);

module.exports = router;

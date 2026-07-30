const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./products.controller');
const {
  createSchema,
  updateSchema,
  listQuerySchema,
  idParamsSchema,
  reassignCategorySchema,
} = require('./products.validation');

const router = Router();

router.get('/', validate(listQuerySchema, 'query'), controller.list);
// Debe ir antes de "/:id" para que Express no interprete "low-stock" como un id.
router.get('/low-stock', controller.lowStock);
router.patch('/reassign-category', validate(reassignCategorySchema), controller.reassignCategory);
router.get('/:id', validate(idParamsSchema, 'params'), controller.getById);
router.post('/', validate(createSchema), controller.create);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateSchema), controller.update);
router.delete('/:id', validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;

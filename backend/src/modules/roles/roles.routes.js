const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./roles.controller');
const {
  createSchema,
} = require('./roles.validation');

const router = Router();

router.post('/', validate(createSchema), controller.create);

module.exports = router;
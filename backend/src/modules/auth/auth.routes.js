const { Router } = require('express');
const validate = require('../../shared/middlewares/validate');
const controller = require('./auth.controller');
const { loginSchema } = require('./auth.validation');

const router = Router();

router.post('/login', validate(loginSchema), controller.login);

module.exports = router;

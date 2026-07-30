const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../errors/ApiError');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Token no proporcionado'));
  }

  try {
    req.user = jwt.verify(header.slice(7), env.jwt.secret);
    next();
  } catch {
    next(ApiError.unauthorized('Token inválido o expirado'));
  }
}

module.exports = authenticate;

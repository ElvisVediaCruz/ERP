const ApiError = require('../errors/ApiError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(ApiError.badRequest('Error de validación', result.error.issues));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;

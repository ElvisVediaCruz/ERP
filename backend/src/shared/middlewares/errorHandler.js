const ApiError = require('../errors/ApiError');

const DUPLICATE_FIELD_LABELS = {
  code: 'código',
  barcode: 'código de barras',
  username: 'nombre de usuario',
};

function formatDuplicateMessage(err) {
  const match = /Duplicate entry '(.*)' for key '([^']+)'/.exec(err.sqlMessage || '');
  if (!match) return 'El registro ya existe (valor duplicado en un campo único)';
  const [, value, key] = match;
  const field = key.split('.').pop();
  const label = DUPLICATE_FIELD_LABELS[field] ?? field;
  return `Ya existe un registro con ${label} "${value}"`;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: { code: 'DUPLICATE', message: formatDuplicateMessage(err) },
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      error: { code: 'FK_VIOLATION', message: 'Referencia inválida entre registros relacionados' },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}

module.exports = errorHandler;

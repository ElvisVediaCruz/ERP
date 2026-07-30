class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static notFound(message, details) {
    return new ApiError(404, 'NOT_FOUND', message, details);
  }

  static conflict(message, details) {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static unauthorized(message, details) {
    return new ApiError(401, 'UNAUTHORIZED', message, details);
  }
}

module.exports = ApiError;

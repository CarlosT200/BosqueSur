// Error de aplicacion con codigo HTTP y codigo de negocio controlado.
export class ApiError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isApiError = true;
  }

  static badRequest(message, code = 'BAD_REQUEST', details = []) {
    return new ApiError(400, code, message, details);
  }

  static validation(details, message = 'Los datos ingresados no son validos') {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'No autenticado', code = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'No tiene permisos para esta operacion', code = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Recurso no encontrado', code = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message, code = 'CONFLICT', details = []) {
    return new ApiError(409, code, message, details);
  }
}

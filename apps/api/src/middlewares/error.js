import { ApiError } from '../utils/ApiError.js';

// 404 para rutas no encontradas.
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// Manejo centralizado de errores. No expone trazas internas al cliente.
// (Express identifica este middleware por su aridad de 4 argumentos.)
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Ocurrio un error interno';
  let details = [];

  if (err instanceof ApiError || err?.isApiError) {
    status = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details ?? [];
  } else if (err?.code === 'P2002') {
    status = 409;
    code = 'UNIQUE_CONSTRAINT';
    message = 'Ya existe un registro con esos datos unicos';
    details = err.meta?.target ?? [];
  } else if (err?.code === 'P2025') {
    status = 404;
    code = 'NOT_FOUND';
    message = 'Registro no encontrado';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'El cuerpo de la solicitud no es un JSON valido';
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ success: false, error: { code, message, details } });
}

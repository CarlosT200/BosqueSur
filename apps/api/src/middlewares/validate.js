import { ApiError } from '../utils/ApiError.js';

// Valida y normaliza req[source] con un esquema Zod.
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        campo: i.path.join('.') || '(cuerpo)',
        mensaje: i.message,
      }));
      return next(ApiError.validation(details));
    }
    req[source] = result.data;
    next();
  };
}

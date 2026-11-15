import { ApiError } from '../utils/ApiError.js';
import { writeAudit } from '../utils/audit.js';

// Autorizacion por rol. SIEMPRE se verifica en el backend.
// Un acceso denegado queda registrado en auditoria (403).
export function authorize(...roles) {
  return async (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());

    if (!roles.includes(req.user.role)) {
      await writeAudit({
        usuarioId: req.user.id,
        accion: 'ACCESO_DENEGADO',
        entidad: 'Autorizacion',
        resultado: 'DENEGADO',
        detalle: {
          ruta: req.originalUrl,
          metodo: req.method,
          rolUsuario: req.user.role,
          rolesPermitidos: roles,
        },
        ip: req.ip,
      });
      return next(ApiError.forbidden('No tiene permisos para esta operacion', 'SIN_PERMISO'));
    }

    next();
  };
}

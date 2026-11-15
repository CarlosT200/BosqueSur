import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Valida el JWT del encabezado Authorization: Bearer <token>.
// Responde 401 cuando no hay token valido.
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Token no proporcionado', 'NO_TOKEN');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Token invalido o expirado', 'INVALID_TOKEN');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.activo) {
    throw ApiError.unauthorized('Usuario no valido o inactivo', 'INVALID_USER');
  }

  req.user = { id: user.id, nombre: user.nombre, email: user.email, role: user.role };
  next();
});

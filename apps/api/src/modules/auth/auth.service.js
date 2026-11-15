import { prisma } from '../../db/prisma.js';
import { verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { writeAudit } from '../../utils/audit.js';
import { ApiError } from '../../utils/ApiError.js';

function publicUser(u) {
  return { id: u.id, nombre: u.nombre, email: u.email, role: u.role };
}

export async function login({ email, password, ip }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.activo) {
    await writeAudit({
      usuarioId: user?.id ?? null,
      accion: 'LOGIN',
      entidad: 'User',
      entidadId: user?.id ?? null,
      resultado: 'FALLO',
      detalle: { email, motivo: user ? 'usuario_inactivo' : 'usuario_inexistente' },
      ip,
    });
    throw ApiError.unauthorized('Credenciales invalidas', 'INVALID_CREDENTIALS');
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await writeAudit({
      usuarioId: user.id,
      accion: 'LOGIN',
      entidad: 'User',
      entidadId: user.id,
      resultado: 'FALLO',
      detalle: { email, motivo: 'password_incorrecta' },
      ip,
    });
    throw ApiError.unauthorized('Credenciales invalidas', 'INVALID_CREDENTIALS');
  }

  const token = signToken(user);
  await writeAudit({
    usuarioId: user.id,
    accion: 'LOGIN',
    entidad: 'User',
    entidadId: user.id,
    resultado: 'EXITO',
    detalle: { email },
    ip,
  });

  return { token, user: publicUser(user) };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('Usuario no encontrado');
  return publicUser(user);
}

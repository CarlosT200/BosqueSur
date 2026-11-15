import { prisma } from '../db/prisma.js';

// Registra un evento de auditoria. Acepta un cliente Prisma alternativo
// (por ejemplo el de una transaccion) para registrar dentro de ella.
// Nunca lanza: la auditoria no debe romper la operacion principal.
export async function writeAudit(
  { usuarioId = null, accion, entidad, entidadId = null, resultado = 'EXITO', detalle = null, ip = null },
  client = prisma,
) {
  try {
    await client.auditLog.create({
      data: { usuarioId, accion, entidad, entidadId, resultado, detalle: detalle ?? undefined, ip },
    });
  } catch (err) {
    console.error('[audit] No se pudo registrar el evento:', err.message);
  }
}

export const AuditResultado = { EXITO: 'EXITO', FALLO: 'FALLO', DENEGADO: 'DENEGADO' };

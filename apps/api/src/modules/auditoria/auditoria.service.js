import { prisma } from '../../db/prisma.js';

export function listAuditoria(limit = 100) {
  return prisma.auditLog.findMany({
    take: limit,
    include: { usuario: { select: { id: true, nombre: true, email: true, role: true } } },
    orderBy: { fecha: 'desc' },
  });
}

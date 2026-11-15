import { prisma } from '../../db/prisma.js';

export function listInventario() {
  return prisma.inventoryItem.findMany({ orderBy: { especie: 'asc' } });
}

export function listMovimientos(limit = 50) {
  return prisma.inventoryMovement.findMany({
    take: limit,
    include: {
      inventoryItem: { select: { id: true, especie: true } },
      usuario: { select: { id: true, nombre: true } },
      recepcion: { select: { id: true, despacho: { select: { codigo: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

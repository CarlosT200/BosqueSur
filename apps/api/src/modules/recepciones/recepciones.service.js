import { prisma } from '../../db/prisma.js';

export function listRecepciones() {
  return prisma.recepcion.findMany({
    include: {
      despacho: { select: { id: true, codigo: true, especie: true, volumenDespachadoM3: true, fechaDespacho: true } },
      receptor: { select: { id: true, nombre: true } },
    },
    orderBy: { fechaRecepcion: 'desc' },
  });
}

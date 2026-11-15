import { prisma } from '../../db/prisma.js';

export async function getResumen() {
  const [despachosPendientes, despachosRecibidos, recepcionesTotales, recepcionesConDiferencia, items, aggStock] =
    await Promise.all([
      prisma.despacho.count({ where: { estado: 'PENDIENTE' } }),
      prisma.despacho.count({ where: { estado: 'RECIBIDO' } }),
      prisma.recepcion.count(),
      prisma.recepcion.count({ where: { NOT: { diferenciaM3: 0 } } }),
      prisma.inventoryItem.count(),
      prisma.inventoryItem.aggregate({ _sum: { cantidadM3: true } }),
    ]);

  // Desglose de diferencias por tipo de resolucion.
  const porResolucion = await prisma.recepcion.groupBy({
    by: ['resolucion'],
    _count: { _all: true },
    where: { NOT: { resolucion: null } },
  });

  return {
    despachosPendientes,
    despachosRecibidos,
    recepcionesTotales,
    recepcionesConDiferencia,
    especiesEnInventario: items,
    stockTotalM3: Number(aggStock._sum.cantidadM3 ?? 0),
    diferenciasPorResolucion: porResolucion.map((r) => ({
      resolucion: r.resolucion,
      cantidad: r._count._all,
    })),
  };
}

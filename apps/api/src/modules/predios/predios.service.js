import { prisma } from '../../db/prisma.js';
import { writeAudit } from '../../utils/audit.js';

export function listPredios() {
  return prisma.predio.findMany({ orderBy: { nombre: 'asc' } });
}

export async function createPredio(data, user, ip) {
  const predio = await prisma.predio.create({
    data: {
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      descripcion: data.descripcion ?? null,
    },
  });

  await writeAudit({
    usuarioId: user.id,
    accion: 'CREAR_PREDIO',
    entidad: 'Predio',
    entidadId: predio.id,
    resultado: 'EXITO',
    detalle: { nombre: predio.nombre, ubicacion: predio.ubicacion },
    ip,
  });

  return predio;
}

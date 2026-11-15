import { prisma } from '../../db/prisma.js';
import { writeAudit } from '../../utils/audit.js';
import { ApiError } from '../../utils/ApiError.js';

const origenInclude = {
  predio: { select: { id: true, nombre: true, ubicacion: true } },
  responsable: { select: { id: true, nombre: true, email: true } },
};

export function listCosechas(filters = {}) {
  const where = {};
  if (filters.predioId) where.predioId = filters.predioId;
  if (filters.especie) where.especie = { contains: filters.especie, mode: 'insensitive' };
  return prisma.cosecha.findMany({
    where,
    include: origenInclude,
    orderBy: { fecha: 'desc' },
  });
}

export async function getCosecha(id) {
  const cosecha = await prisma.cosecha.findUnique({ where: { id }, include: origenInclude });
  if (!cosecha) throw ApiError.notFound('Cosecha no encontrada');
  return cosecha;
}

export async function createCosecha(data, user, ip) {
  // Debe existir el predio seleccionado.
  const predio = await prisma.predio.findUnique({ where: { id: data.predioId } });
  if (!predio) throw ApiError.badRequest('El predio seleccionado no existe', 'PREDIO_NO_EXISTE');

  // El responsable por defecto es el usuario autenticado (rol TERRENO).
  const responsableId = data.responsableId ?? user.id;
  const responsable = await prisma.user.findUnique({ where: { id: responsableId } });
  if (!responsable) throw ApiError.badRequest('El responsable indicado no existe', 'RESPONSABLE_NO_EXISTE');

  const cosecha = await prisma.cosecha.create({
    data: {
      predioId: data.predioId,
      fecha: data.fecha,
      responsableId,
      especie: data.especie,
      volumenM3: data.volumenM3,
      observacion: data.observacion ?? null,
    },
    include: origenInclude,
  });

  await writeAudit({
    usuarioId: user.id,
    accion: 'CREAR_COSECHA',
    entidad: 'Cosecha',
    entidadId: cosecha.id,
    resultado: 'EXITO',
    detalle: {
      predioId: data.predioId,
      especie: cosecha.especie,
      volumenM3: cosecha.volumenM3.toString(),
    },
    ip,
  });

  return cosecha;
}

import { prisma } from '../../db/prisma.js';
import { writeAudit } from '../../utils/audit.js';
import { ApiError } from '../../utils/ApiError.js';

// Redondeo a 3 decimales para trabajar en metros cubicos.
const round3 = (n) => Math.round((n + Number.EPSILON) * 1000) / 1000;

const detalleInclude = {
  cosecha: {
    select: {
      id: true,
      especie: true,
      fecha: true,
      volumenM3: true,
      predio: { select: { id: true, nombre: true, ubicacion: true } },
    },
  },
  recepcion: {
    include: { receptor: { select: { id: true, nombre: true } } },
  },
};

export function listDespachos(filters = {}) {
  const where = {};
  if (filters.estado) where.estado = filters.estado;
  return prisma.despacho.findMany({
    where,
    include: { recepcion: { select: { id: true, diferenciaM3: true, resolucion: true } } },
    orderBy: { fechaDespacho: 'desc' },
  });
}

export async function getDespacho(id) {
  const despacho = await prisma.despacho.findUnique({ where: { id }, include: detalleInclude });
  if (!despacho) throw ApiError.notFound('Despacho no encontrado');
  return despacho;
}

/**
 * Registra la recepcion de un despacho y actualiza el inventario de forma
 * ATOMICA (BL-04 + BL-05). Dentro de UNA sola transaccion de PostgreSQL:
 *   1. Crea la recepcion.
 *   2. Crea/actualiza el item de inventario de la especie.
 *   3. Crea el movimiento de inventario (saldo anterior y posterior).
 *   4. Cambia el despacho a estado RECIBIDO.
 *   5. Registra la auditoria.
 * Si algo falla, se revierte todo.
 */
export async function registrarRecepcion(despachoId, data, user, ip) {
  const despacho = await prisma.despacho.findUnique({
    where: { id: despachoId },
    include: { recepcion: true },
  });

  // No se puede recibir un despacho inexistente.
  if (!despacho) throw ApiError.notFound('El despacho no existe', 'DESPACHO_NO_EXISTE');

  // No se puede recibir dos veces el mismo despacho.
  if (despacho.estado === 'RECIBIDO' || despacho.recepcion) {
    await writeAudit({
      usuarioId: user.id,
      accion: 'RECEPCION_DUPLICADA',
      entidad: 'Despacho',
      entidadId: despacho.id,
      resultado: 'DENEGADO',
      detalle: { codigo: despacho.codigo, motivo: 'despacho_ya_recibido' },
      ip,
    });
    throw ApiError.conflict('El despacho ya fue recibido anteriormente', 'DESPACHO_YA_RECIBIDO');
  }

  const volumenDespachado = Number(despacho.volumenDespachadoM3);
  const volumenRecibido = round3(data.volumenRecibidoM3);
  const diferencia = round3(volumenRecibido - volumenDespachado);

  // Si hay diferencia, la resolucion y la observacion son obligatorias.
  if (diferencia !== 0) {
    if (!data.resolucion) {
      throw ApiError.badRequest(
        'Existe una diferencia: debe seleccionar una resolucion (INCIDENCIA_ABIERTA, AJUSTE_ACEPTADO o RECHAZADO)',
        'RESOLUCION_REQUERIDA',
      );
    }
    if (!data.observacion) {
      throw ApiError.badRequest(
        'Existe una diferencia: la observacion es obligatoria',
        'OBSERVACION_REQUERIDA',
      );
    }
  }

  // Si la diferencia es cero, la resolucion no aplica.
  const resolucion = diferencia === 0 ? null : data.resolucion;

  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Crear la recepcion.
    const recepcion = await tx.recepcion.create({
      data: {
        despachoId: despacho.id,
        volumenRecibidoM3: volumenRecibido,
        diferenciaM3: diferencia,
        fechaRecepcion: data.fechaRecepcion,
        resolucion,
        observacion: data.observacion ?? null,
        receptorId: user.id,
      },
    });

    // 2 y 3. Incremento ATOMICO de existencias (fuente unica de informacion).
    //
    // Se usa upsert con `increment`, que genera un UPDATE ... SET
    // "cantidadM3" = "cantidadM3" + n. PostgreSQL bloquea la fila durante ese
    // UPDATE y re-lee el valor bajo bloqueo, por lo que dos recepciones
    // concurrentes de la MISMA especie no pierden actualizaciones (no hay
    // "lost update"). El saldo posterior es el valor real devuelto tras el
    // incremento; el saldo anterior se deriva restando lo recibido.
    const item = await tx.inventoryItem.upsert({
      where: { especie: despacho.especie },
      create: { especie: despacho.especie, cantidadM3: volumenRecibido },
      update: { cantidadM3: { increment: volumenRecibido } },
    });
    const saldoPosterior = round3(Number(item.cantidadM3));
    const saldoAnterior = round3(saldoPosterior - volumenRecibido);

    // 4. Crear el movimiento de inventario.
    const movimiento = await tx.inventoryMovement.create({
      data: {
        inventoryItemId: item.id,
        tipo: 'ENTRADA_RECEPCION',
        cantidadM3: volumenRecibido,
        saldoAnteriorM3: saldoAnterior,
        saldoPosteriorM3: saldoPosterior,
        recepcionId: recepcion.id,
        usuarioId: user.id,
      },
    });

    // 5. Cambiar el despacho a estado RECIBIDO.
    const despachoActualizado = await tx.despacho.update({
      where: { id: despacho.id },
      data: { estado: 'RECIBIDO' },
    });

    // 6. Registrar auditoria DENTRO de la misma transaccion (atomico).
    await tx.auditLog.create({
      data: {
        usuarioId: user.id,
        accion: 'CONFIRMAR_RECEPCION',
        entidad: 'Recepcion',
        entidadId: recepcion.id,
        resultado: 'EXITO',
        detalle: {
          despacho: despacho.codigo,
          volumenDespachado,
          volumenRecibido,
          diferencia,
          resolucion,
        },
        ip,
      },
    });
    await tx.auditLog.create({
      data: {
        usuarioId: user.id,
        accion: 'ACTUALIZAR_INVENTARIO',
        entidad: 'InventoryItem',
        entidadId: item.id,
        resultado: 'EXITO',
        detalle: {
          especie: item.especie,
          saldoAnterior,
          saldoPosterior,
          movimientoId: movimiento.id,
        },
        ip,
      },
    });

    return { recepcion, movimiento, inventario: item, despacho: despachoActualizado };
  });

  return resultado;
}

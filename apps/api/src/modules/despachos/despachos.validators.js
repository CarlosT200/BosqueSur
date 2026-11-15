import { z } from 'zod';

export const listDespachosQuery = z.object({
  estado: z.enum(['PENDIENTE', 'RECIBIDO']).optional(),
});

export const recepcionSchema = z.object({
  volumenRecibidoM3: z.coerce
    .number({ invalid_type_error: 'El volumen recibido debe ser numerico' })
    .nonnegative('El volumen recibido no puede ser negativo'),
  fechaRecepcion: z.coerce.date({ errorMap: () => ({ message: 'La fecha de recepcion no es valida' }) }),
  resolucion: z.enum(['INCIDENCIA_ABIERTA', 'AJUSTE_ACEPTADO', 'RECHAZADO']).optional(),
  observacion: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v || null),
});

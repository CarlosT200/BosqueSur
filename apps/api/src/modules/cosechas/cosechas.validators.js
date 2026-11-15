import { z } from 'zod';

export const createCosechaSchema = z.object({
  predioId: z.string().min(1, 'El predio es obligatorio'),
  fecha: z.coerce.date({ errorMap: () => ({ message: 'La fecha no es valida' }) }),
  responsableId: z.string().min(1).optional(),
  especie: z.string().trim().min(1, 'La especie es obligatoria').max(100),
  volumenM3: z.coerce
    .number({ invalid_type_error: 'El volumen debe ser numerico' })
    .positive('El volumen debe ser mayor que cero'),
  observacion: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v || null),
});

export const listCosechasQuery = z.object({
  predioId: z.string().optional(),
  especie: z.string().optional(),
});

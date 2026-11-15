import { z } from 'zod';

export const createPredioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(150),
  ubicacion: z.string().trim().min(1, 'La ubicacion o comuna es obligatoria').max(150),
  descripcion: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v || null),
});

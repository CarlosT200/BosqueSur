import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET debe tener al menos 10 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  LOGIN_RATE_MAX: z.coerce.number().int().positive().default(10),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('[config] Variables de entorno invalidas:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const corsOrigins = parsed.data.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const env = {
  ...parsed.data,
  corsOrigins,
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};

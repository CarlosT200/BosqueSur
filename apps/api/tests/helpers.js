import { prisma } from '../src/db/prisma.js';
import { runSeed } from '../prisma/seed.js';

// Deja la base en un estado conocido: vacia y repoblada con el seed.
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "audit_logs","inventory_movements","recepciones","despachos","cosechas","inventory_items","predios","users" RESTART IDENTITY CASCADE',
  );
  await runSeed({ silent: true });
}

export const CREDS = {
  ADMIN: { email: 'admin@bosquesur.cl', password: 'Admin123*' },
  TERRENO: { email: 'terreno@bosquesur.cl', password: 'Terreno123*' },
  BODEGA: { email: 'bodega@bosquesur.cl', password: 'Bodega123*' },
  GERENCIA: { email: 'gerencia@bosquesur.cl', password: 'Gerencia123*' },
};

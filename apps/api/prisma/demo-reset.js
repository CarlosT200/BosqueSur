// ======================================================================
// Reinicio seguro de datos de DEMOSTRACION — BosqueSur ES3
//
// Script de línea de comandos (NO hay endpoint público de reinicio).
// Deja la base en el estado inicial de demostración: usuarios demo,
// predios, cosechas, despachos PENDIENTES e inventario inicial; y limpia
// recepciones, movimientos de inventario y auditoría generados durante la
// demostración.
//
// En este prototipo TODOS los datos son de demostración y regenerables por
// el seed, por lo que el reinicio trunca y vuelve a sembrar.
//
// Salvaguardas:
//   - Requiere confirmación explícita:   CONFIRM_DEMO_RESET=SI
//   - Bloqueado en producción salvo que: ALLOW_DEMO_RESET=true
//
// Uso local:
//   CONFIRM_DEMO_RESET=SI npm run demo:reset
// ======================================================================
import { prisma } from '../src/db/prisma.js';
import { runSeed } from './seed.js';

// Orden que respeta las claves foráneas (TRUNCATE ... CASCADE lo refuerza).
const TABLAS = [
  'audit_logs',
  'inventory_movements',
  'recepciones',
  'despachos',
  'cosechas',
  'inventory_items',
  'predios',
  'users',
];

async function main() {
  const env = process.env;

  if (env.CONFIRM_DEMO_RESET !== 'SI') {
    console.error('[demo:reset] Abortado: falta confirmación explícita.');
    console.error('[demo:reset] Ejecute con  CONFIRM_DEMO_RESET=SI  para confirmar el reinicio.');
    process.exit(1);
  }

  if (env.NODE_ENV === 'production' && env.ALLOW_DEMO_RESET !== 'true') {
    console.error('[demo:reset] Bloqueado en producción.');
    console.error('[demo:reset] Para permitirlo explícitamente, defina ALLOW_DEMO_RESET=true (además de CONFIRM_DEMO_RESET=SI).');
    process.exit(1);
  }

  console.log('[demo:reset] Limpiando datos de demostración (respetando claves foráneas)...');
  await prisma.$executeRawUnsafe(
    `TRUNCATE ${TABLAS.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );

  console.log('[demo:reset] Re-sembrando estado inicial de demostración...');
  await runSeed({ silent: false });

  console.log('[demo:reset] Completado: despachos PENDIENTES e inventario inicial restaurados;');
  console.log('[demo:reset] recepciones, movimientos y auditoría de demostración eliminados.');
}

main()
  .catch((e) => {
    console.error('[demo:reset] Error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

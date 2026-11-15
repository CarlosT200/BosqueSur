// ======================================================================
// Seed idempotente - BosqueSur ES3
// Crea usuarios de demostracion (por rol), predios, cosechas, al menos
// tres despachos pendientes e inventario inicial de apertura.
// Se puede ejecutar varias veces sin duplicar datos (usa upsert).
//
// Las contrasenas son SOLO de demostracion. Nunca uses secretos reales.
// ======================================================================
import { pathToFileURL } from 'node:url';
import { prisma } from '../src/db/prisma.js';
import { hashPassword } from '../src/utils/password.js';

async function seedUsuarios() {
  const usuarios = [
    { id: 'usr_admin', nombre: 'Admin BosqueSur', email: 'admin@bosquesur.cl', role: 'ADMIN', password: 'Admin123*' },
    { id: 'usr_terreno', nombre: 'Tomas Terreno', email: 'terreno@bosquesur.cl', role: 'TERRENO', password: 'Terreno123*' },
    { id: 'usr_bodega', nombre: 'Berta Bodega', email: 'bodega@bosquesur.cl', role: 'BODEGA', password: 'Bodega123*' },
    { id: 'usr_gerencia', nombre: 'Gloria Gerencia', email: 'gerencia@bosquesur.cl', role: 'GERENCIA', password: 'Gerencia123*' },
  ];

  for (const u of usuarios) {
    const passwordHash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { nombre: u.nombre, role: u.role, activo: true, passwordHash },
      create: { id: u.id, nombre: u.nombre, email: u.email, role: u.role, passwordHash },
    });
  }
  console.log(`  - ${usuarios.length} usuarios de demostracion`);
  return usuarios;
}

async function seedPredios() {
  const predios = [
    { id: 'prd_pinar_sur', nombre: 'Fundo El Pinar', ubicacion: 'San Clemente, Maule', descripcion: 'Plantacion de pino radiata.' },
    { id: 'prd_los_robles', nombre: 'Predio Los Robles', ubicacion: 'Cauquenes, Maule', descripcion: 'Bosque mixto de roble y eucalipto.' },
    { id: 'prd_alto_maule', nombre: 'Fundo Alto Maule', ubicacion: 'Linares, Maule', descripcion: null },
  ];
  for (const p of predios) {
    await prisma.predio.upsert({
      where: { id: p.id },
      update: { nombre: p.nombre, ubicacion: p.ubicacion, descripcion: p.descripcion },
      create: p,
    });
  }
  console.log(`  - ${predios.length} predios`);
  return predios;
}

async function seedCosechas() {
  const cosechas = [
    { id: 'csh_1', predioId: 'prd_pinar_sur', responsableId: 'usr_terreno', especie: 'Pino', volumenM3: 120.5, fecha: new Date('2026-10-01T09:00:00Z'), observacion: 'Cosecha de raleo.' },
    { id: 'csh_2', predioId: 'prd_los_robles', responsableId: 'usr_terreno', especie: 'Eucalipto', volumenM3: 85.0, fecha: new Date('2026-10-05T09:00:00Z'), observacion: null },
    { id: 'csh_3', predioId: 'prd_los_robles', responsableId: 'usr_terreno', especie: 'Roble', volumenM3: 60.25, fecha: new Date('2026-10-08T09:00:00Z'), observacion: 'Tala rasa parcial.' },
  ];
  for (const c of cosechas) {
    await prisma.cosecha.upsert({ where: { id: c.id }, update: c, create: c });
  }
  console.log(`  - ${cosechas.length} cosechas`);
  return cosechas;
}

async function seedDespachos() {
  // Al menos tres despachos PENDIENTES para la demostracion de recepcion.
  const despachos = [
    { id: 'dsp_1', codigo: 'DSP-0001', cosechaId: 'csh_1', especie: 'Pino', volumenDespachadoM3: 120.5, fechaDespacho: new Date('2026-10-02T12:00:00Z') },
    { id: 'dsp_2', codigo: 'DSP-0002', cosechaId: 'csh_2', especie: 'Eucalipto', volumenDespachadoM3: 85.0, fechaDespacho: new Date('2026-10-06T12:00:00Z') },
    { id: 'dsp_3', codigo: 'DSP-0003', cosechaId: 'csh_3', especie: 'Roble', volumenDespachadoM3: 60.25, fechaDespacho: new Date('2026-10-09T12:00:00Z') },
    { id: 'dsp_4', codigo: 'DSP-0004', cosechaId: null, especie: 'Pino', volumenDespachadoM3: 200.0, fechaDespacho: new Date('2026-10-10T12:00:00Z') },
  ];
  for (const d of despachos) {
    await prisma.despacho.upsert({
      where: { codigo: d.codigo },
      update: { cosechaId: d.cosechaId, especie: d.especie, volumenDespachadoM3: d.volumenDespachadoM3, fechaDespacho: d.fechaDespacho },
      create: { ...d, estado: 'PENDIENTE', creadorId: 'usr_admin' },
    });
  }
  console.log(`  - ${despachos.length} despachos pendientes`);
  return despachos;
}

async function seedInventarioInicial() {
  // Saldo de apertura. Se crea solo si no existe (no sobrescribe recepciones ya hechas).
  const items = [
    { id: 'inv_pino', especie: 'Pino', cantidadM3: 150.0 },
    { id: 'inv_roble', especie: 'Roble', cantidadM3: 40.0 },
  ];
  for (const it of items) {
    await prisma.inventoryItem.upsert({
      where: { especie: it.especie },
      update: {}, // no sobrescribir el saldo si ya existe
      create: it,
    });
  }
  // Nota: la especie Eucalipto se crea automaticamente en su primera recepcion.
  console.log(`  - ${items.length} especies con inventario inicial (Pino, Roble)`);
}

// Funcion reutilizable (tambien usada por las pruebas). No desconecta Prisma.
export async function runSeed({ silent = false } = {}) {
  const log = silent ? () => {} : (...a) => console.log(...a);
  log('[seed] Poblando base de datos BosqueSur ES3...');
  await seedUsuarios();
  await seedPredios();
  await seedCosechas();
  await seedDespachos();
  await seedInventarioInicial();
  log('[seed] Completado.');
  log('[seed] Credenciales de demostracion:');
  log('        ADMIN    -> admin@bosquesur.cl    / Admin123*');
  log('        TERRENO  -> terreno@bosquesur.cl  / Terreno123*');
  log('        BODEGA   -> bodega@bosquesur.cl   / Bodega123*');
  log('        GERENCIA -> gerencia@bosquesur.cl / Gerencia123*');
}

// Ejecucion por CLI: `node prisma/seed.js`.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  runSeed()
    .catch((e) => {
      console.error('[seed] Error:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

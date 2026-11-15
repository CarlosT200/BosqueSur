import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';
import { resetDb, CREDS } from './helpers.js';

const app = createApp();
const tokens = {};
let cosechaCreadaId = null;

async function login(creds) {
  const res = await request(app).post('/api/auth/login').send(creds);
  return res;
}

beforeAll(async () => {
  await resetDb();
  for (const [role, creds] of Object.entries(CREDS)) {
    const res = await login(creds);
    tokens[role] = res.body.data.token;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('BL-01 Autenticacion, roles y permisos', () => {
  it('1. Un usuario valido inicia sesion y recibe un JWT', async () => {
    const res = await login(CREDS.ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.')).toHaveLength(3); // header.payload.firma
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('2. Una contrasena incorrecta es rechazada (401)', async () => {
    const res = await login({ email: CREDS.ADMIN.email, password: 'incorrecta' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('3. Una solicitud sin token obtiene 401', async () => {
    const res = await request(app).get('/api/inventario');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBeDefined();
  });

  it('4. Un usuario sin el rol permitido obtiene 403', async () => {
    const res = await request(app)
      .get('/api/inventario')
      .set('Authorization', `Bearer ${tokens.TERRENO}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('SIN_PERMISO');
  });

  it('5. El intento no autorizado queda registrado en auditoria', async () => {
    const registros = await prisma.auditLog.findMany({
      where: { accion: 'ACCESO_DENEGADO', resultado: 'DENEGADO' },
    });
    expect(registros.length).toBeGreaterThan(0);
  });
});

describe('BL-03 Predios y cosechas', () => {
  let predioId = null;

  it('6. Un usuario TERRENO puede registrar un predio', async () => {
    const res = await request(app)
      .post('/api/predios')
      .set('Authorization', `Bearer ${tokens.TERRENO}`)
      .send({ nombre: 'Fundo de Prueba', ubicacion: 'Talca' });
    expect(res.status).toBe(201);
    expect(res.body.data.predio.id).toBeDefined();
    predioId = res.body.data.predio.id;
  });

  it('7. Un usuario TERRENO puede registrar una cosecha valida', async () => {
    const res = await request(app)
      .post('/api/cosechas')
      .set('Authorization', `Bearer ${tokens.TERRENO}`)
      .send({ predioId, fecha: '2026-11-01', especie: 'Pino', volumenM3: 42.5, observacion: 'ok' });
    expect(res.status).toBe(201);
    expect(res.body.data.cosecha.volumenM3).toBe('42.5');
    expect(res.body.data.cosecha.responsable.nombre).toBeDefined();
    cosechaCreadaId = res.body.data.cosecha.id;
  });

  it('8. Se rechaza una cosecha con volumen igual o menor que cero', async () => {
    const res = await request(app)
      .post('/api/cosechas')
      .set('Authorization', `Bearer ${tokens.TERRENO}`)
      .send({ predioId, fecha: '2026-11-01', especie: 'Pino', volumenM3: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('9. La cosecha registrada queda consultable con su predio de origen', async () => {
    const res = await request(app)
      .get(`/api/cosechas/${cosechaCreadaId}`)
      .set('Authorization', `Bearer ${tokens.TERRENO}`);
    expect(res.status).toBe(200);
    expect(res.body.data.cosecha.predio.nombre).toBe('Fundo de Prueba');
  });
});

describe('BL-04 / BL-05 Recepcion, diferencias e inventario', () => {
  it('10. Una recepcion exacta actualiza el inventario y cierra el despacho', async () => {
    // DSP-0002: Eucalipto 85 m3, sin inventario previo de esa especie.
    const res = await request(app)
      .post('/api/despachos/dsp_2/recepcion')
      .set('Authorization', `Bearer ${tokens.BODEGA}`)
      .send({ volumenRecibidoM3: 85, fechaRecepcion: '2026-10-07' });
    expect(res.status).toBe(201);
    expect(Number(res.body.data.recepcion.diferenciaM3)).toBe(0);
    expect(res.body.data.despacho.estado).toBe('RECIBIDO');
    expect(Number(res.body.data.inventario.cantidadM3)).toBe(85);

    const item = await prisma.inventoryItem.findUnique({ where: { especie: 'Eucalipto' } });
    expect(Number(item.cantidadM3)).toBe(85);
  });

  it('11. Una recepcion con diferencia exige una resolucion', async () => {
    // DSP-0003: Roble 60.25; se recibe 55 (faltante) sin resolucion.
    const res = await request(app)
      .post('/api/despachos/dsp_3/recepcion')
      .set('Authorization', `Bearer ${tokens.BODEGA}`)
      .send({ volumenRecibidoM3: 55, fechaRecepcion: '2026-10-10' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('RESOLUCION_REQUERIDA');
  });

  it('12. Una recepcion con diferencia exige una observacion', async () => {
    const res = await request(app)
      .post('/api/despachos/dsp_3/recepcion')
      .set('Authorization', `Bearer ${tokens.BODEGA}`)
      .send({ volumenRecibidoM3: 55, fechaRecepcion: '2026-10-10', resolucion: 'INCIDENCIA_ABIERTA' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('OBSERVACION_REQUERIDA');
  });

  it('13. No se puede recibir dos veces el mismo despacho', async () => {
    // DSP-0004: Pino 200; primera recepcion exacta.
    const r1 = await request(app)
      .post('/api/despachos/dsp_4/recepcion')
      .set('Authorization', `Bearer ${tokens.BODEGA}`)
      .send({ volumenRecibidoM3: 200, fechaRecepcion: '2026-10-11' });
    expect(r1.status).toBe(201);

    const r2 = await request(app)
      .post('/api/despachos/dsp_4/recepcion')
      .set('Authorization', `Bearer ${tokens.BODEGA}`)
      .send({ volumenRecibidoM3: 200, fechaRecepcion: '2026-10-11' });
    expect(r2.status).toBe(409);
    expect(r2.body.error.code).toBe('DESPACHO_YA_RECIBIDO');
  });

  it('14. La creacion de recepcion, movimiento, inventario, cambio de estado y auditoria es atomica', async () => {
    // Efecto atomico (exito): DSP-0001 Pino 120.5, se recibe 118 (faltante).
    const pinoAntes = await prisma.inventoryItem.findUnique({ where: { especie: 'Pino' } });
    const saldoAntes = Number(pinoAntes.cantidadM3); // 150 del seed

    const res = await request(app)
      .post('/api/despachos/dsp_1/recepcion')
      .set('Authorization', `Bearer ${tokens.BODEGA}`)
      .send({
        volumenRecibidoM3: 118,
        fechaRecepcion: '2026-10-03',
        resolucion: 'INCIDENCIA_ABIERTA',
        observacion: 'Faltan 2.5 m3',
      });
    expect(res.status).toBe(201);
    const recepcionId = res.body.data.recepcion.id;

    // Los 5 efectos existen y son consistentes.
    const recepcion = await prisma.recepcion.findUnique({ where: { id: recepcionId } });
    const movimiento = await prisma.inventoryMovement.findFirst({ where: { recepcionId } });
    const pino = await prisma.inventoryItem.findUnique({ where: { especie: 'Pino' } });
    const despacho = await prisma.despacho.findUnique({ where: { id: 'dsp_1' } });
    const audit = await prisma.auditLog.findFirst({
      where: { accion: 'ACTUALIZAR_INVENTARIO', entidadId: pino.id },
    });

    expect(recepcion).not.toBeNull();
    expect(movimiento).not.toBeNull();
    expect(Number(movimiento.saldoAnteriorM3)).toBe(saldoAntes);
    expect(Number(movimiento.saldoPosteriorM3)).toBe(saldoAntes + 118);
    expect(Number(pino.cantidadM3)).toBe(saldoAntes + 118);
    expect(despacho.estado).toBe('RECIBIDO');
    expect(audit).not.toBeNull();
  });

  it('14b. Una transaccion que falla se revierte por completo (rollback)', async () => {
    const movimientosAntes = await prisma.inventoryMovement.count();
    const itemsAntes = await prisma.inventoryItem.count();

    // Transaccion que crea un item valido y luego un movimiento con FK invalida.
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.inventoryItem.create({ data: { especie: 'EspecieFantasma', cantidadM3: 10 } });
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: 'id_inexistente',
            tipo: 'ENTRADA_RECEPCION',
            cantidadM3: 10,
            saldoAnteriorM3: 0,
            saldoPosteriorM3: 10,
            usuarioId: 'usr_bodega',
          },
        });
      }),
    ).rejects.toThrow();

    // Nada quedo persistido (ni el item ni el movimiento).
    const fantasma = await prisma.inventoryItem.findUnique({ where: { especie: 'EspecieFantasma' } });
    expect(fantasma).toBeNull();
    expect(await prisma.inventoryMovement.count()).toBe(movimientosAntes);
    expect(await prisma.inventoryItem.count()).toBe(itemsAntes);
  });
});

describe('Calidad, roles de consulta y errores', () => {
  it('15. Los errores entregan respuestas JSON controladas', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: expect.any(String), message: expect.any(String) } });
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('16. Un usuario GERENCIA puede consultar el inventario, pero no modificarlo', async () => {
    const ver = await request(app)
      .get('/api/inventario')
      .set('Authorization', `Bearer ${tokens.GERENCIA}`);
    expect(ver.status).toBe(200);

    const modificar = await request(app)
      .post('/api/despachos/dsp_3/recepcion')
      .set('Authorization', `Bearer ${tokens.GERENCIA}`)
      .send({ volumenRecibidoM3: 60.25, fechaRecepcion: '2026-10-12' });
    expect(modificar.status).toBe(403);
  });

  it('17. Un usuario ADMIN puede consultar la auditoria', async () => {
    const res = await request(app)
      .get('/api/auditoria')
      .set('Authorization', `Bearer ${tokens.ADMIN}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.auditoria)).toBe(true);
    expect(res.body.data.auditoria.length).toBeGreaterThan(0);
  });
});

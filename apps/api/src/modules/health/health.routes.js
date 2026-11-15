import { Router } from 'express';
import { prisma } from '../../db/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  let db = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = 'error';
  }
  const status = db === 'ok' ? 200 : 503;
  res.status(status).json({
    success: db === 'ok',
    data: { status: db === 'ok' ? 'ok' : 'degraded', db, uptime: process.uptime(), timestamp: new Date().toISOString() },
    message: 'Estado del servicio',
  });
});

import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';

const app = createApp();

// Render (y otros PaaS) inyectan el puerto en process.env.PORT.
const PORT = process.env.PORT || env.API_PORT;

const server = app.listen(PORT, () => {
  console.log(`[api] BosqueSur ES3 escuchando en el puerto ${PORT} (ruta base /api)`);
  console.log(`[api] Entorno: ${env.NODE_ENV}`);
});

async function shutdown(signal) {
  console.log(`\n[api] ${signal} recibido, cerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

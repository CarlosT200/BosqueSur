import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.js';

// Fabrica de la aplicacion Express. Se usa tanto en server.js como en las pruebas.
export function createApp() {
  const app = express();

  // Detras de proxy (Render), para obtener la IP real y el rate limit.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error('Origen no permitido por CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

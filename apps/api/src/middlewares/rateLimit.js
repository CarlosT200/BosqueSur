import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Limita los intentos de inicio de sesion para mitigar fuerza bruta.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isTest ? 1000 : env.LOGIN_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Demasiados intentos de inicio de sesion. Intente nuevamente mas tarde.',
        details: [],
      },
    }),
});

import { Router } from 'express';
import { loginLimiter } from '../../middlewares/rateLimit.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema } from './auth.validators.js';
import * as controller from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate(loginSchema), controller.login);
authRouter.get('/me', authenticate, controller.me);

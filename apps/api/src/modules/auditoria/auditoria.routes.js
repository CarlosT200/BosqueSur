import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as controller from './auditoria.controller.js';

export const auditoriaRouter = Router();

auditoriaRouter.use(authenticate);
auditoriaRouter.get('/', authorize('ADMIN'), controller.list);

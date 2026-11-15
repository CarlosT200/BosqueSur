import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as controller from './recepciones.controller.js';

export const recepcionesRouter = Router();

recepcionesRouter.use(authenticate);
recepcionesRouter.get('/', authorize('ADMIN', 'BODEGA', 'GERENCIA'), controller.list);

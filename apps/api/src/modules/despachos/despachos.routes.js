import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { listDespachosQuery, recepcionSchema } from './despachos.validators.js';
import * as controller from './despachos.controller.js';

export const despachosRouter = Router();

despachosRouter.use(authenticate);
despachosRouter.get('/', authorize('ADMIN', 'BODEGA', 'GERENCIA'), validate(listDespachosQuery, 'query'), controller.list);
despachosRouter.get('/:id', authorize('ADMIN', 'BODEGA', 'GERENCIA'), controller.getById);
despachosRouter.post('/:id/recepcion', authorize('ADMIN', 'BODEGA'), validate(recepcionSchema), controller.registrarRecepcion);

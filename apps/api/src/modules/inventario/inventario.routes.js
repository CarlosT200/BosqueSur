import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as controller from './inventario.controller.js';

export const inventarioRouter = Router();

inventarioRouter.use(authenticate);
inventarioRouter.get('/', authorize('ADMIN', 'BODEGA', 'GERENCIA'), controller.listItems);
inventarioRouter.get('/movimientos', authorize('ADMIN', 'BODEGA', 'GERENCIA'), controller.listMovimientos);

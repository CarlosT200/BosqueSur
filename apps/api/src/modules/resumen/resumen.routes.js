import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as controller from './resumen.controller.js';

export const resumenRouter = Router();

resumenRouter.use(authenticate);
resumenRouter.get('/', authorize('ADMIN', 'BODEGA', 'GERENCIA'), controller.get);

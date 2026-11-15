import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createCosechaSchema, listCosechasQuery } from './cosechas.validators.js';
import * as controller from './cosechas.controller.js';

export const cosechasRouter = Router();

cosechasRouter.use(authenticate);
cosechasRouter.get('/', authorize('ADMIN', 'TERRENO'), validate(listCosechasQuery, 'query'), controller.list);
cosechasRouter.get('/:id', authorize('ADMIN', 'TERRENO'), controller.getById);
cosechasRouter.post('/', authorize('ADMIN', 'TERRENO'), validate(createCosechaSchema), controller.create);

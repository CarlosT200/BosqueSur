import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createPredioSchema } from './predios.validators.js';
import * as controller from './predios.controller.js';

export const prediosRouter = Router();

prediosRouter.use(authenticate);
prediosRouter.get('/', authorize('ADMIN', 'TERRENO'), controller.list);
prediosRouter.post('/', authorize('ADMIN', 'TERRENO'), validate(createPredioSchema), controller.create);

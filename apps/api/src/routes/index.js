import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { prediosRouter } from '../modules/predios/predios.routes.js';
import { cosechasRouter } from '../modules/cosechas/cosechas.routes.js';
import { despachosRouter } from '../modules/despachos/despachos.routes.js';
import { recepcionesRouter } from '../modules/recepciones/recepciones.routes.js';
import { inventarioRouter } from '../modules/inventario/inventario.routes.js';
import { auditoriaRouter } from '../modules/auditoria/auditoria.routes.js';
import { resumenRouter } from '../modules/resumen/resumen.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/predios', prediosRouter);
router.use('/cosechas', cosechasRouter);
router.use('/despachos', despachosRouter);
router.use('/recepciones', recepcionesRouter);
router.use('/inventario', inventarioRouter);
router.use('/auditoria', auditoriaRouter);
router.use('/resumen', resumenRouter);

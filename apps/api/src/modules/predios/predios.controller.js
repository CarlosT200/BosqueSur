import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './predios.service.js';

export const list = asyncHandler(async (_req, res) => {
  const predios = await service.listPredios();
  return sendSuccess(res, { predios }, 'Predios obtenidos');
});

export const create = asyncHandler(async (req, res) => {
  const predio = await service.createPredio(req.body, req.user, req.ip);
  return sendSuccess(res, { predio }, 'Predio creado correctamente', 201);
});

import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './cosechas.service.js';

export const list = asyncHandler(async (req, res) => {
  const cosechas = await service.listCosechas(req.query);
  return sendSuccess(res, { cosechas }, 'Cosechas obtenidas');
});

export const getById = asyncHandler(async (req, res) => {
  const cosecha = await service.getCosecha(req.params.id);
  return sendSuccess(res, { cosecha }, 'Cosecha obtenida');
});

export const create = asyncHandler(async (req, res) => {
  const cosecha = await service.createCosecha(req.body, req.user, req.ip);
  return sendSuccess(res, { cosecha }, 'Cosecha registrada correctamente', 201);
});

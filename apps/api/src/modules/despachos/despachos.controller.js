import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './despachos.service.js';

export const list = asyncHandler(async (req, res) => {
  const despachos = await service.listDespachos(req.query);
  return sendSuccess(res, { despachos }, 'Despachos obtenidos');
});

export const getById = asyncHandler(async (req, res) => {
  const despacho = await service.getDespacho(req.params.id);
  return sendSuccess(res, { despacho }, 'Despacho obtenido');
});

export const registrarRecepcion = asyncHandler(async (req, res) => {
  const resultado = await service.registrarRecepcion(req.params.id, req.body, req.user, req.ip);
  return sendSuccess(res, resultado, 'Recepcion registrada e inventario actualizado', 201);
});

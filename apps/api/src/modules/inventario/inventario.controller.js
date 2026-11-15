import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './inventario.service.js';

export const listItems = asyncHandler(async (_req, res) => {
  const inventario = await service.listInventario();
  return sendSuccess(res, { inventario }, 'Inventario obtenido');
});

export const listMovimientos = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const movimientos = await service.listMovimientos(limit);
  return sendSuccess(res, { movimientos }, 'Movimientos obtenidos');
});

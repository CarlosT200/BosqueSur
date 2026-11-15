import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './resumen.service.js';

export const get = asyncHandler(async (_req, res) => {
  const resumen = await service.getResumen();
  return sendSuccess(res, { resumen }, 'Resumen obtenido');
});

import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './recepciones.service.js';

export const list = asyncHandler(async (_req, res) => {
  const recepciones = await service.listRecepciones();
  return sendSuccess(res, { recepciones }, 'Recepciones obtenidas');
});

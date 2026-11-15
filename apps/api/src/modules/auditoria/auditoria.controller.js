import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './auditoria.service.js';

export const list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const auditoria = await service.listAuditoria(limit);
  return sendSuccess(res, { auditoria }, 'Auditoria obtenida');
});

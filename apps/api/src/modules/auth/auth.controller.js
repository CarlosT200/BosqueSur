import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/httpResponse.js';
import * as service from './auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await service.login({ email, password, ip: req.ip });
  return sendSuccess(res, result, 'Inicio de sesion correcto');
});

export const me = asyncHandler(async (req, res) => {
  const user = await service.getProfile(req.user.id);
  return sendSuccess(res, { user }, 'Perfil obtenido');
});

// Estructura de respuesta JSON consistente para toda la API.
export function sendSuccess(res, data = null, message = 'Operacion realizada correctamente', status = 200) {
  return res.status(status).json({ success: true, data, message });
}

export function sendError(res, status, code, message, details = []) {
  return res.status(status).json({ success: false, error: { code, message, details } });
}

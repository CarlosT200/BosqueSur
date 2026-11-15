const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'bosquesur_token';

export class ApiError extends Error {
  constructor(message, code, status, details = []) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = tokenStore.get();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifique su conexion o la URL de la API.', 'NETWORK', 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(err.message ?? 'Ocurrio un error', err.code ?? 'ERROR', res.status, err.details ?? []);
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),
  // Predios / Cosechas
  getPredios: () => request('/predios'),
  getCosechas: () => request('/cosechas'),
  // Despachos / Recepciones
  getDespachos: (estado) => request(`/despachos${estado ? `?estado=${estado}` : ''}`),
  getDespacho: (id) => request(`/despachos/${id}`),
  registrarRecepcion: (id, payload) => request(`/despachos/${id}/recepcion`, { method: 'POST', body: payload }),
  getRecepciones: () => request('/recepciones'),
  // Inventario
  getInventario: () => request('/inventario'),
  getMovimientos: (limit = 50) => request(`/inventario/movimientos?limit=${limit}`),
  // Resumen / Auditoria
  getResumen: () => request('/resumen'),
  getAuditoria: (limit = 100) => request(`/auditoria?limit=${limit}`),
};

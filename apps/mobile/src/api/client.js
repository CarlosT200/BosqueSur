import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config.js';

const TOKEN_KEY = 'bosquesur_token';

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (t) => SecureStore.setItemAsync(TOKEN_KEY, t),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = await tokenStore.get();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revise la red y la URL de la API (debe ser la IP local del computador).',
      'NETWORK',
      0,
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(err.message ?? 'Ocurrio un error', err.code ?? 'ERROR', res.status);
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),
  getPredios: () => request('/predios'),
  createPredio: (payload) => request('/predios', { method: 'POST', body: payload }),
  getCosechas: () => request('/cosechas'),
  getCosecha: (id) => request(`/cosechas/${id}`),
  createCosecha: (payload) => request('/cosechas', { method: 'POST', body: payload }),
};

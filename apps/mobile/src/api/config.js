import Constants from 'expo-constants';

// Fuente UNICA de la URL de la API.
// 1) Variable de entorno EXPO_PUBLIC_API_URL (recomendado, archivo .env).
// 2) Valor de respaldo en app.json -> expo.extra.apiUrl.
const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = Constants.expoConfig?.extra?.apiUrl;

export const API_URL = fromEnv || fromExtra || 'http://localhost:4000/api';

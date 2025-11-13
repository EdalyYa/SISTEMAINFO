import axios from 'axios';

// Normaliza la base del API eliminando espacios extra y slashes finales
const sanitizeBase = (value) => {
  const raw = typeof value === 'string' ? value : '';
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Quitar slashes finales para evitar "//" al concatenar rutas
  return trimmed.replace(/\/+$/, '');
};

// Determinar base del API con fallback por entorno
const envBase = sanitizeBase(import.meta.env.VITE_API_BASE_URL);

// Si estamos en desarrollo y la app corre en localhost, forzar backend local
const isDev = !!import.meta.env.DEV;
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

// Producción: por defecto usar el backend oficial en Render
// Puedes sobrescribirlo con la env `VITE_API_BASE_URL`
export const API_BASE = (isDev && isLocalhost)
  ? 'http://localhost:4001/api'
  : (envBase || 'https://sistemainfo.onrender.com/api');

// Base del host (sin /api) para endpoints de administración y archivos
export const API_HOST = (API_BASE || '').replace(/\/?api\/?$/, '');
export const ASSET_BASE = API_HOST;

const api = axios.create({
  baseURL: sanitizeBase(API_BASE) || API_BASE,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = (typeof window !== 'undefined' && window.sessionStorage.getItem('token')) || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si el cuerpo es FormData, permitir que axios establezca el boundary automáticamente
    if (config.data instanceof FormData) {
      if (config.headers && 'Content-Type' in config.headers) {
        delete config.headers['Content-Type'];
      }
    } else {
      // Asegurar JSON en peticiones normales
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpiar ambas ubicaciones de almacenamiento
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('token');
        }
      } catch (_) {}
      localStorage.removeItem('token');
      window.location.href = '/panel/login';
    }
    return Promise.reject(error);
  }
);

export default api;

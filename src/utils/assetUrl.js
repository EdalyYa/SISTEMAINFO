import { API_BASE } from '../config/api';

// Base del backend para servir activos (imágenes/uploads)
const ASSET_BASE = String(API_BASE || '').replace('/api', '');

/**
 * Normaliza rutas de activos para producción y desarrollo.
 * - Respeta URLs absolutas (http/https)
 * - Reescribe `/uploads/...` y `/src/Imagenes/...` hacia el backend
 * - Asegura que las rutas relativas tengan prefijo `/`
 */
export function resolveAssetUrl(path) {
  if (!path || typeof path !== 'string') return path;
  const p = String(path);
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  const fixed = p.startsWith('/') ? p : `/${p}`;
  if (fixed.startsWith('/uploads') || fixed.startsWith('/src/Imagenes')) {
    return `${ASSET_BASE}${fixed}`;
  }
  return fixed;
}


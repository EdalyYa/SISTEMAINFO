# Despliegue del Backend en Render

Este backend (Node/Express) está listo para desplegarse en Render conectado a tu repositorio de GitHub.

## Requisitos
- Repositorio de GitHub con el backend (público o privado).
- Cuenta en Render (https://render.com) con acceso a GitHub.
- Tu `NEWS_API_KEY` de NewsAPI (opcional para noticias reales).

## Pasos en Render
1. Conecta tu cuenta de Render a GitHub.
2. Crea un nuevo servicio Web:
   - "New +" → "Web Service" → selecciona tu repo del backend.
   - Branch: `main`.
   - Root Directory: la raíz del repo (donde está `package.json`).
   - Build Command: `npm install`.
   - Start Command: `node index.js` (o `npm start`).
   - Environment: `Node`.
   - Región: la más cercana a tus usuarios.
3. Variables de entorno (Environment):
   - `NEWS_API_KEY`: tu clave de NewsAPI (sin comillas).
   - `CORS_ORIGINS`: dominios del frontend separados por coma.
     - Ejemplo: `https://tu-frontend.vercel.app, https://www.tudominio.com`.
   - Base de datos (si usas MySQL gestionado):
     - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CONN_LIMIT`.
     - Si tu proveedor exige TLS (ej. PlanetScale):
       - `DB_SSL=true`
       - `DB_SSL_REJECT_UNAUTHORIZED=false`
    - Modo sin DB (rápido, sin cuentas):
      - `DB_DISABLE=true` para evitar conexiones y devolver resultados vacíos en endpoints que consultan DB.
      - Útil para validar UI/API sin datos ni proveedor de base.
4. Deploy. Render asignará una URL, por ejemplo: `https://infouna-backend.onrender.com`.

## Salud del servicio
- Health check: `/api/news` (configurado en `render.yaml`).
- Si no configuraste `NEWS_API_KEY`, el endpoint devuelve noticias de respaldo (fallback) para no romper el UI.

## CORS
- El backend permite orígenes de desarrollo (`localhost:5173/5181/5182`).
- En producción, configura `CORS_ORIGINS` para permitir únicamente tus dominios.

## Base de datos gestionada (PlanetScale/Railway)
1. Crea una base MySQL gestionada:
   - PlanetScale (recomendado para pruebas): plan Hobby gratuito.
   - Railway: crea recurso MySQL y copia variables desde "Connect".
2. Obtén las credenciales desde el panel del proveedor:
   - `DB_HOST` (endpoint/host), `DB_USER` (username), `DB_PASSWORD` (password), `DB_NAME` (database).
   - En PlanetScale, usa además `DB_SSL=true` y `DB_SSL_REJECT_UNAUTHORIZED=false`.
3. Configura esas variables en Render y guarda.
4. Importa el esquema de tablas en la base gestionada:
   - Usa un cliente (MySQL Workbench/HeidiSQL/TablePlus) y ejecuta `backend/schema_complete.sql` sobre tu base.
   - O por CLI (ajusta según tu proveedor):
     - `mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < backend/schema_complete.sql`
5. Redepliega el backend en Render.
6. Verifica endpoints:
   - `https://<tu-render-domain>/api/news` → 200 OK.
   - `https://<tu-render-domain>/api/modal-promocional` → `[]` si no hay datos; lista si hay registros.
   - Si ves `500`, revisa credenciales/tables/TLS y logs.

## Frontend (Vercel)
- En tu proyecto de Vercel, añade la variable:
  - `VITE_API_BASE_URL`: `https://infouna-backend.onrender.com/api`.
- Vuelve a desplegar el frontend.

## Verificación rápida
- Backend: visita `https://<tu-render-domain>/api/news?limit=6`.
- Frontend: abre tu sitio y verifica que la sección de noticias cargue.

## Blueprint opcional
- Se incluye `backend/render.yaml` para despliegues por Blueprint. Render puede leerlo desde el repo.

## Notas
- Render usa `PORT` automáticamente; el backend ya lo soporta.
- La conexión MySQL es opcional. Si no tienes DB en producción, los endpoints que dependan de ella no funcionarán, pero `/api/news` y los estáticos sí.

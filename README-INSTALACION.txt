# Guía rápida para poner en marcha el sistema INFOUNA

## 1. Requisitos previos
- Tener Node.js y npm instalados
- Tener MySQL instalado y corriendo
- Tener Laragon (opcional, recomendado para Windows)

## 2. Configuración de la base de datos
1. Abre MySQL y crea la base de datos `infouna`.
2. Ejecuta los scripts `schema.sql` y `schema_extended.sql` ubicados en `backend/` para crear las tablas necesarias.

## 3. Backend (API)
1. Abre una terminal y navega a la carpeta del backend:
   ```powershell
   cd C:\laragon\www\SISTEMAINFO\backend
   ```
2. Instala las dependencias:
   ```powershell
   npm install
   ```
3. Inicia el backend:
   ```powershell
   npm run dev
   ```
   El backend debe iniciar en http://localhost:4001

## 4. Frontend (Panel/Admin y Web)
1. Abre otra terminal y navega a la carpeta del frontend (admin-panel):
   ```powershell
   cd C:\laragon\www\SISTEMAINFO\admin-panel
   ```
2. Instala las dependencias:
   ```powershell
   npm install
   ```
3. Inicia el frontend:
   ```powershell
   npm run dev
   ```
   El frontend estará disponible en http://localhost:5173 (o el puerto que indique la terminal)

## 5. Acceso al sistema
- Usuario admin: `infoadmin`
- Contraseña: `infouna2025`

## 6. Notas adicionales
- Si algún puerto está ocupado, cambia el puerto en el archivo correspondiente (`backend/index.js` para el backend, o configura Vite para el frontend).
- Si tienes problemas de conexión a la base de datos, revisa las credenciales en los archivos de configuración del backend.
- Para cambiar la URL del backend, edita `admin-panel/src/utils/config.js`.

---

¡Listo! Así puedes poner en marcha y administrar el sistema INFOUNA.

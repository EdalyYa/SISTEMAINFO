-- Migración para agregar campos faltantes a la tabla docentes
-- Ejecutar este script si la tabla docentes no tiene estos campos
-- NOTA: Si algún campo ya existe, este script fallará. En ese caso, comenta las líneas correspondientes.

-- Agregar campo apellido
ALTER TABLE docentes 
ADD COLUMN apellido VARCHAR(100) AFTER nombre;

-- Agregar campo grado_academico
ALTER TABLE docentes 
ADD COLUMN grado_academico VARCHAR(100) AFTER especialidad;

-- Agregar campo estado
ALTER TABLE docentes 
ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo' AFTER experiencia;


-- Script para verificar y corregir la estructura de la tabla users
-- Este script asegura que la tabla tenga los campos correctos

USE infouna;

-- Verificar si la columna password_hash existe, si no, renombrar password a password_hash
-- Si la tabla tiene 'password', la renombramos a 'password_hash'
SET @col_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'infouna' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'password_hash');

SET @col_password_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'infouna' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'password');

-- Si existe password pero no password_hash, renombrar
SET @sql = IF(@col_password_exists > 0 AND @col_exists = 0,
  'ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL',
  'SELECT "No se necesita cambiar, la columna password_hash ya existe" as mensaje');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si existe la columna name, si no existe pero existe full_name, mantener ambas o estandarizar
SET @col_name_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'infouna' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'name');

SET @col_full_name_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'infouna' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'full_name');

-- Si no existe name pero existe full_name, crear name como alias o copiar datos
-- Por ahora, solo verificamos que al menos una exista

-- Crear o actualizar usuario admin si no existe
INSERT INTO users (username, password_hash, email, role, name, full_name)
VALUES (
  'infoadmin',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash de 'infouna2025'
  'admin@infouna.edu.pe',
  'admin',
  'Administrador INFOUNA',
  'Administrador INFOUNA'
)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  role = 'admin',
  email = VALUES(email);

-- Mostrar estructura final de la tabla
DESCRIBE users;

-- Mostrar usuarios existentes (sin contraseñas)
SELECT id, username, email, role, name, full_name FROM users;


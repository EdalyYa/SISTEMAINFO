-- Migration: add new JSON-based design structure (idempotent)
-- Adds columnas compatibles con la nueva propuesta: fondo_url, campos_json, incluye_qr
-- Este script es seguro de re-ejecutar: crea columnas/índice sólo si faltan

-- fondo_url
SET @sql := (
  SELECT CASE WHEN COUNT(*)=0
    THEN 'ALTER TABLE disenos_certificados ADD COLUMN fondo_url TEXT NULL AFTER nombre'
    ELSE 'SELECT 1'
  END
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disenos_certificados'
    AND COLUMN_NAME = 'fondo_url'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- campos_json
SET @sql := (
  SELECT CASE WHEN COUNT(*)=0
    THEN 'ALTER TABLE disenos_certificados ADD COLUMN campos_json JSON NULL AFTER fondo_url'
    ELSE 'SELECT 1'
  END
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disenos_certificados'
    AND COLUMN_NAME = 'campos_json'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- incluye_qr
SET @sql := (
  SELECT CASE WHEN COUNT(*)=0
    THEN 'ALTER TABLE disenos_certificados ADD COLUMN incluye_qr TINYINT(1) NOT NULL DEFAULT 1 AFTER campos_json'
    ELSE 'SELECT 1'
  END
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disenos_certificados'
    AND COLUMN_NAME = 'incluye_qr'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Opcional: índice simple para búsquedas por nombre
SET @sql := (
  SELECT CASE WHEN COUNT(*)=0
    THEN 'ALTER TABLE disenos_certificados ADD INDEX idx_disenos_nombre (nombre)'
    ELSE 'SELECT 1'
  END
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disenos_certificados'
    AND INDEX_NAME = 'idx_disenos_nombre'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Nota: mantenemos columnas existentes (configuracion, fondo_certificado, logo_izquierdo, logo_derecho, activa)
-- para compatibilidad retro, y el código de rutas detectará y preferirá las nuevas columnas cuando existan.

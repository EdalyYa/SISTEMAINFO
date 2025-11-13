-- Idempotent migration to drop deprecated logo columns from disenos_certificados
-- Safely removes `logo_izquierdo` and `logo_derecho` if they exist.

DELIMITER $$

-- Drop logo_izquierdo if present
CREATE PROCEDURE IF NOT EXISTS drop_logo_izquierdo()
BEGIN
  IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'disenos_certificados'
      AND COLUMN_NAME = 'logo_izquierdo'
  ) THEN
    SET @sql := 'ALTER TABLE disenos_certificados DROP COLUMN logo_izquierdo';
    PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END IF;
END $$

-- Drop logo_derecho if present
CREATE PROCEDURE IF NOT EXISTS drop_logo_derecho()
BEGIN
  IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'disenos_certificados'
      AND COLUMN_NAME = 'logo_derecho'
  ) THEN
    SET @sql := 'ALTER TABLE disenos_certificados DROP COLUMN logo_derecho';
    PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END IF;
END $$

DELIMITER ;

-- Execute procedures (safe to run repeatedly)
CALL drop_logo_izquierdo();
CALL drop_logo_derecho();

-- Optionally drop procedures after execution (no-op if they didn't exist)
DROP PROCEDURE IF EXISTS drop_logo_izquierdo;
DROP PROCEDURE IF EXISTS drop_logo_derecho;


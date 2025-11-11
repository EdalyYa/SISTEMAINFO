-- Migration: add optional image and module relation to cursos
-- Safe, idempotent migration using information_schema checks

START TRANSACTION;

-- Add modulo_id column if missing
SET @has_modulo := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cursos' AND COLUMN_NAME = 'modulo_id'
);
SET @sql_add_modulo := IF(@has_modulo = 0,
  'ALTER TABLE cursos ADD COLUMN modulo_id INT NULL AFTER programa_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql_add_modulo; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add imagen column if missing
SET @has_imagen := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cursos' AND COLUMN_NAME = 'imagen'
);
SET @sql_add_imagen := IF(@has_imagen = 0,
  'ALTER TABLE cursos ADD COLUMN imagen VARCHAR(255) NULL AFTER estado',
  'SELECT 1'
);
PREPARE stmt2 FROM @sql_add_imagen; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Add foreign key to modulos if missing
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'cursos' AND CONSTRAINT_NAME = 'fk_cursos_modulo'
);
SET @sql_add_fk := IF(@has_fk = 0,
  'ALTER TABLE cursos ADD CONSTRAINT fk_cursos_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt3 FROM @sql_add_fk; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

COMMIT;

-- To rollback manually (if needed):
-- ALTER TABLE cursos DROP FOREIGN KEY fk_cursos_modulo;
-- ALTER TABLE cursos DROP COLUMN modulo_id;
-- ALTER TABLE cursos DROP COLUMN imagen;

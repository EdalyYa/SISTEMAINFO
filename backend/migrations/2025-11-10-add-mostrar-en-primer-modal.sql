-- Migration: add `mostrar_en_primer_modal` to `modal_promocional`
-- Safe, idempotent pattern using information_schema to avoid duplicate column errors

-- Run this on your MySQL database (e.g., Railway, PlanetScale, etc.)
-- Examples:
--   mysql -h <host> -P <port> -u <user> -p <db_name> < backend/migrations/2025-11-10-add-mostrar-en-primer-modal.sql
--   SOURCE backend/migrations/2025-11-10-add-mostrar-en-primer-modal.sql;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'modal_promocional'
    AND COLUMN_NAME = 'mostrar_en_primer_modal'
);

-- Only add the column if it does not exist
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE modal_promocional ADD COLUMN mostrar_en_primer_modal BOOLEAN DEFAULT false AFTER orden;',
  'SELECT "Column mostrar_en_primer_modal already exists" as info;'
);

PREPARE add_col FROM @stmt;
EXECUTE add_col;
DEALLOCATE PREPARE add_col;


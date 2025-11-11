-- Agregar 'video' al ENUM de la columna tipo en modal_promocional
ALTER TABLE modal_promocional 
  MODIFY COLUMN tipo ENUM('descuento', 'nuevo', 'gratis', 'cronograma', 'flyer', 'video') NOT NULL DEFAULT 'nuevo';

-- Nota: Ejecutar esta migración en la BD en uso (infouna)
-- Ejemplo PowerShell:
-- mysql -u root -p infouna < backend/database/migrations/alter_modal_promocional_add_video_enum.sql

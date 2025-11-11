-- Agrega la columna video_tiktok_url si no existe
-- Ejecutar en la base de datos en uso

ALTER TABLE modal_promocional
  ADD COLUMN IF NOT EXISTS video_tiktok_url VARCHAR(500) NULL AFTER imagen;


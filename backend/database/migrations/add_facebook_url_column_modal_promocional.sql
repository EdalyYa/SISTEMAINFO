-- Agrega la columna facebook_url para separar la URL de Facebook de la de TikTok
-- Ejecutar en la misma base de datos donde existe la tabla modal_promocional

ALTER TABLE modal_promocional
  ADD COLUMN facebook_url VARCHAR(500) NULL AFTER video_tiktok_url;


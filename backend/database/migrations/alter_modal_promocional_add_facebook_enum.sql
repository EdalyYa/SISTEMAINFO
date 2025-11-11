-- Agregar 'facebook' al ENUM de la columna tipo en modal_promocional
ALTER TABLE modal_promocional 
  MODIFY COLUMN tipo ENUM('descuento', 'nuevo', 'gratis', 'cronograma', 'flyer', 'video', 'facebook') NOT NULL DEFAULT 'nuevo';

-- Nota: Ejecutar esta migración en la BD en uso (infouna)
-- Ejemplos PowerShell:
-- mysql -u root -p infouna < backend/database/migrations/alter_modal_promocional_add_facebook_enum.sql
-- o:
-- mysql -u root -p
-- > USE infouna;
-- > SOURCE backend/database/migrations/alter_modal_promocional_add_facebook_enum.sql;

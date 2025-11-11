-- Ampliar ENUM de la columna tipo en modal_promocional para incluir 'avisos' y 'noticias'
ALTER TABLE modal_promocional 
  MODIFY COLUMN tipo ENUM('descuento', 'nuevo', 'gratis', 'cronograma', 'flyer', 'video', 'facebook', 'avisos', 'noticias') NOT NULL DEFAULT 'avisos';

-- Ejemplos PowerShell (Windows):
-- mysql -u root -p infouna < backend/database/migrations/alter_modal_promocional_add_avisos_noticias_enum.sql
-- o:
-- mysql -u root -p
-- > USE infouna;
-- > SOURCE backend/database/migrations/alter_modal_promocional_add_avisos_noticias_enum.sql;

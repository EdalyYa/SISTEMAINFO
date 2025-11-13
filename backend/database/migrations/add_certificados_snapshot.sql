-- Añade columnas para almacenar un snapshot de la configuración usada al emitir certificados
ALTER TABLE certificados
  ADD COLUMN diseno_id INT NULL COMMENT 'ID del diseño usado al emitir',
  ADD COLUMN config_usada JSON NULL COMMENT 'Snapshot de configuración usada (elementos, colores, posiciones, etc.)',
  ADD COLUMN fondo_usado VARCHAR(255) NULL COMMENT 'Archivo de fondo usado al emitir',
  ADD COLUMN logo_izquierdo_usado VARCHAR(255) NULL COMMENT 'Archivo de logo izquierdo usado',
  ADD COLUMN logo_derecho_usado VARCHAR(255) NULL COMMENT 'Archivo de logo derecho usado';

-- Índice auxiliar para consultas por diseño
CREATE INDEX IF NOT EXISTS idx_certificados_diseno_id ON certificados(diseno_id);

-- Nota: aplicar en el esquema activo (DATABASE())

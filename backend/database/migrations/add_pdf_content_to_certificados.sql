-- Migración para agregar campo pdf_content a la tabla certificados
-- Fecha: 2024-12-15
-- Propósito: Almacenar el contenido del PDF directamente en la base de datos

USE infouna;

-- Agregar campo para almacenar el PDF como LONGBLOB
ALTER TABLE certificados 
ADD COLUMN pdf_content LONGBLOB NULL COMMENT 'Contenido del PDF del certificado almacenado como binario';

-- Agregar índice para optimizar consultas
CREATE INDEX idx_certificados_pdf ON certificados(id, pdf_content(1));

-- Comentario sobre el nuevo campo
ALTER TABLE certificados 
MODIFY COLUMN pdf_content LONGBLOB NULL COMMENT 'Contenido binario del PDF generado para el certificado';

SELECT 'Migración completada: Campo pdf_content agregado a la tabla certificados' as mensaje;
-- Agregar relación opcional de cursos → módulos
USE infouna;

ALTER TABLE cursos
  ADD COLUMN modulo_id INT NULL AFTER programa_id;

ALTER TABLE cursos
  ADD CONSTRAINT fk_cursos_modulo
  FOREIGN KEY (modulo_id) REFERENCES modulos(id)
  ON DELETE SET NULL;

CREATE INDEX idx_cursos_modulo ON cursos(modulo_id);
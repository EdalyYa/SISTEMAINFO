USE infouna;

CREATE TABLE IF NOT EXISTS modulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programa_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  numero VARCHAR(10),
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

CREATE INDEX idx_modulos_programa ON modulos(programa_id);
CREATE INDEX idx_modulos_estado ON modulos(estado);
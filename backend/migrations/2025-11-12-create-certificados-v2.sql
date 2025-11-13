-- Crear tablas para el sistema de certificados V2

CREATE TABLE IF NOT EXISTS cert_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  fondo_url VARCHAR(512) NULL,
  config_json JSON NULL,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificados_v2 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  dni VARCHAR(16) NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  rol VARCHAR(64) NULL,
  nombre_evento VARCHAR(255) NOT NULL,
  descripcion_evento TEXT NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  horas_academicas INT NULL,
  codigo_verificacion VARCHAR(32) UNIQUE NOT NULL,
  pdf_content MEDIUMBLOB NULL,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES cert_templates(id)
);


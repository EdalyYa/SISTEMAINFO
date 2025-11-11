-- Tabla para almacenar las cifras de logros de INFOUNA
CREATE TABLE IF NOT EXISTS cifras_logros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL COMMENT 'Etiqueta descriptiva del logro',
    valor VARCHAR(50) NOT NULL COMMENT 'Valor numérico del logro (ej: 2000+, 15+)',
    orden INT DEFAULT 0 COMMENT 'Orden de visualización',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Si la cifra está activa para mostrar',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos iniciales
INSERT INTO cifras_logros (label, valor, orden, activo) VALUES
('Estudiantes Certificados', '2000+', 1, TRUE),
('Programas Especializados', '15+', 2, TRUE),
('Docentes Calificados', '30+', 3, TRUE),
('Años Formando Profesionales', '15+', 4, TRUE),
('Laboratorios Modernos', '8', 5, TRUE),
('Convenios Empresariales', '25+', 6, TRUE);
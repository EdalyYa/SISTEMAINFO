-- Tabla para almacenar configuraciones de diseño de certificados
CREATE TABLE IF NOT EXISTS disenos_certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre descriptivo de la configuración',
    configuracion JSON NOT NULL COMMENT 'Configuración de diseño en formato JSON',
    logo_izquierdo VARCHAR(255) NULL COMMENT 'Nombre del archivo del logo izquierdo',
    logo_derecho VARCHAR(255) NULL COMMENT 'Nombre del archivo del logo derecho',
    fondo_certificado VARCHAR(255) NULL COMMENT 'Nombre del archivo de fondo del certificado',
    activa BOOLEAN DEFAULT FALSE COMMENT 'Indica si esta configuración está activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_activa (activa),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones de diseño para certificados';

-- Insertar configuración por defecto
INSERT INTO disenos_certificados (nombre, configuracion, activa) VALUES (
    'Configuración por defecto',
    JSON_OBJECT(
        'colorFondo', '#4A90E2',
        'colorTexto', '#000000',
        'fuenteTitulo', 'Arial',
        'tamanoTitulo', 24,
        'fuenteTexto', 'Arial',
        'tamanoTexto', 14,
        'posicionLogoIzq', JSON_OBJECT('x', 50, 'y', 50),
        'posicionLogoDer', JSON_OBJECT('x', 550, 'y', 50),
        'tamanoLogos', JSON_OBJECT('width', 80, 'height', 80)
    ),
    TRUE
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
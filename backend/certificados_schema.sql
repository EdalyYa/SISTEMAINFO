-- Crear tabla de certificados
CREATE TABLE IF NOT EXISTS certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    tipo_certificado VARCHAR(100) NOT NULL,
    nombre_evento VARCHAR(255) NOT NULL,
    descripcion_evento TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horas_academicas INT NOT NULL,
    fecha_emision DATE NOT NULL,
    plantilla_certificado VARCHAR(255) NOT NULL,
    codigo_verificacion VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para búsquedas rápidas
    INDEX idx_dni_activo (dni, activo),
    INDEX idx_codigo_verificacion (codigo_verificacion),
    INDEX idx_fecha_emision (fecha_emision)
);

-- Insertar algunos datos de ejemplo
INSERT INTO certificados (
    dni, nombre_completo, tipo_certificado, nombre_evento, descripcion_evento,
    fecha_inicio, fecha_fin, horas_academicas, fecha_emision, plantilla_certificado,
    codigo_verificacion, activo
) VALUES 
(
    '12345678',
    'Juan Carlos Pérez Mamani',
    'Seminario',
    'Perspectivas para el Desarrollo Regional - Puno al 2030',
    'Seminario organizado por la Unidad de Posgrado de la Facultad de Ingeniería Económica',
    '2024-08-23',
    '2024-08-25',
    41,
    '2024-10-02',
    'seminario-desarrollo.svg',
    'CERT-ABC12345-2024',
    TRUE
),
(
    '87654321',
    'María Elena Quispe Condori',
    'Curso',
    'Inteligencia Artificial Aplicada a los Negocios',
    'Curso de capacitación en IA para profesionales',
    '2024-09-15',
    '2024-09-20',
    30,
    '2024-09-25',
    'seminario-desarrollo.svg',
    'CERT-XYZ67890-2024',
    TRUE
),
(
    '11223344',
    'Carlos Alberto Mamani Choque',
    'Taller',
    'Gestión de Proyectos con Metodologías Ágiles',
    'Taller práctico sobre metodologías ágiles',
    '2024-10-01',
    '2024-10-03',
    24,
    '2024-10-05',
    'seminario-desarrollo.svg',
    'CERT-DEF11223-2024',
    TRUE
);

-- Verificar que los datos se insertaron correctamente
SELECT * FROM certificados WHERE activo = TRUE ORDER BY fecha_emision DESC;
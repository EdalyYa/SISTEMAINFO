+*-- Crear tabla de certificados
CREATE TABLE IF NOT EXISTS certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    tipo_certificado ENUM('Seminario', 'Curso', 'Taller', 'Conferencia', 'Diplomado', 'Capacitación') NOT NULL,
    nombre_evento VARCHAR(500) NOT NULL,
    descripcion_evento TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horas_academicas INT NOT NULL,
    codigo_verificacion VARCHAR(12) UNIQUE NOT NULL,
    plantilla_certificado VARCHAR(255) DEFAULT 'seminario-desarrollo.svg',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_dni (dni),
    INDEX idx_codigo_verificacion (codigo_verificacion),
    INDEX idx_fecha_emision (fecha_emision),
    INDEX idx_activo (activo)
);

-- Insertar algunos certificados de ejemplo
INSERT INTO certificados (
    dni, 
    nombre_completo, 
    tipo_certificado, 
    nombre_evento, 
    descripcion_evento,
    fecha_inicio, 
    fecha_fin, 
    horas_academicas, 
    codigo_verificacion
) VALUES 
(
    '12345678', 
    'Juan Carlos Pérez Mamani', 
    'Seminario', 
    'Perspectivas para el Desarrollo Regional - Puno al 2030', 
    'Seminario enfocado en el desarrollo regional y las perspectivas de crecimiento para la región de Puno hacia el año 2030.',
    '2024-08-23', 
    '2024-08-25', 
    41, 
    'ABC123DEF456'
),
(
    '87654321', 
    'María Elena Quispe Condori', 
    'Curso', 
    'Gestión de Proyectos de Desarrollo Sostenible', 
     'Curso especializado en metodologías para la gestión efectiva de proyectos orientados al desarrollo sostenible.',
    '2024-09-10', 
    '2024-09-15', 
    30, 
    'XYZ789GHI012'
),
(
    '11223344', 
    'Carlos Alberto Mamani Choque', 
    'Taller', 
    'Innovación Tecnológica en la Educación Superior', 
     'Taller práctico sobre la implementación de tecnologías innovadoras en el ámbito educativo universitario.',
    '2024-10-01', 
    '2024-10-03', 
    25, 
    'DEF456JKL789'
),
(
    '55667788', 
    'Ana Lucía Flores Huanca', 
    'Conferencia', 
    'Liderazgo Femenino en la Ingeniería Económica', 
     'Conferencia magistral sobre el papel de la mujer en el liderazgo dentro del campo de la ingeniería económica.',
    '2024-11-05', 
    '2024-11-05', 
    8, 
    'GHI789MNO123'
);

-- Crear vista para consultas frecuentes
CREATE OR REPLACE VIEW vista_certificados AS
SELECT 
    c.id,
    c.dni,
    c.nombre_completo,
    c.tipo_certificado,
    c.nombre_evento,
    c.descripcion_evento,
    c.fecha_inicio,
    c.fecha_fin,
    c.horas_academicas,
    c.codigo_verificacion,
    c.fecha_emision,
    c.activo,
    CONCAT(
        'del ', DAY(c.fecha_inicio), 
        CASE 
            WHEN MONTH(c.fecha_inicio) = MONTH(c.fecha_fin) AND YEAR(c.fecha_inicio) = YEAR(c.fecha_fin)
            THEN CONCAT(' al ', DAY(c.fecha_fin), ' de ',
                CASE MONTH(c.fecha_inicio)
                    WHEN 1 THEN 'enero'
                    WHEN 2 THEN 'febrero'
                    WHEN 3 THEN 'marzo'
                    WHEN 4 THEN 'abril'
                    WHEN 5 THEN 'mayo'
                    WHEN 6 THEN 'junio'
                    WHEN 7 THEN 'julio'
                    WHEN 8 THEN 'agosto'
                    WHEN 9 THEN 'septiembre'
                    WHEN 10 THEN 'octubre'
                    WHEN 11 THEN 'noviembre'
                    WHEN 12 THEN 'diciembre'
                END, ' del año ', YEAR(c.fecha_inicio))
            ELSE CONCAT(' de ',
                CASE MONTH(c.fecha_inicio)
                    WHEN 1 THEN 'enero'
                    WHEN 2 THEN 'febrero'
                    WHEN 3 THEN 'marzo'
                    WHEN 4 THEN 'abril'
                    WHEN 5 THEN 'mayo'
                    WHEN 6 THEN 'junio'
                    WHEN 7 THEN 'julio'
                    WHEN 8 THEN 'agosto'
                    WHEN 9 THEN 'septiembre'
                    WHEN 10 THEN 'octubre'
                    WHEN 11 THEN 'noviembre'
                    WHEN 12 THEN 'diciembre'
                END, ' al ', DAY(c.fecha_fin), ' de ',
                CASE MONTH(c.fecha_fin)
                    WHEN 1 THEN 'enero'
                    WHEN 2 THEN 'febrero'
                    WHEN 3 THEN 'marzo'
                    WHEN 4 THEN 'abril'
                    WHEN 5 THEN 'mayo'
                    WHEN 6 THEN 'junio'
                    WHEN 7 THEN 'julio'
                    WHEN 8 THEN 'agosto'
                    WHEN 9 THEN 'septiembre'
                    WHEN 10 THEN 'octubre'
                    WHEN 11 THEN 'noviembre'
                    WHEN 12 THEN 'diciembre'
                END, ' del año ', YEAR(c.fecha_fin))
        END
    ) as periodo_evento
FROM certificados c
WHERE c.activo = 1;

-- Crear procedimiento almacenado para generar códigos únicos
DELIMITER //
CREATE PROCEDURE GenerarCodigoVerificacion(OUT nuevo_codigo VARCHAR(12))
BEGIN
    DECLARE codigo_existe INT DEFAULT 1;
    DECLARE chars VARCHAR(36) DEFAULT 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    DECLARE i INT DEFAULT 0;
    
    WHILE codigo_existe > 0 DO
        SET nuevo_codigo = '';
        SET i = 0;
        
        WHILE i < 12 DO
            SET nuevo_codigo = CONCAT(nuevo_codigo, SUBSTRING(chars, FLOOR(1 + RAND() * 36), 1));
            SET i = i + 1;
        END WHILE;
        
        SELECT COUNT(*) INTO codigo_existe 
        FROM certificados 
        WHERE codigo_verificacion = nuevo_codigo;
    END WHILE;
END //
DELIMITER ;

-- Crear función para validar DNI
DELIMITER //
CREATE FUNCTION ValidarDNI(dni_input VARCHAR(8)) 
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE es_valido BOOLEAN DEFAULT FALSE;
    
    IF LENGTH(dni_input) = 8 AND dni_input REGEXP '^[0-9]{8}$' THEN
        SET es_valido = TRUE;
    END IF;
    
    RETURN es_valido;
END //
DELIMITER ;

-- Crear trigger para validar datos antes de insertar
DELIMITER //
CREATE TRIGGER validar_certificado_antes_insertar
BEFORE INSERT ON certificados
FOR EACH ROW
BEGIN
    -- Validar DNI
    IF NOT ValidarDNI(NEW.dni) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DNI debe tener exactamente 8 dígitos numéricos';
    END IF;
    
    -- Validar fechas
    IF NEW.fecha_inicio > NEW.fecha_fin THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de inicio no puede ser posterior a la fecha de fin';
    END IF;
    
    -- Validar horas académicas
    IF NEW.horas_academicas <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las horas académicas deben ser mayor a 0';
    END IF;
    
    -- Convertir nombre a formato título
    SET NEW.nombre_completo = CONCAT(
        UPPER(SUBSTRING(NEW.nombre_completo, 1, 1)),
        LOWER(SUBSTRING(NEW.nombre_completo, 2))
    );
END //
DELIMITER ;

-- Crear índices adicionales para optimizar consultas
CREATE INDEX idx_certificados_busqueda ON certificados(dni, activo, fecha_emision);
CREATE INDEX idx_certificados_evento ON certificados(nombre_evento, tipo_certificado);
CREATE INDEX idx_certificados_periodo ON certificados(fecha_inicio, fecha_fin);

-- Comentarios de la tabla
ALTER TABLE certificados COMMENT = 'Tabla para almacenar información de certificados emitidos por la universidad';
ALTER TABLE certificados MODIFY COLUMN dni VARCHAR(8) COMMENT 'Documento Nacional de Identidad del estudiante';
ALTER TABLE certificados MODIFY COLUMN nombre_completo VARCHAR(255) COMMENT 'Nombre completo del estudiante';
ALTER TABLE certificados MODIFY COLUMN tipo_certificado ENUM('Seminario', 'Curso', 'Taller', 'Conferencia', 'Diplomado', 'Capacitación') COMMENT 'Tipo de evento certificado';
ALTER TABLE certificados MODIFY COLUMN codigo_verificacion VARCHAR(12) COMMENT 'Código único para verificar autenticidad del certificado';
ALTER TABLE certificados MODIFY COLUMN activo BOOLEAN COMMENT 'Estado del certificado: 1=activo, 0=desactivado';
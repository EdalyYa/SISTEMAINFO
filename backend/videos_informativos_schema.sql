-- Tabla para gestionar videos informativos
CREATE TABLE IF NOT EXISTS videos_informativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    youtube_url VARCHAR(500) NOT NULL,
    youtube_id VARCHAR(50) NOT NULL,
    categoria ENUM('tutorial', 'promocion', 'informativo', 'otro') DEFAULT 'informativo',
    nombre_testimonio VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar algunos videos de ejemplo
INSERT INTO videos_informativos (titulo, descripcion, youtube_url, youtube_id, categoria, nombre_testimonio, activo, orden) VALUES
('Cómo matricularte en INFOUNA - Paso a paso', 'Tutorial completo para realizar tu matrícula en línea de forma rápida y sencilla.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'tutorial', 'Equipo INFOUNA', TRUE, 1),
('Conoce nuestros cursos de AutoCAD', 'Descubre todo lo que aprenderás en nuestros cursos de diseño técnico con AutoCAD.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'promocion', 'Instructor CAD', TRUE, 2),
('Requisitos para la matrícula 2024', 'Información importante sobre los documentos y requisitos necesarios para tu inscripción.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'informativo', 'Admisiones INFOUNA', TRUE, 3);
-- Tabla para configuración del modal promocional
CREATE TABLE IF NOT EXISTS modal_promocional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    descripcion TEXT,
    imagen VARCHAR(500),
    video_tiktok_url VARCHAR(500),
    facebook_url VARCHAR(500),
    tipo ENUM('cronograma', 'flyer', 'video', 'facebook', 'avisos', 'noticias') NOT NULL DEFAULT 'avisos',
    codigo_promocional VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE,
    valido_hasta VARCHAR(100),
    gradiente VARCHAR(100) DEFAULT 'from-blue-500 to-purple-600',
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0,
    mostrar_en_primer_modal BOOLEAN DEFAULT false,
    url_accion VARCHAR(500),
    texto_boton_primario VARCHAR(100) DEFAULT 'Inscríbete',
    texto_boton_secundario VARCHAR(100) DEFAULT 'Ver Programas',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo para cronograma de matrículas
INSERT INTO modal_promocional (titulo, subtitulo, descripcion, tipo, fecha_inicio, fecha_fin, valido_hasta, gradiente, activo, orden) VALUES
('Cronograma de Matrículas 2024', 'Proceso de Inscripciones Abiertas', 'No pierdas la oportunidad de formar parte de INFOUNA. Revisa las fechas importantes del proceso de matrícula.', 'cronograma', '2024-01-15', '2024-03-30', 'Hasta el 30 de Marzo 2024', 'from-green-500 to-blue-600', true, 1),
('Nuevos Cursos Disponibles', 'Especialízate en Tecnología', 'Descubre nuestros nuevos programas de capacitación en las tecnologías más demandadas del mercado.', 'flyer', '2024-01-01', '2024-12-31', 'Todo el año 2024', 'from-purple-500 to-pink-600', true, 2),
('Aviso Especial', 'Información importante', 'Aprovecha esta promoción especial por tiempo limitado. Capacítate con los mejores profesionales.', 'avisos', '2024-01-01', '2024-02-29', 'Hasta el 29 de Febrero 2024', 'from-orange-500 to-red-600', true, 3);

-- Tabla para cronograma detallado
CREATE TABLE IF NOT EXISTS cronograma_matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modal_id INT,
    fase VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('pendiente', 'activo', 'finalizado') DEFAULT 'pendiente',
    color VARCHAR(50) DEFAULT 'blue',
    icono VARCHAR(50) DEFAULT 'calendar',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modal_id) REFERENCES modal_promocional(id) ON DELETE CASCADE
);

-- Insertar cronograma de ejemplo
INSERT INTO cronograma_matriculas (modal_id, fase, descripcion, fecha_inicio, fecha_fin, estado, color, icono, orden) VALUES
(1, 'Pre-inscripciones', 'Registro inicial y reserva de cupo', '2024-01-15', '2024-02-15', 'activo', 'green', 'user-plus', 1),
(1, 'Matrículas Regulares', 'Proceso de matrícula para estudiantes regulares', '2024-02-16', '2024-03-15', 'pendiente', 'blue', 'clipboard-document-list', 2),
(1, 'Matrículas Extemporáneas', 'Última oportunidad para matricularse', '2024-03-16', '2024-03-30', 'pendiente', 'orange', 'clock', 3);

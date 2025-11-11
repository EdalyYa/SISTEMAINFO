-- Complete database schema for INFOUNA system - Missing tables only

USE infouna;

-- Users table for authentication and roles
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs table
CREATE TABLE IF NOT EXISTS programas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  duracion VARCHAR(50),
  modalidad ENUM('presencial', 'virtual', 'hibrido') DEFAULT 'presencial',
  precio DECIMAL(10,2),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  imagen VARCHAR(255),
  color VARCHAR(50),
  icono VARCHAR(50),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programa_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  modalidad VARCHAR(50),
  horario VARCHAR(100),
  duracion VARCHAR(50),
  instructor VARCHAR(100),
  nivel VARCHAR(50),
  precio DECIMAL(10,2) DEFAULT 0,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

-- Teachers/Docentes table
CREATE TABLE IF NOT EXISTS docentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefono VARCHAR(20),
  especialidad VARCHAR(100),
  experiencia TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table (fixed structure)
CREATE TABLE IF NOT EXISTS matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_matricula DATE,
  estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- Claims/Reclamations table
CREATE TABLE IF NOT EXISTS reclamaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(100),
  descripcion TEXT,
  estado ENUM('pendiente', 'en proceso', 'resuelto') DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data for users (admin user)
INSERT INTO users (username, password, name, email, role) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@infouna.edu.pe', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample data for programs
INSERT INTO programas (nombre, descripcion, duracion, modalidad, precio, estado, imagen, color, icono) VALUES
('Tecnico en Computacion e Informatica', 'Cursos de AutoCAD desde nivel básico hasta avanzado para diseño técnico profesional', '6 meses', 'presencial', 1200.00, 'activo', 'Excel.png', 'from-pink-500 to-purple-600', 'FaDesktop'),
('Tecnico en Informatica para Ingenierias', 'Cursos de AutoCAD desde nivel básico hasta avanzado para diseño técnico profesional', '6 meses', 'presencial', 1200.00, 'activo', 'Excel.png', 'from-pink-500 to-purple-600', 'FaDesktop'),
('Ciencia de Datos', 'Profesionales que desean mejorar sus habilidades en Excel', '4 meses', 'presencial', 800.00, 'activo', 'Excel.png', 'from-green-500 to-teal-600', 'FaChartBar'),
('Especialista en Excel', 'Profesionales que desean mejorar sus habilidades en Excel', '3 meses', 'virtual', 600.00, 'activo', 'Excel.png', 'from-green-500 to-teal-600', 'FaChartBar'),
('Desarrollo Software', 'Profesionales que desean mejorar sus habilidades en Excel', '5 meses', 'virtual', 1000.00, 'activo', 'Excel.png', 'from-green-500 to-teal-600', 'FaChartBar'),
('Ciberseguridad y Redes', 'Sistemas de comunicación entre humanos y computadoras para desarrollar software y resolver problemas específicos', '6 meses', 'virtual', 1100.00, 'activo', 'BasedeDatos.png', 'from-blue-500 to-indigo-600', 'FaLaptopCode'),
('Informatica Para Docentes', 'Sistemas de comunicación entre humanos y computadoras para desarrollar software y resolver problemas específicos', '4 meses', 'virtual', 700.00, 'activo', 'BasedeDatos.png', 'from-blue-500 to-indigo-600', 'FaLaptopCode'),
('Informatica para Investigacion', 'Formación en administración de redes y seguridad informática', '5 meses', 'virtual', 900.00, 'activo', 'InteligenciaArtificial.png', 'from-purple-500 to-blue-600', 'FaShieldAlt'),
('Programacion Robotica', 'Introducción y aplicaciones prácticas de IA y aprendizaje automático', '6 meses', 'virtual', 1300.00, 'activo', 'InteligenciaArtificial.png', 'from-orange-500 to-red-600', 'FaBrain'),
('Autocad', 'Diseño, administración y optimización de bases de datos', '4 meses', 'virtual', 800.00, 'activo', 'BasedeDatos.png', 'from-teal-500 to-green-600', 'FaDatabase')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insert sample data for courses
INSERT INTO cursos (programa_id, nombre, descripcion, modalidad, horario, duracion, instructor, nivel) VALUES
(1, 'Excel Básico a Intermedio', 'Curso completo de Microsoft Excel', 'Presencial', 'Lunes y Miércoles 7-9 PM', '2 meses', 'Prof. García', 'Básico'),
(1, 'Word y PowerPoint', 'Procesador de textos y presentaciones', 'Virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. López', 'Básico'),
(2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'Híbrido', 'Sábados 9 AM-12 PM', '3 meses', 'Prof. Martínez', 'Intermedio'),
(2, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', 'Lunes a Viernes 7-9 PM', '4 meses', 'Prof. Rodríguez', 'Avanzado'),
(3, 'Adobe Photoshop CC 2024', 'Edición profesional de imágenes', 'Presencial', 'Miércoles y Viernes 6-8 PM', '2 meses', 'Prof. Díaz', 'Intermedio')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insert sample data for teachers
INSERT INTO docentes (nombre, email, telefono, especialidad, experiencia) VALUES
('Prof. García', 'garcia@infouna.edu.pe', '987654321', 'Ofimática', '5 años de experiencia en capacitación empresarial'),
('Prof. López', 'lopez@infouna.edu.pe', '987654322', 'Productividad', '3 años en formación profesional'),
('Prof. Martínez', 'martinez@infouna.edu.pe', '987654323', 'Desarrollo Web', '7 años como desarrollador full-stack'),
('Prof. Rodríguez', 'rodriguez@infouna.edu.pe', '987654324', 'JavaScript/React', '8 años en desarrollo de aplicaciones'),
('Prof. Díaz', 'diaz@infouna.edu.pe', '987654325', 'Diseño Gráfico', '6 años en agencias de publicidad')
ON DUPLICATE KEY UPDATE nombre=nombre;
-- Extended database schema for INFOUNA system

CREATE DATABASE IF NOT EXISTS infouna;
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

-- Certificates table
CREATE TABLE IF NOT EXISTS certificados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  curso VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  fecha_emision DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs table
CREATE TABLE IF NOT EXISTS programas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
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
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE
);

-- Enrollments table
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

-- Insert admin user with bcrypt hashed password for 'infouna2025'
-- Password hash generated with bcrypt for 'infouna2025'
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES ('infoadmin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador INFOUNA', 'admin@infouna.edu.pe', 'admin')
ON DUPLICATE KEY UPDATE username=username;

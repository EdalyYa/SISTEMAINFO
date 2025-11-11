CREATE DATABASE IF NOT EXISTS infouna;
USE infouna;

CREATE TABLE IF NOT EXISTS certificados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  curso VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  fecha_emision DATE,
  UNIQUE KEY unique_codigo (codigo)
);

-- Insert sample data (10 records)
INSERT INTO certificados (codigo, nombre, dni, curso, estado, fecha_emision) VALUES
('CERT-001', 'Juan Pérez', '12345678', 'Excel Básico a Intermedio', 'Finalizado', '2023-05-10'),
('CERT-002', 'María López', '87654321', 'Adobe Photoshop CC 2024', 'Finalizado', '2023-06-15'),
('CERT-003', 'Carlos Rodríguez', '11223344', 'React y Node.js', 'En curso', NULL),
('CERT-004', 'Ana Gómez', '12345678', 'Machine Learning Básico', 'Finalizado', '2023-07-20'),
('CERT-005', 'Luis Fernández', '99887766', 'Seguridad Informática', 'Finalizado', '2023-04-05'),
('CERT-006', 'Marta Díaz', '12345678', 'Redes Cisco', 'Finalizado', '2023-03-12'),
('CERT-007', 'Pedro Sánchez', '55443322', 'Bases de Datos', 'Próximamente', NULL),
('CERT-008', 'Laura Ruiz', '99887766', 'Deep Learning Avanzado', 'En curso', NULL),
('CERT-009', 'Jorge Martínez', '11223344', 'HTML5, CSS3 y JavaScript', 'Finalizado', '2023-02-28'),
('CERT-010', 'Sofía Torres', '12345678', 'MongoDB y NoSQL', 'Finalizado', '2023-01-15');

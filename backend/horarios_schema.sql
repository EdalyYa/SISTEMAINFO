-- Schema for horarios (schedules) table
USE infouna;

-- Create horarios table
CREATE TABLE IF NOT EXISTS horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area VARCHAR(100) NOT NULL,
  nombre_curso VARCHAR(150) NOT NULL,
  dias VARCHAR(100) NOT NULL,
  grupo VARCHAR(20) NOT NULL,
  modalidad ENUM('VIRTUAL', 'PRESENCIAL') DEFAULT 'VIRTUAL',
  instructor VARCHAR(100),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data based on current static data
INSERT INTO horarios (area, nombre_curso, dias, grupo, modalidad, instructor) VALUES
-- OFIMATICA
('OFIMATICA', 'SISTEMA OPERATIVO WINDOWS', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'TC1', 'VIRTUAL', 'Prof. García'),
('OFIMATICA', 'SISTEMA OPERATIVO WINDOWS', 'MAR-JUE [ 7:00 pm.-10:00 pm. ]', 'TC2', 'VIRTUAL', 'Prof. García'),
('OFIMATICA', 'SISTEMA OPERATIVO WINDOWS', 'SAB-DOM [ 7:00 pm.-10:00 pm. ]', 'TC3', 'VIRTUAL', 'Prof. García'),
('OFIMATICA', 'Microsoft Word', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'MW1', 'VIRTUAL', 'Prof. López'),
('OFIMATICA', 'Microsoft Word', 'MAR-JUE [ 7:00 pm.-10:00 pm. ]', 'MW2', 'VIRTUAL', 'Prof. López'),
('OFIMATICA', 'MICROSOFT POWER POINT Y CANVA', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'MP1', 'VIRTUAL', 'Prof. Díaz'),

-- CURSOS AUTOCAD
('CURSOS AUTOCAD', 'Autocad I', 'LUN-MIE-VIE [ 9:00 am.-11:00 am. ]', 'PD1', 'VIRTUAL', 'Prof. Martínez'),
('CURSOS AUTOCAD', 'Autocad I', 'MAR-JUE [ 1:00 pm.-4:00 pm. ]', 'PD2', 'PRESENCIAL', 'Prof. Martínez'),

-- CURSOS ESPECIALES
('CURSOS ESPECIALES', 'Revit Architecture', 'MAR-JUE [ 4:00 pm.-7:00 pm. ]', 'J11', 'VIRTUAL', 'Prof. Rodríguez'),
('CURSOS ESPECIALES', 'Excel Intermedio', 'SAB-DOM [ 7:00 pm.-10:00 pm. ]', 'XI1', 'VIRTUAL', 'Prof. García'),

-- ESPECIALIDAD: MICROSOFT EXCEL
('ESPECIALIDAD: MICROSOFT EXCEL', 'MICROSOFT EXCEL BÁSICO', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'MEB', 'VIRTUAL', 'Prof. García'),
('ESPECIALIDAD: MICROSOFT EXCEL', 'MICROSOFT EXCEL INTERMEDIO', 'SAB-DOM[7:00 PM - 10:00 PM]', 'MEI', 'VIRTUAL', 'Prof. García'),

-- AREA: CIENCIA DE DATOS
('AREA: CIENCIA DE DATOS', 'PROGRAMACIÓN EN PYTHON', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'PP1', 'VIRTUAL', 'Prof. Rodríguez'),
('AREA: CIENCIA DE DATOS', 'INTELIGENCIA ESTADÍSTICA', 'SAB-DOM[7:00 PM - 10:00 PM]', 'IE1', 'VIRTUAL', 'Prof. Martínez')
ON DUPLICATE KEY UPDATE nombre_curso=nombre_curso;
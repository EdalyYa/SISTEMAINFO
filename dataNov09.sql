-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.30 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para infouna
CREATE DATABASE IF NOT EXISTS `infouna` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `infouna`;

-- Volcando estructura para tabla infouna.batch_uploads
CREATE TABLE IF NOT EXISTS `batch_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed` tinyint(1) DEFAULT '0',
  `num_certificates` int DEFAULT '0',
  `error_log` text,
  PRIMARY KEY (`id`),
  KEY `idx_processed` (`processed`),
  KEY `idx_upload_date` (`upload_date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.batch_uploads: ~2 rows (aproximadamente)
INSERT INTO `batch_uploads` (`id`, `filename`, `original_name`, `upload_date`, `processed`, `num_certificates`, `error_log`) VALUES
	(4, 'batch-1762585303392-752686193.csv', 'plantilla_certificados (1).csv', '2025-11-08 07:01:43', 1, 2, NULL),
	(5, 'batch-1762585439824-809147169.xlsx', 'plantilla_certificados (2).xlsx', '2025-11-08 07:03:59', 1, 21, NULL);

-- Volcando estructura para tabla infouna.certificados
CREATE TABLE IF NOT EXISTS `certificados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dni` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_completo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_certificado` varchar(100) NOT NULL,
  `nombre_evento` varchar(255) NOT NULL,
  `descripcion_evento` text,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `horas_academicas` int NOT NULL,
  `fecha_emision` date NOT NULL,
  `plantilla_certificado` varchar(255) NOT NULL,
  `codigo_verificacion` varchar(50) NOT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_verificacion` (`codigo_verificacion`),
  KEY `idx_dni_activo` (`dni`,`activo`),
  KEY `idx_codigo_verificacion` (`codigo_verificacion`),
  KEY `idx_fecha_emision` (`fecha_emision`),
  KEY `idx_certificados_pdf` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.certificados: ~31 rows (aproximadamente)
INSERT INTO `certificados` (`id`, `dni`, `nombre_completo`, `tipo_certificado`, `nombre_evento`, `descripcion_evento`, `fecha_inicio`, `fecha_fin`, `horas_academicas`, `fecha_emision`, `plantilla_certificado`, `codigo_verificacion`, `pdf_path`, `activo`, `created_at`, `updated_at`) VALUES
	(1, 'f135a12cd05dc3a93685591ccf9e408f:29d79f3b6b8b84fb49679d0aea0349ed', '351cb669b22b003740f0032e4f75b8ab:0b82b64a32116ec258d48068e7447cf903cf53aee807c0110f51b049d6d06595', 'Seminario', 'Perspectivas para el Desarrollo Regional - Puno al 2030', 'Seminario organizado por la Unidad de Posgrado de la Facultad de Ingenier├¡a Econ├│mica', '2024-08-23', '2024-08-25', 41, '2024-10-02', 'seminario-desarrollo.svg', 'CERT-ABC12345-2024', NULL, 0, '2025-10-24 00:55:49', '2025-11-08 07:07:59'),
	(2, 'c758a6a2881439d6a4f7b551d2f9db69:988a179f72f32542c6406b74a725c645', 'b5d1c1123b09d405f148ad3473495f36:a2e49d1945c8d0998e294ad16425b733898807231c55001ce3066ec6afd45154', 'Curso', 'Inteligencia Artificial Aplicada a los Negocios', 'Curso de capacitaci├│n en IA para profesionales', '2024-09-15', '2024-09-20', 30, '2024-09-25', 'seminario-desarrollo.svg', 'CERT-XYZ67890-2024', NULL, 0, '2025-10-24 00:55:49', '2025-11-08 07:08:03'),
	(3, 'bbc93f16a2ad28c8cbeb961a4c030ccf:6b64373cc3dafe55e1e1d84079262816', '2b5c57733369cc4c185b707706646f56:db7dabf9a1a00dad9701d4c28d53a4b9d6e8fddbd06deb1f751f93c65cbda35a', 'Taller', 'Gesti├│n de Proyectos con Metodolog├¡as ├ügiles', 'Taller pr├íctico sobre metodolog├¡as ├ígiles', '2024-10-01', '2024-10-03', 24, '2024-10-05', 'seminario-desarrollo.svg', 'CERT-DEF11223-2024', NULL, 0, '2025-10-24 00:55:49', '2025-11-08 07:07:56'),
	(4, '80edbae830bfcfd47ceeba5235c7b886:bb4b1177fe7c002847c3b4d933013cd3', 'e3c85f70e07a8501f5d1acf4fb5909c6:7752cba540ddb6c44106b35f0cf76203e0f95772df07eaa02ffe712e209ad153', 'Participaci├│n', 'Taller de Programaci├│n Python', 'Certificado de participaci├│n en taller de 20 horas.', '2024-04-01', '2024-04-05', 20, '2024-04-06', 'diseno-1-estandar', 'CERT-PYT11223-2024', NULL, 0, '2025-10-24 01:52:47', '2025-11-08 07:08:09'),
	(5, '9dc799cb7dfd172dc9487f0203112299:378468f8ae27ee55bc6c02001a18dafd', '44ab1e851bdb146a186d95415be1e4c0:01d106a713a68252e267bf0fc7c5576c8ec3bb6d6148b850a2da76b588f94a11', 'Completado', 'Diplomado en Ciberseguridad', 'Certificado por aprobar el diplomado con 80 horas.', '2024-02-01', '2024-06-01', 80, '2024-06-02', 'diseno-1-estandar', 'CERT-CYB12345-2024', NULL, 0, '2025-10-24 01:52:47', '2025-11-08 07:08:05'),
	(8, '6026dc4679f2338c07223f40cd981da6:16adf9c5d9dff99f4408cb5cc584b49f', '86fe851e2bf83b1014c5c8def0943167:81d7fd600b94dc9e7797aeba7836aff6123814f6bdaea5ffd753e89f34302806', 'DNI', 'ANGULAR', NULL, '2025-10-29', '2025-10-31', 10, '2025-10-24', 'diseno_6', 'CERT-1761322750307-ZTBMN6DAS', '74057932_CERT-1761322750307-ZTBMN6DAS.pdf', 0, '2025-10-24 16:19:10', '2025-11-08 07:07:51'),
	(9, '86aed8afe22b9a710abd3dc39d5ded04:1d813cd8e05da885f0f14d0c3c46cc79', 'a019160c820bedc2a5b69a0aff120db4:dbf42f12d709b85e87830317835476ff', 'Participaci�n', 'Test Event', 'Test description', '2024-01-01', '2024-01-15', 40, '2025-10-27', 'diseno_9', 'TEST-123', '12345678_TEST-123.pdf', 0, '2025-10-27 19:48:20', '2025-11-08 07:07:48'),
	(10, '12345678', 'PAREDES GARCIA, JUAN CARLOS', 'asistente', 'Taller de Desarrollo Web', NULL, '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', '2PRBT7', NULL, 0, '2025-11-08 07:03:09', '2025-11-08 07:20:40'),
	(11, '87654321', 'GOMEZ LOPEZ, MARIA ISABEL', 'ponente', 'Congreso de Innovacion', NULL, '1970-01-01', '1970-01-01', 15, '2025-11-08', 'seminario-desarrollo.svg', 'B8J36J', NULL, 0, '2025-11-08 07:03:09', '2025-11-08 07:21:46'),
	(12, '87654321', 'GÓMEZ LÓPEZ, MARÍA ISABEL', 'ponente', 'Congreso de Innovación', NULL, '1970-01-01', '1970-01-01', 15, '2025-11-08', 'seminario-desarrollo.svg', 'K28MZ7', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:21:42'),
	(13, '74851236', 'RAMÍREZ TORRES, LUIS ALBERTO', 'asistente', 'Taller de Inteligencia Artificial', '', '1970-01-01', '1970-01-01', 25, '2025-11-08', 'seminario-desarrollo.svg', 'IHNT3Z', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(14, '85963147', 'FLORES MENDOZA, ANA LUCÍA', 'ponente', 'Congreso de Innovación Tecnológica', '', '1970-01-01', '1970-01-01', 18, '2025-11-08', 'seminario-desarrollo.svg', 'QBWDYI', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(15, '71345982', 'GONZÁLES PÉREZ, CARLOS ANDRÉS', 'asistente', 'Seminario de Ciberseguridad', '', '1970-01-01', '1970-01-01', 16, '2025-11-08', 'seminario-desarrollo.svg', 'JUPN2O', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(16, '79632415', 'CASTRO RIVERA, JORGE EDUARDO', 'asistente', 'Taller de Bases de Datos', '', '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', '305PV3', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(17, '75894621', 'MARTÍNEZ SUÁREZ, VALERIA FERNANDA', 'ponente', 'Congreso de Robótica', '', '1970-01-01', '1970-01-01', 15, '2025-11-08', 'seminario-desarrollo.svg', 'AXCM4R', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(18, '76984123', 'HERRERA SALAZAR, PEDRO ANTONIO', 'asistente', 'Taller de Python para Ciencia de Datos', '', '1970-01-01', '1970-01-01', 22, '2025-11-08', 'seminario-desarrollo.svg', 'P70DOW', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(19, '78541239', 'REYES QUISPE, ROSA MARÍA', 'asistente', 'Curso de Big Data', '', '1970-01-01', '1970-01-01', 24, '2025-11-08', 'seminario-desarrollo.svg', '7X392J', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(20, '70321456', 'LUNA GÓMEZ, MIGUEL ÁNGEL', 'asistente', 'Taller de Programación Web', '', '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', 'X1XLJR', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(21, '72659148', 'CHÁVEZ FLORES, SANDRA ELENA', 'ponente', 'Congreso de Software Libre', '', '1970-01-01', '1970-01-01', 18, '2025-11-08', 'seminario-desarrollo.svg', 'WS232Y', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(22, '78596214', 'DÍAZ RAMOS, JULIO CÉSAR', 'asistente', 'Seminario de Machine Learning', '', '1970-01-01', '1970-01-01', 25, '2025-11-08', 'seminario-desarrollo.svg', 'S0TE4O', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(23, '79458236', 'MORALES VARGAS, GABRIELA SOFÍA', 'asistente', 'Taller de Desarrollo Móvil', '', '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', 'EF1BM0', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(24, '75982314', 'SALINAS PONCE, JOSÉ MANUEL', 'ponente', 'Congreso de Innovación Digital', '', '1970-01-01', '1970-01-01', 15, '2025-11-08', 'seminario-desarrollo.svg', 'VE86WQ', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(25, '74589321', 'TORO CÁCERES, ELENA PATRICIA', 'asistente', 'Taller de UX/UI Design', '', '1970-01-01', '1970-01-01', 18, '2025-11-08', 'seminario-desarrollo.svg', '4SARRR', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(26, '73265489', 'RAMOS AGUILAR, DIEGO FERNANDO', 'asistente', 'Seminario de Blockchain', '', '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', 'TK2FWS', NULL, 0, '2025-11-08 07:04:00', '2025-11-08 07:07:40'),
	(27, '72365481', 'VÁSQUEZ HERRERA, CAMILA ALEJANDRA', 'ponente', 'Congreso de Cloud Computing', '', '1970-01-01', '1970-01-01', 16, '2025-11-08', 'seminario-desarrollo.svg', 'VUZXTQ', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(28, '71896547', 'CARRASCO MEJÍA, RENZO DAVID', 'asistente', 'Taller de Desarrollo de Apps', '', '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', 'UKEPA3', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(29, '78254631', 'CORDOVA DELGADO, ANGELA MERCEDES', 'asistente', 'Curso de Analítica de Datos', '', '1970-01-01', '1970-01-01', 25, '2025-11-08', 'seminario-desarrollo.svg', '5FDN6K', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(30, '76321458', 'PALACIOS TORRES, JAVIER ALEJANDRO', 'asistente', 'Taller de Deep Learning', '', '1970-01-01', '1970-01-01', 22, '2025-11-08', 'seminario-desarrollo.svg', '18YDPW', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(31, '79562143', 'RIVERA GARCÍA, PATRICIA LUZ', 'ponente', 'Congreso de Inteligencia Artificial', '', '1970-01-01', '1970-01-01', 15, '2025-11-08', 'seminario-desarrollo.svg', 'AOS6IG', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(32, '70231456', 'GUTIÉRREZ RAMÍREZ, SERGIO DANIEL', 'asistente', 'Taller de Desarrollo Frontend', '', '1970-01-01', '1970-01-01', 20, '2025-11-08', 'seminario-desarrollo.svg', '6LWT5E', NULL, 1, '2025-11-08 07:04:00', '2025-11-08 07:04:00'),
	(33, '71883669', 'PAREDES CONDORI EDALY YAMILETH', 'Curso', 'ESPECIALISTA EN EXCEL AVANZADO', 'CURSO DIRIGIDO A ESTUDIANTES', '2025-06-03', '2025-12-07', 50, '2025-11-08', 'seminario-desarrollo.svg', 'IQCJ99', NULL, 1, '2025-11-08 07:19:57', '2025-11-08 07:19:57');

-- Volcando estructura para tabla infouna.cifras_logros
CREATE TABLE IF NOT EXISTS `cifras_logros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL COMMENT 'Etiqueta descriptiva del logro',
  `valor` varchar(50) NOT NULL COMMENT 'Valor num├®rico del logro (ej: 2000+, 15+)',
  `orden` int DEFAULT '0' COMMENT 'Orden de visualizaci├│n',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Si la cifra est├í activa para mostrar',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.cifras_logros: ~6 rows (aproximadamente)
INSERT INTO `cifras_logros` (`id`, `label`, `valor`, `orden`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'Estudiantes Certificados', '2000+', 1, 1, '2025-10-24 00:58:07', '2025-10-24 00:58:07'),
	(2, 'Programas Especializados', '15+', 2, 1, '2025-10-24 00:58:07', '2025-10-24 00:58:07'),
	(3, 'Docentes Calificados', '30+', 3, 1, '2025-10-24 00:58:07', '2025-10-24 00:58:07'),
	(4, 'Años Formando Profesionales', '15+', 4, 1, '2025-10-24 00:58:07', '2025-11-05 17:16:33'),
	(5, 'Laboratorios Modernos', '8', 5, 1, '2025-10-24 00:58:07', '2025-10-24 00:58:07'),
	(6, 'Convenios Empresariales', '25+', 6, 1, '2025-10-24 00:58:07', '2025-10-24 00:58:07');

-- Volcando estructura para tabla infouna.configuracion
CREATE TABLE IF NOT EXISTS `configuracion` (
  `id` int NOT NULL,
  `data` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla infouna.configuracion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla infouna.cronograma_matriculas
CREATE TABLE IF NOT EXISTS `cronograma_matriculas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `modal_id` int DEFAULT NULL,
  `fase` varchar(100) NOT NULL,
  `descripcion` text,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('pendiente','activo','finalizado') DEFAULT 'pendiente',
  `color` varchar(50) DEFAULT 'blue',
  `icono` varchar(50) DEFAULT 'calendar',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `modal_id` (`modal_id`),
  CONSTRAINT `cronograma_matriculas_ibfk_1` FOREIGN KEY (`modal_id`) REFERENCES `modal_promocional` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.cronograma_matriculas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla infouna.cursos
CREATE TABLE IF NOT EXISTS `cursos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programa_id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `modalidad` varchar(50) DEFAULT NULL,
  `horario` varchar(100) DEFAULT NULL,
  `duracion` varchar(50) DEFAULT NULL,
  `instructor` varchar(100) DEFAULT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT '0.00',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `imagen` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modulo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `programa_id` (`programa_id`),
  KEY `fk_cursos_modulo` (`modulo_id`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cursos_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.cursos: ~34 rows (aproximadamente)
INSERT INTO `cursos` (`id`, `programa_id`, `nombre`, `descripcion`, `modalidad`, `horario`, `duracion`, `instructor`, `nivel`, `precio`, `estado`, `imagen`, `creado_en`, `modulo_id`) VALUES
	(1, 1, 'Excel B??sico a Intermedio', 'Curso completo de Microsoft Excel', 'Presencial', 'Lunes y Mi??rcoles 7-9 PM', '2 meses', 'Prof. Garc??a', 'B??sico', 0.00, 'activo', '/uploads/cursos/curso-1762729160990-928024666.png', '2025-10-23 19:32:10', 7),
	(2, 1, 'Gestion de Base de Datos (SQL)', '---', 'virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. L??pez', 'B??sico', 0.00, 'activo', NULL, '2025-10-23 19:32:10', 3),
	(3, 2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'H??brido', 'S??bados 9 AM-12 PM', '3 meses', 'Prof. Mart??nez', 'Intermedio', 0.00, 'activo', NULL, '2025-10-23 19:32:10', NULL),
	(4, 2, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', 'Lunes a Viernes 7-9 PM', '4 meses', 'Prof. Rodr??guez', 'Avanzado', 0.00, 'activo', NULL, '2025-10-23 19:32:10', NULL),
	(5, 3, 'Adobe Photoshop CC 2024', 'Edici??n profesional de im??genes', 'Presencial', 'Mi??rcoles y Viernes 6-8 PM', '2 meses', 'Prof. D??az', 'Intermedio', 0.00, 'activo', NULL, '2025-10-23 19:32:10', NULL),
	(6, 1, 'Excel B??sico a Intermedio', 'Curso completo de Microsoft Excel', 'Presencial', 'Lunes y Mi??rcoles 7-9 PM', '2 meses', 'Prof. Garc??a', 'B??sico', 0.00, 'activo', NULL, '2025-10-24 00:52:51', NULL),
	(7, 1, 'Mantenimiento y reparacion de Hardware', '--', 'Virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. ', 'B??sico', 0.00, 'activo', NULL, '2025-10-24 00:52:51', 3),
	(8, 2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'H??brido', 'S??bados 9 AM-12 PM', '3 meses', 'Prof. Mart??nez', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 00:52:51', NULL),
	(9, 2, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', 'Lunes a Viernes 7-9 PM', '4 meses', 'Prof. Rodr??guez', 'Avanzado', 0.00, 'activo', NULL, '2025-10-24 00:52:51', NULL),
	(10, 3, 'Adobe Photoshop CC 2024', 'Edici??n profesional de im??genes', 'Presencial', 'Mi??rcoles y Viernes 6-8 PM', '2 meses', 'Prof. D??az', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 00:52:51', NULL),
	(11, 1, 'Excel B├ísico a Intermedio', 'Curso completo de Microsoft Excel', 'Presencial', 'Lunes y Mi├®rcoles 7-9 PM', '2 meses', 'Prof. Garc├¡a', 'B├ísico', 0.00, 'activo', NULL, '2025-10-24 00:54:37', NULL),
	(12, 1, 'Programacion en Python', '---', 'Virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. ', 'basico', 0.00, 'activo', NULL, '2025-10-24 00:54:37', 2),
	(13, 2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'H├¡brido', 'S├íbados 9 AM-12 PM', '3 meses', 'Prof. Mart├¡nez', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 00:54:37', NULL),
	(14, 2, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', 'Lunes a Viernes 7-9 PM', '4 meses', 'Prof. Rodr├¡guez', 'Avanzado', 0.00, 'activo', NULL, '2025-10-24 00:54:37', NULL),
	(15, 3, 'Adobe Photoshop CC 2024', 'Edici├│n profesional de im├ígenes', 'Presencial', 'Mi├®rcoles y Viernes 6-8 PM', '2 meses', 'Prof. D├¡az', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 00:54:37', NULL),
	(16, 1, 'Redes de Computadoras', 'Base de Datos', 'virtual', NULL, '2 meses', NULL, 'basico', 0.00, 'activo', NULL, '2025-10-24 00:55:32', 3),
	(17, 1, 'Procesamiento de Datos con SPSS', '---', 'Virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. ', 'basico', 0.00, 'activo', NULL, '2025-10-24 00:55:32', 2),
	(18, 2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'H├¡brido', 'S├íbados 9 AM-12 PM', '3 meses', 'Prof. Mart├¡nez', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 00:55:32', NULL),
	(19, 2, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', 'Lunes a Viernes 7-9 PM', '4 meses', 'Prof. Rodr├¡guez', 'Avanzado', 0.00, 'activo', NULL, '2025-10-24 00:55:32', NULL),
	(20, 3, 'Adobe Photoshop CC 2024', 'Edici├│n profesional de im├ígenes', 'Presencial', 'Mi├®rcoles y Viernes 6-8 PM', '2 meses', 'Prof. D├¡az', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 00:55:32', NULL),
	(21, 1, 'Microsoft Excel Avanzado', 'Curso completo de Microsoft Excel', 'Presencial', '--', '2 meses', '--', 'basico', 0.00, 'activo', NULL, '2025-10-24 01:52:47', 2),
	(22, 1, 'PowerPoint y Canva', 'Procesador de textos y presentaciones', 'Virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. Lopez', 'basico', 0.00, 'activo', NULL, '2025-10-24 01:52:47', 1),
	(23, 2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'H├¡brido', 'S├íbados 9 AM-12 PM', '3 meses', 'Prof. Mart├¡nez', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 01:52:47', NULL),
	(24, 2, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', 'Lunes a Viernes 7-9 PM', '4 meses', 'Prof. Rodr├¡guez', 'Avanzado', 0.00, 'activo', NULL, '2025-10-24 01:52:47', NULL),
	(25, 3, 'Adobe Photoshop CC 2024', 'Edici├│n profesional de im├ígenes', 'Presencial', 'Mi├®rcoles y Viernes 6-8 PM', '2 meses', 'Prof. D├¡az', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 01:52:47', NULL),
	(26, 1, 'Excel Básico', 'Curso completo de Microsoft Excel', 'virtual', '--', '2 meses', '--', 'basico', 0.00, 'activo', NULL, '2025-10-24 01:54:41', 1),
	(27, 1, 'Microsoft Word ', 'Procesador de textos y presentaciones', 'virtual', 'Martes y Jueves 6-8 PM', '1.5 meses', 'Prof. López', 'basico', 0.00, 'activo', NULL, '2025-10-24 01:54:41', 1),
	(28, 2, 'HTML5, CSS3 y JavaScript', 'Fundamentos del desarrollo web', 'Híbrido', 'Sábados 9 AM-12 PM', '3 meses', 'Prof. Martínez', 'Intermedio', 0.00, 'activo', NULL, '2025-10-24 01:54:41', NULL),
	(29, 53, 'React y Node.js', 'Desarrollo full-stack moderno', 'Presencial', NULL, '4 meses', NULL, NULL, 0.00, 'activo', NULL, '2025-10-24 01:54:41', NULL),
	(30, 54, 'Adobe Photoshop CC 2024', 'Edición profesional de imágenes', 'Presencial', NULL, '2 meses', NULL, NULL, 0.00, 'activo', NULL, '2025-10-24 01:54:41', NULL),
	(33, 10, 'AutoCAD Avanzado', 'Modelado 3D, renderizado, programación con LISP, personalización avanzada y automatización de procesos.', 'presencial', NULL, '8 semanas', 'Ing. Roberto Silva', 'Avanzado', 300.00, 'activo', NULL, '2025-11-05 13:49:06', NULL),
	(34, 10, 'Sistemas de Información Geográfica (GIS)', 'Introducción a GIS, manejo de datos geoespaciales, análisis espacial y creación de mapas temáticos.', 'hibrido', NULL, '8 semanas', 'Ing. Ana Gutierrez', 'Avanzado', 350.00, 'activo', NULL, '2025-11-05 13:49:06', NULL),
	(35, 1, 'Curso de Prueba', 'Este es un curso de prueba para verificar el enlazado', 'Presencial', 'Lunes a Viernes 9:00-12:00', '3 meses', 'Profesor Test', 'Basico', 299.99, 'activo', NULL, '2025-11-06 14:56:45', 1),
	(36, 1, 'Programacion en R', '---', 'virtual', 'Lunes y Miercores 18:00- 20:00', '30', '--', 'basico', 70.00, 'activo', NULL, '2025-11-06 15:00:01', 2);

-- Volcando estructura para tabla infouna.cursos_libres
CREATE TABLE IF NOT EXISTS `cursos_libres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `icono` varchar(50) DEFAULT '­ƒôÜ',
  `color` varchar(100) DEFAULT 'from-blue-500 to-blue-700',
  `descripcion` text,
  `duracion` varchar(100) DEFAULT NULL,
  `modalidad` enum('presencial','virtual','hibrido') DEFAULT 'virtual',
  `nivel` enum('basico','intermedio','avanzado') DEFAULT 'basico',
  `instructor` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT '0.00',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_estado` (`estado`),
  KEY `idx_modalidad` (`modalidad`),
  KEY `idx_nivel` (`nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.cursos_libres: ~49 rows (aproximadamente)
INSERT INTO `cursos_libres` (`id`, `nombre`, `categoria`, `icono`, `color`, `descripcion`, `duracion`, `modalidad`, `nivel`, `instructor`, `precio`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'Bases de datos y Lenguaje SQL', 'bases-datos', '1762605947720_GP3.jpg', 'from-blue-500 to-blue-700', 'Aprende a gestionar bases de datos con SQL', '2 meses', 'virtual', 'basico', 'Prof. Garc├¡a', 150.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:45:48'),
	(2, 'Programaci├│n R y RStudio avanzado', 'programacion', '­ƒôè', 'from-green-500 to-green-700', 'An├ílisis estad├¡stico avanzado con R', '3 meses', 'virtual', 'avanzado', 'Prof. L├│pez', 200.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(3, 'Programaci├│n Python b├ísico', 'programacion', '­ƒÉì', 'from-yellow-500 to-yellow-700', 'Fundamentos de programaci├│n en Python', '2 meses', 'virtual', 'basico', 'Prof. Mart├¡nez', 180.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(4, 'Power BI', 'analisis', '1762605843837_pra2.jpg', 'from-orange-500 to-orange-700', 'Visualizaci├│n de datos empresariales', '1.5 meses', 'virtual', 'intermedio', 'Prof. Rodr├¡guez', 160.00, 'activo', '2025-10-24 00:58:22', '2025-11-09 22:00:22'),
	(5, 'Servidores en Linux b├ísico', 'sistemas', '1762606255706_Captura_de_pantalla__55_.png', 'from-gray-500 to-gray-700', 'Administraci├│n b├ísica de servidores Linux', '2 meses', 'virtual', 'basico', 'Prof. Fern├índez', 170.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:50:56'),
	(6, 'Servidores en Linux avanzado', 'sistemas', '­ƒûÑ´©Å', 'from-gray-600 to-gray-800', 'Administraci├│n avanzada de servidores Linux', '3 meses', 'virtual', 'avanzado', 'Prof. Fern├índez', 220.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(7, 'Servidores en Windows b├ísico', 'sistemas', '1762606245950_Captura_de_pantalla__37_.png', 'from-blue-400 to-blue-600', 'Administraci├│n b├ísica de servidores Windows', '2 meses', 'virtual', 'basico', 'Prof. S├ínchez', 170.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:50:47'),
	(8, 'Programaci├│n en C#', 'programacion', '1762606208624_Captura_de_pantalla__32_.png', 'from-purple-500 to-purple-700', 'Desarrollo con Microsoft .NET', '3 meses', 'virtual', 'intermedio', 'Prof. Torres', 190.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:50:08'),
	(9, 'Programaci├│n en C++', 'programacion', '1762606224044_Captura_de_pantalla__4_.png', 'from-blue-500 to-blue-700', 'Programaci├│n de sistemas y aplicaciones', '3 meses', 'virtual', 'intermedio', 'Prof. Vega', 190.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:50:24'),
	(10, 'Programaci├│n en Java', 'programacion', 'Ôÿò', 'from-red-500 to-orange-500', 'Desarrollo de aplicaciones empresariales', '4 meses', 'virtual', 'intermedio', 'Prof. Morales', 210.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(11, 'Programaci├│n en Python intermedio', 'programacion', '­ƒÉì', 'from-green-500 to-blue-500', 'Python para desarrollo web y datos', '2.5 meses', 'virtual', 'intermedio', 'Prof. Mart├¡nez', 200.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(12, 'Programaci├│n en Python avanzado', 'programacion', '­ƒÜÇ', 'from-blue-500 to-purple-500', 'Python avanzado y machine learning', '4 meses', 'virtual', 'avanzado', 'Prof. Mart├¡nez', 250.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(13, 'Programaci├│n en Laravel', 'programacion', '­ƒîÉ', 'from-red-500 to-red-700', 'Framework PHP para desarrollo web', '3 meses', 'virtual', 'intermedio', 'Prof. Castro', 200.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(14, 'Programaci├│n Google Colab', 'programacion', '­ƒôô', 'from-yellow-500 to-orange-500', 'Notebooks colaborativos en la nube', '1 mes', 'virtual', 'basico', 'Prof. Herrera', 120.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(15, 'Programaci├│n en Go', 'programacion', '­ƒÅâ', 'from-cyan-500 to-blue-500', 'Lenguaje moderno para sistemas', '2.5 meses', 'virtual', 'intermedio', 'Prof. Ruiz', 190.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(16, 'Programaci├│n Kotlin', 'programacion', '­ƒô▒', 'from-purple-500 to-pink-500', 'Desarrollo Android moderno', '3 meses', 'virtual', 'intermedio', 'Prof. Jim├®nez', 200.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(17, 'Big Data', 'analisis', '1762605680084_edificio.jpg', 'from-green-600 to-teal-600', 'An├ílisis de grandes vol├║menes de datos', '4 meses', 'virtual', 'avanzado', 'Prof. Mendoza', 280.00, 'activo', '2025-10-24 00:58:22', '2025-11-09 22:00:21'),
	(18, 'Statistica', 'analisis', '1762605941458_logoinfo.jpeg', 'from-blue-600 to-indigo-600', 'Software estad├¡stico avanzado', '2 meses', 'virtual', 'intermedio', 'Prof. Vargas', 180.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:45:42'),
	(19, 'Software Minitab', 'analisis', '1762605893711_logo.png', 'from-teal-500 to-teal-700', 'An├ílisis estad├¡stico y control de calidad', '1.5 meses', 'virtual', 'intermedio', 'Prof. Silva', 160.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:44:54'),
	(20, 'Software SAS', 'analisis', '1762605906989_GP2.jpg', 'from-indigo-500 to-indigo-700', 'An├ílisis estad├¡stico empresarial', '3 meses', 'virtual', 'avanzado', 'Prof. Ram├¡rez', 250.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:45:24'),
	(21, 'Software Epidat, Epinfo', 'analisis', '1762605857455_multiplicador.png', 'from-green-500 to-green-700', 'Epidemiolog├¡a y salud p├║blica', '2 meses', 'virtual', 'intermedio', 'Prof. Medina', 170.00, 'activo', '2025-10-24 00:58:22', '2025-11-09 22:00:24'),
	(22, 'Software Stata', 'analisis', '1762605931800_descarga.jpg', 'from-blue-500 to-blue-700', 'An├ílisis estad├¡stico y econom├®trico', '2.5 meses', 'virtual', 'intermedio', 'Prof. Paredes', 190.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:45:32'),
	(23, 'Software Eviews', 'analisis', '1762605886625_G1.jpg', 'from-purple-500 to-purple-700', 'An├ílisis econom├®trico y forecasting', '2.5 meses', 'virtual', 'avanzado', 'Prof. Guerrero', 200.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:44:47'),
	(24, 'Cisco Packet Tracert b├ísico', 'redes', '1762606360809_Captura_de_pantalla__6_.png', 'from-blue-600 to-cyan-600', 'Simulaci├│n de redes b├ísica', '2 meses', 'virtual', 'basico', 'Prof. Navarro', 170.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:52:41'),
	(25, 'Cisco Packet Tracert avanzado', 'redes', '1762606371318_Captura_de_pantalla__51_.png', 'from-cyan-600 to-blue-600', 'Simulaci├│n de redes avanzada', '3 meses', 'virtual', 'avanzado', 'Prof. Navarro', 220.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:52:51'),
	(26, 'Internet de las cosas', 'tecnologia', '1762606239950_Captura_de_pantalla__22_.png', 'from-green-500 to-teal-500', 'IoT y dispositivos conectados', '3 meses', 'virtual', 'intermedio', 'Prof. Delgado', 210.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:50:40'),
	(27, 'Administraci├│n de Moodle I', 'sistemas', '1762606330393_Captura_de_pantalla__67_.png', 'from-orange-500 to-orange-700', 'Plataforma educativa b├ísica', '1.5 meses', 'virtual', 'basico', 'Prof. Ortega', 140.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:52:11'),
	(28, 'Administraci├│n de Moodle II', 'sistemas', '1762606320778_Captura_de_pantalla__14_.png', 'from-orange-600 to-red-600', 'Plataforma educativa avanzada', '2 meses', 'virtual', 'intermedio', 'Prof. Ortega', 170.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:52:01'),
	(29, 'Scratch', 'programacion', '1762606392566_Captura_de_pantalla__58_.png', 'from-yellow-500 to-orange-500', 'Programaci├│n visual para principiantes', '1 mes', 'virtual', 'basico', 'Prof. Pe├▒a', 100.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:53:13'),
	(30, 'ArcGIS', 'gis', '1762606124256_Captura_de_pantalla__37_.png', 'from-green-600 to-blue-600', 'Sistemas de informaci├│n geogr├ífica', '3 meses', 'virtual', 'intermedio', 'Prof. Campos', 230.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:48:45'),
	(31, 'Oracle', 'bases-datos', '1762606055698_unap.jpg', 'from-red-600 to-red-800', 'Base de datos empresarial', '4 meses', 'virtual', 'avanzado', 'Prof. Garc├¡a', 280.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:47:36'),
	(32, 'MariaDB', 'bases-datos', '1762605958626_G2.jpg', 'from-blue-500 to-teal-500', 'Base de datos open source', '2 meses', 'virtual', 'intermedio', 'Prof. Garc├¡a', 160.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:45:59'),
	(33, 'MongoDB', 'bases-datos', '1762606044814_una.jpg', 'from-green-600 to-green-800', 'Base de datos NoSQL', '2.5 meses', 'virtual', 'intermedio', 'Prof. Garc├¡a', 180.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:47:25'),
	(34, 'Latex', 'documentos', '1762606113872_12121.png', 'from-gray-600 to-gray-800', 'Composici├│n tipogr├ífica profesional', '1.5 meses', 'virtual', 'intermedio', 'Prof. Ramos', 140.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:48:34'),
	(35, 'Microsoft Excel Avanzado', 'oficina', '1762606141726_Captura_de_pantalla__57_.png', 'from-green-500 to-green-700', 'An├ílisis de datos con Excel', '2 meses', 'virtual', 'intermedio', 'Prof. Moreno', 150.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:49:03'),
	(36, 'Microsoft Word Avanzado', 'oficina', '1762606160508_Captura_de_pantalla__61_.png', 'from-blue-500 to-blue-700', 'Documentos profesionales', '1 mes', 'virtual', 'basico', 'Prof. Moreno', 120.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:49:23'),
	(37, 'Microsoft PowerPoint', 'oficina', '1762606151239_Captura_de_pantalla__63_.png', 'from-orange-500 to-orange-700', 'Presentaciones impactantes', '1 mes', 'virtual', 'basico', 'Prof. Moreno', 120.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:49:12'),
	(38, 'Google Workspace', 'oficina', '1762606134968_Captura_de_pantalla__66_.png', 'from-blue-400 to-green-400', 'Productividad en la nube', '1.5 meses', 'virtual', 'basico', 'Prof. Aguilar', 130.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:48:55'),
	(39, 'Programaci├│n en JavaScript', 'programacion', 'ÔÜí', 'from-yellow-400 to-orange-500', 'Desarrollo web interactivo', '3 meses', 'virtual', 'intermedio', 'Prof. Castro', 190.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(40, 'React.js', 'programacion', 'ÔÜø´©Å', 'from-cyan-400 to-blue-500', 'Interfaces de usuario modernas', '3 meses', 'virtual', 'intermedio', 'Prof. Castro', 210.00, 'activo', '2025-10-24 00:58:22', '2025-10-24 00:58:22'),
	(41, 'Node.js', 'programacion', '1762606192154_Captura_de_pantalla__70_.png', 'from-green-400 to-green-600', 'Backend con JavaScript', '2.5 meses', 'virtual', 'intermedio', 'Prof. Castro', 200.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:49:52'),
	(42, 'Vue.js', 'programacion', '1762606381568_Captura_de_pantalla__13_.png', 'from-green-500 to-teal-500', 'Framework progresivo', '2.5 meses', 'virtual', 'intermedio', 'Prof. V├ísquez', 190.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:53:02'),
	(43, 'Angular', 'programacion', '1762606177370_Captura_de_pantalla__35_.png', 'from-red-500 to-red-700', 'Aplicaciones web robustas', '3.5 meses', 'virtual', 'avanzado', 'Prof. V├ísquez', 220.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:49:37'),
	(44, 'Docker', 'sistemas', '1762606307031_Captura_de_pantalla__37_.png', 'from-blue-400 to-cyan-500', 'Contenedores y virtualizaci├│n', '2 meses', 'virtual', 'intermedio', 'Prof. Fern├índez', 180.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:51:47'),
	(45, 'Kubernetes', 'sistemas', '1762606300314_Captura_de_pantalla__2_.png', 'from-blue-600 to-purple-600', 'Orquestaci├│n de contenedores', '3 meses', 'virtual', 'avanzado', 'Prof. Fern├índez', 250.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:51:40'),
	(46, 'AWS Cloud', 'cloud', '1762606065549_1.png', 'from-orange-400 to-yellow-500', 'Servicios en la nube', '4 meses', 'virtual', 'intermedio', 'Prof. Salazar', 300.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:47:45'),
	(47, 'Azure Cloud', 'cloud', '1762606086533_certificado.jpg', 'from-blue-500 to-blue-700', 'Plataforma Microsoft Cloud', '4 meses', 'virtual', 'intermedio', 'Prof. Salazar', 300.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:48:06'),
	(48, 'Google Cloud', 'cloud', '1762606096755_aaaaaaaaaaa.png', 'from-blue-400 to-green-400', 'Infraestructura Google', '4 meses', 'virtual', 'intermedio', 'Prof. Salazar', 300.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:48:17'),
	(49, 'Cyberseguridad', 'seguridad', '1762606339596_Captura_de_pantalla__63_.png', 'from-red-600 to-gray-800', 'Protecci├│n de sistemas', '4 meses', 'virtual', 'avanzado', 'Prof. Navarro', 280.00, 'activo', '2025-10-24 00:58:22', '2025-11-08 12:52:20');

-- Volcando estructura para tabla infouna.disenos_certificados
CREATE TABLE IF NOT EXISTS `disenos_certificados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tipo_evento` enum('seminario','curso','taller','otro') DEFAULT 'otro',
  `configuracion` json NOT NULL,
  `fondo_certificado` varchar(255) DEFAULT NULL,
  `logo_izquierdo` varchar(255) DEFAULT NULL,
  `logo_derecho` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_disenos_activa` (`activa`),
  KEY `idx_disenos_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.disenos_certificados: ~1 rows (aproximadamente)
INSERT INTO `disenos_certificados` (`id`, `nombre`, `tipo_evento`, `configuracion`, `fondo_certificado`, `logo_izquierdo`, `logo_derecho`, `activa`, `created_at`, `updated_at`) VALUES
	(1, 'Diseño Básico', 'seminario', '{}', NULL, NULL, NULL, 1, '2025-11-05 16:52:36', '2025-11-05 19:18:19');

-- Volcando estructura para tabla infouna.docentes
CREATE TABLE IF NOT EXISTS `docentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `grado_academico` varchar(100) DEFAULT NULL,
  `experiencia` text,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.docentes: ~5 rows (aproximadamente)
INSERT INTO `docentes` (`id`, `nombre`, `apellido`, `email`, `telefono`, `especialidad`, `grado_academico`, `experiencia`, `estado`, `fecha_creacion`) VALUES
	(1, 'Prof. Garc??a', NULL, 'garcia@infouna.edu.pe', '987654321', 'Ofim??tica', NULL, '5 a??os de experiencia en capacitaci??n empresarial', 'activo', '2025-10-23 19:32:10'),
	(2, 'Prof. L??pez', NULL, 'lopez@infouna.edu.pe', '987654322', 'Productividad', NULL, '3 a??os en formaci??n profesional', 'activo', '2025-10-23 19:32:10'),
	(3, 'Prof. Mart??nez', NULL, 'martinez@infouna.edu.pe', '987654323', 'Desarrollo Web', NULL, '7 a??os como desarrollador full-stack', 'activo', '2025-10-23 19:32:10'),
	(4, 'Prof. Rodr??guez', NULL, 'rodriguez@infouna.edu.pe', '987654324', 'JavaScript/React', NULL, '8 a??os en desarrollo de aplicaciones', 'activo', '2025-10-23 19:32:10'),
	(5, 'Prof. D??az', NULL, 'diaz@infouna.edu.pe', '987654325', 'Dise??o Gr??fico', NULL, '6 a??os en agencias de publicidad', 'activo', '2025-10-23 19:32:10');

-- Volcando estructura para tabla infouna.documentos
CREATE TABLE IF NOT EXISTS `documentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `categoria` varchar(100) DEFAULT NULL,
  `etiquetas` json DEFAULT NULL,
  `ruta` varchar(255) NOT NULL,
  `mime` varchar(100) DEFAULT NULL,
  `tamano` bigint DEFAULT NULL,
  `publico` tinyint DEFAULT '1',
  `descargas` int DEFAULT '0',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.documentos: ~1 rows (aproximadamente)
INSERT INTO `documentos` (`id`, `titulo`, `descripcion`, `categoria`, `etiquetas`, `ruta`, `mime`, `tamano`, `publico`, `descargas`, `creado_en`) VALUES
	(1, 'demo', 'demo', 'Reglamentos', '[]', '/uploads/docs/1762732114562-Arbitros.pdf', 'application/pdf', 74124, 1, 2, '2025-11-09 18:48:34');

-- Volcando estructura para tabla infouna.horarios
CREATE TABLE IF NOT EXISTS `horarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `area` varchar(100) NOT NULL,
  `nombre_curso` varchar(150) NOT NULL,
  `dias` varchar(100) NOT NULL,
  `grupo` varchar(20) NOT NULL,
  `modalidad` enum('VIRTUAL','PRESENCIAL') DEFAULT 'VIRTUAL',
  `instructor` varchar(100) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.horarios: ~43 rows (aproximadamente)
INSERT INTO `horarios` (`id`, `area`, `nombre_curso`, `dias`, `grupo`, `modalidad`, `instructor`, `estado`, `creado_en`, `actualizado_en`) VALUES
	(1, 'OFIMATICA', 'SISTEMA OPERATIVO WINDOWS', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'TC1', 'VIRTUAL', 'Prof. Garc├¡a', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(2, 'OFIMATICA', 'SISTEMA OPERATIVO WINDOWS', 'MAR-JUE [ 7:00 pm.-10:00 pm. ]', 'TC2', 'VIRTUAL', 'Prof. Garc├¡a', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(3, 'OFIMATICA', 'SISTEMA OPERATIVO WINDOWS', 'SAB-DOM [ 7:00 pm.-10:00 pm. ]', 'TC3', 'VIRTUAL', 'Prof. Garc├¡a', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(4, 'OFIMATICA', 'Microsoft Word', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'MW1', 'VIRTUAL', 'Prof. L├│pez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(5, 'OFIMATICA', 'Microsoft Word', 'MAR-JUE [ 7:00 pm.-10:00 pm. ]', 'MW2', 'VIRTUAL', 'Prof. L├│pez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(6, 'OFIMATICA', 'MICROSOFT POWER POINT Y CANVA', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'MP1', 'VIRTUAL', 'Prof. D├¡az', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(7, 'CURSOS AUTOCAD', 'Autocad I', 'LUN-MIE-VIE [ 9:00 am.-11:00 am. ]', 'PD1', 'VIRTUAL', 'Prof. Mart├¡nez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(8, 'CURSOS AUTOCAD', 'Autocad I', 'MAR-JUE [ 1:00 pm.-4:00 pm. ]', 'PD2', 'PRESENCIAL', 'Prof. Mart├¡nez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(9, 'CURSOS ESPECIALES', 'Revit Architecture', 'MAR-JUE [ 4:00 pm.-7:00 pm. ]', 'J11', 'VIRTUAL', 'Prof. Rodr├¡guez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(10, 'CURSOS ESPECIALES', 'Excel Intermedio', 'SAB-DOM [ 7:00 pm.-10:00 pm. ]', 'XI1', 'VIRTUAL', 'Prof. Garc├¡a', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(11, 'ESPECIALIDAD: MICROSOFT EXCEL', 'MICROSOFT EXCEL B├üSICO', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'MEB', 'VIRTUAL', 'Prof. Garc├¡a', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(12, 'ESPECIALIDAD: MICROSOFT EXCEL', 'MICROSOFT EXCEL INTERMEDIO', 'SAB-DOM[7:00 PM - 10:00 PM]', 'MEI', 'VIRTUAL', 'Prof. Garc├¡a', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(13, 'AREA: CIENCIA DE DATOS', 'PROGRAMACI├ôN EN PYTHON', 'LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]', 'PP1', 'VIRTUAL', 'Prof. Rodr├¡guez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(14, 'AREA: CIENCIA DE DATOS', 'INTELIGENCIA ESTAD├ìSTICA', 'SAB-DOM[7:00 PM - 10:00 PM]', 'IE1', 'VIRTUAL', 'Prof. Mart├¡nez', 'activo', '2025-10-24 00:58:35', '2025-10-24 00:58:35'),
	(15, 'AREA: Tecnico en Computacion e Informatica', 'Excel B??sico a Intermedio', 'Lunes y Mi??rcoles 7-9 PM', 'CN1', 'PRESENCIAL', 'Prof. Garc??a', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(16, 'AREA: Tecnico en Computacion e Informatica', 'Gestion de Base de Datos (SQL)', 'Martes y Jueves 6-8 PM', 'CN2', 'VIRTUAL', 'Prof. L??pez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(17, 'AREA: Tecnico en Informatica para Ingenierias', 'HTML5, CSS3 y JavaScript', 'S??bados 9 AM-12 PM', 'CN3', 'VIRTUAL', 'Prof. Mart??nez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(18, 'AREA: Tecnico en Informatica para Ingenierias', 'React y Node.js', 'Lunes a Viernes 7-9 PM', 'CN4', 'PRESENCIAL', 'Prof. Rodr??guez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(19, 'AREA: Ciencia de Datos', 'Adobe Photoshop CC 2024', 'Mi??rcoles y Viernes 6-8 PM', 'CN5', 'PRESENCIAL', 'Prof. D??az', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(20, 'AREA: Tecnico en Computacion e Informatica', 'Excel B??sico a Intermedio', 'Lunes y Mi??rcoles 7-9 PM', 'CN6', 'PRESENCIAL', 'Prof. Garc??a', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(21, 'AREA: Tecnico en Computacion e Informatica', 'Mantenimiento y reparacion de Hardware', 'Martes y Jueves 6-8 PM', 'CN7', 'VIRTUAL', 'Prof. ', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(22, 'AREA: Tecnico en Informatica para Ingenierias', 'HTML5, CSS3 y JavaScript', 'S??bados 9 AM-12 PM', 'CN8', 'VIRTUAL', 'Prof. Mart??nez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(23, 'AREA: Tecnico en Informatica para Ingenierias', 'React y Node.js', 'Lunes a Viernes 7-9 PM', 'CN9', 'PRESENCIAL', 'Prof. Rodr??guez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(24, 'AREA: Ciencia de Datos', 'Adobe Photoshop CC 2024', 'Mi??rcoles y Viernes 6-8 PM', 'CN10', 'PRESENCIAL', 'Prof. D??az', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(25, 'AREA: Tecnico en Computacion e Informatica', 'Excel B├ísico a Intermedio', 'Lunes y Mi├®rcoles 7-9 PM', 'CN11', 'PRESENCIAL', 'Prof. Garc├¡a', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(26, 'AREA: Tecnico en Computacion e Informatica', 'Programacion en Python', 'Martes y Jueves 6-8 PM', 'CN12', 'VIRTUAL', 'Prof. ', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(27, 'AREA: Tecnico en Informatica para Ingenierias', 'HTML5, CSS3 y JavaScript', 'S├íbados 9 AM-12 PM', 'CN13', 'VIRTUAL', 'Prof. Mart├¡nez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(28, 'AREA: Tecnico en Informatica para Ingenierias', 'React y Node.js', 'Lunes a Viernes 7-9 PM', 'CN14', 'PRESENCIAL', 'Prof. Rodr├¡guez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(29, 'AREA: Ciencia de Datos', 'Adobe Photoshop CC 2024', 'Mi├®rcoles y Viernes 6-8 PM', 'CN15', 'PRESENCIAL', 'Prof. D├¡az', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(30, 'AREA: Tecnico en Computacion e Informatica', 'Procesamiento de Datos con SPSS', 'Martes y Jueves 6-8 PM', 'CN17', 'VIRTUAL', 'Prof. ', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(31, 'AREA: Tecnico en Informatica para Ingenierias', 'HTML5, CSS3 y JavaScript', 'S├íbados 9 AM-12 PM', 'CN18', 'VIRTUAL', 'Prof. Mart├¡nez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(32, 'AREA: Tecnico en Informatica para Ingenierias', 'React y Node.js', 'Lunes a Viernes 7-9 PM', 'CN19', 'PRESENCIAL', 'Prof. Rodr├¡guez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(33, 'AREA: Ciencia de Datos', 'Adobe Photoshop CC 2024', 'Mi├®rcoles y Viernes 6-8 PM', 'CN20', 'PRESENCIAL', 'Prof. D├¡az', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(34, 'AREA: Tecnico en Computacion e Informatica', 'Microsoft Excel Avanzado', '--', 'CN21', 'PRESENCIAL', '--', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(35, 'AREA: Tecnico en Computacion e Informatica', 'PowerPoint y Canva', 'Martes y Jueves 6-8 PM', 'CN22', 'VIRTUAL', 'Prof. Lopez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(36, 'AREA: Tecnico en Informatica para Ingenierias', 'HTML5, CSS3 y JavaScript', 'S├íbados 9 AM-12 PM', 'CN23', 'VIRTUAL', 'Prof. Mart├¡nez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(37, 'AREA: Tecnico en Informatica para Ingenierias', 'React y Node.js', 'Lunes a Viernes 7-9 PM', 'CN24', 'PRESENCIAL', 'Prof. Rodr├¡guez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(38, 'AREA: Ciencia de Datos', 'Adobe Photoshop CC 2024', 'Mi├®rcoles y Viernes 6-8 PM', 'CN25', 'PRESENCIAL', 'Prof. D├¡az', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(39, 'AREA: Tecnico en Computacion e Informatica', 'Excel Básico', '--', 'CN26', 'VIRTUAL', '--', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(40, 'AREA: Tecnico en Computacion e Informatica', 'Microsoft Word ', 'Martes y Jueves 6-8 PM', 'CN27', 'VIRTUAL', 'Prof. López', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(41, 'AREA: Tecnico en Informatica para Ingenierias', 'HTML5, CSS3 y JavaScript', 'Sábados 9 AM-12 PM', 'CN28', 'VIRTUAL', 'Prof. Martínez', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(42, 'AREA: Tecnico en Computacion e Informatica', 'Curso de Prueba', 'Lunes a Viernes 9:00-12:00', 'CN35', 'PRESENCIAL', 'Profesor Test', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(43, 'AREA: Tecnico en Computacion e Informatica', 'Programacion en R', 'Lunes y Miercores 18:00- 20:00', 'CN36', 'VIRTUAL', '--', 'activo', '2025-11-08 13:35:21', '2025-11-08 13:52:46'),
	(44, 'CURSOS LIBRES', 'Big Data', 'LUN-MIE-VIE [ 8:00 am.-12:00 pm. ]', 'CL17', 'VIRTUAL', 'Prof. Mendoza', 'activo', '2025-11-08 13:37:50', '2025-11-08 13:37:50'),
	(45, 'CURSOS LIBRES', 'Power BI', 'LUN-MIE-VIE [ 4:00 pm.-7:00 pm. ]', 'CL4', 'VIRTUAL', 'Prof. Rodr├¡guez', 'activo', '2025-11-08 13:37:54', '2025-11-08 13:37:54');

-- Volcando estructura para tabla infouna.matriculas
CREATE TABLE IF NOT EXISTS `matriculas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `curso_id` int NOT NULL,
  `fecha_matricula` date DEFAULT NULL,
  `estado` enum('activo','completado','cancelado') DEFAULT 'activo',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `curso_id` (`curso_id`),
  CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.matriculas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla infouna.modal_promocional
CREATE TABLE IF NOT EXISTS `modal_promocional` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `subtitulo` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `imagen` varchar(500) DEFAULT NULL,
  `video_tiktok_url` varchar(500) DEFAULT NULL,
  `facebook_url` varchar(500) DEFAULT NULL,
  `tipo` enum('descuento','nuevo','gratis','cronograma','flyer','video','facebook') NOT NULL DEFAULT 'nuevo',
  `codigo_promocional` varchar(50) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `valido_hasta` varchar(100) DEFAULT NULL,
  `gradiente` varchar(100) DEFAULT 'from-blue-500 to-purple-600',
  `activo` tinyint(1) DEFAULT '1',
  `orden` int DEFAULT '0',
  `url_accion` varchar(500) DEFAULT NULL,
  `texto_boton_primario` varchar(100) DEFAULT 'Inscr├¡bete',
  `texto_boton_secundario` varchar(100) DEFAULT 'Ver Programas',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.modal_promocional: ~4 rows (aproximadamente)
INSERT INTO `modal_promocional` (`id`, `titulo`, `subtitulo`, `descripcion`, `imagen`, `video_tiktok_url`, `facebook_url`, `tipo`, `codigo_promocional`, `fecha_inicio`, `fecha_fin`, `valido_hasta`, `gradiente`, `activo`, `orden`, `url_accion`, `texto_boton_primario`, `texto_boton_secundario`, `created_at`, `updated_at`) VALUES
	(11, 'Cronograma', 'Nuevo Cronograma', 'Nuevo Cronograma', '/uploads/modal/modal-1762703704176-276996483.png', NULL, NULL, 'flyer', NULL, '2025-10-27', '2025-11-28', NULL, NULL, 1, 1, NULL, NULL, NULL, '2025-11-08 15:42:15', '2025-11-09 15:56:27'),
	(14, 'demo', NULL, NULL, '/uploads/modal/modal-1762650987608-232638368.jpg', NULL, NULL, 'flyer', NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-11-09 01:16:27', '2025-11-09 01:25:04'),
	(19, 'primero', NULL, 'aviso1', '/uploads/modal/modal-1762703817632-16666403.png', NULL, NULL, 'cronograma', NULL, '2025-11-09', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-11-09 01:33:37', '2025-11-09 15:56:57'),
	(20, 'face', NULL, NULL, NULL, NULL, 'https://www.facebook.com/photo/?fbid=122212448282273835&set=a.122096606456273835', 'facebook', NULL, '2025-11-09', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-11-09 01:49:18', '2025-11-09 01:58:48');

-- Volcando estructura para tabla infouna.modulos
CREATE TABLE IF NOT EXISTS `modulos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `numero` varchar(20) DEFAULT NULL,
  `programa_id` int NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_modulos_programa` (`programa_id`),
  CONSTRAINT `fk_modulos_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.modulos: ~5 rows (aproximadamente)
INSERT INTO `modulos` (`id`, `nombre`, `descripcion`, `numero`, `programa_id`, `estado`, `created_at`, `updated_at`) VALUES
	(1, 'Especialista en Ofimatica', '---', 'I', 1, 'activo', '2025-11-06 14:43:26', '2025-11-06 14:48:15'),
	(2, 'Especialista en Analisis y Programacion', '---', 'II', 1, 'activo', '2025-11-06 14:53:56', '2025-11-06 14:53:56'),
	(3, 'Esoecialista en Administracion de Base de Datos', '---', 'III', 1, 'activo', '2025-11-06 14:54:17', '2025-11-06 14:54:17'),
	(4, 'Modulo IV Especialista en Sistemas CAD Basico', '---', 'IV', 2, 'activo', '2025-11-06 15:04:17', '2025-11-06 15:04:17'),
	(5, 'Modulo V Especialista en Sistemas CAD Intermedio', '---', 'V', 2, 'activo', '2025-11-06 15:04:56', '2025-11-06 15:04:56'),
	(6, 'Especialista en AutoCAD', '---', 'XIV', 10, 'activo', '2025-11-06 17:49:34', '2025-11-06 19:48:57'),
	(7, 'Software de Oficina y Diseño', NULL, 'I', 1, 'activo', '2025-11-08 04:52:26', '2025-11-08 04:52:26');

-- Volcando estructura para tabla infouna.programas
CREATE TABLE IF NOT EXISTS `programas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `duracion` varchar(50) DEFAULT NULL,
  `modalidad` enum('presencial','virtual','hibrido') DEFAULT 'presencial',
  `precio` decimal(10,2) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `imagen` varchar(255) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.programas: ~13 rows (aproximadamente)
INSERT INTO `programas` (`id`, `nombre`, `descripcion`, `duracion`, `modalidad`, `precio`, `estado`, `imagen`, `color`, `icono`, `creado_en`) VALUES
	(1, 'Tecnico en Computacion e Informatica', 'Computacion e Informatica', '6 meses', 'presencial', 1200.00, 'activo', '/uploads/programas/programa-1762426665108-691698003.png', '#bfdc89', 'FaDesktop', '2025-10-23 19:32:10'),
	(2, 'Tecnico en Informatica para Ingenierias', 'Cursos de AutoCAD desde nivel b??sico hasta avanzado para dise??o t??cnico profesional', '6 meses', 'presencial', 1200.00, 'activo', '/uploads/programas/programa-1762426674252-483848843.png', '#a69b9b', 'FaDesktop', '2025-10-23 19:32:10'),
	(3, 'Ciencia de Datos', 'Profesionales que desean mejorar sus habilidades en Excel', '4 meses', 'presencial', 800.00, 'activo', '/uploads/programas/programa-1762426705398-556859525.png', '#1b76bb', 'FaChartBar', '2025-10-23 19:32:10'),
	(4, 'Especialista en Excel', 'Profesionales que desean mejorar sus habilidades en Excel', '3 meses', 'virtual', 600.00, 'activo', '/uploads/programas/programa-1762426717022-645942248.png', '#0d7214', 'FaChartBar', '2025-10-23 19:32:10'),
	(5, 'Desarrollo Software', 'Profesionales que desean mejorar sus habilidades en Excel', '5 meses', 'virtual', 1000.00, 'activo', '/uploads/programas/programa-1762426727660-505733093.png', '#7028c8', 'FaChartBar', '2025-10-23 19:32:10'),
	(6, 'Ciberseguridad y Redes', 'Sistemas de comunicaci??n entre humanos y computadoras para desarrollar software y resolver problemas espec??ficos', '6 meses', 'virtual', 1100.00, 'activo', '/uploads/programas/programa-1762426740989-17650977.png', '#161ddf', 'FaLaptopCode', '2025-10-23 19:32:10'),
	(7, 'Informatica Para Docentes', 'Sistemas de comunicaci??n entre humanos y computadoras para desarrollar software y resolver problemas espec??ficos', '4 meses', 'virtual', 700.00, 'activo', '/uploads/programas/programa-1762426755111-113254976.png', '#61c274', 'FaLaptopCode', '2025-10-23 19:32:10'),
	(8, 'Informatica para Investigacion', 'Formaci??n en administraci??n de redes y seguridad inform??tica', '5 meses', 'virtual', 900.00, 'activo', '/uploads/programas/programa-1762426778719-281249568.png', '#2d2966', 'FaShieldAlt', '2025-10-23 19:32:10'),
	(9, 'Programacion Robotica', 'Introducci??n y aplicaciones pr??cticas de IA y aprendizaje autom??tico', '6 meses', 'virtual', 1300.00, 'activo', '/uploads/programas/programa-1762426794863-806581805.png', '#867e7e', 'FaBrain', '2025-10-23 19:32:10'),
	(10, 'Autocad', 'Dise??o, administraci??n y optimizaci??n de bases de datos', '4 meses', 'virtual', 800.00, 'activo', '/uploads/programas/programa-1762426811273-987541611.png', '#b64343', 'FaDatabase', '2025-10-23 19:32:10'),
	(53, 'Especialista en Programación Web', 'Desarrollo completo de aplicaciones web modernas con tecnologías actuales', '8 meses', 'virtual', 1200.00, 'activo', '/uploads/programas/programa-1762426854520-512013160.png', '#585496', 'AcademicCapIcon', '2025-11-05 13:49:06'),
	(54, 'Especialista en Diseño Gráfico', 'Domina las herramientas de diseño más utilizadas en la industria', '5 meses', 'presencial', 900.00, 'activo', '/uploads/programas/programa-1762426526136-354086437.png', '#EC4899', 'AcademicCapIcon', '2025-11-05 13:49:06');

-- Volcando estructura para tabla infouna.reclamaciones
CREATE TABLE IF NOT EXISTS `reclamaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `estado` enum('pendiente','en proceso','resuelto') DEFAULT 'pendiente',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `reclamaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.reclamaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla infouna.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.users: ~0 rows (aproximadamente)
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES
	(1, 'infoadmin', '$2b$10$/zIYwMyVOyw.WPgOUcaKtemV6peu5jWV1aqT.Y.EBCV1DmwVfG.Zi', 'Administrador', 'admin@infouna.edu.pe', 'admin', '2025-10-23 19:32:10'),
	(8, 'infousuario', '$2b$10$61nRdjW4Gmx6cizYjidWJOVfLkR7qXkaPNJYJ7umpySwCmhxrCYXG', 'usuario nuevo', 'usuario@infouna.edu.pe', 'user', '2025-11-05 13:31:37'),
	(9, 'usuario1', '$2b$10$H6icV5XTREES3bVJOzOLIOZuSyXxt7PnD0deMsXjJnZJKb6StPWk6', 'usuario1 nuevo', 'usuario1@infouna.edu.pe', 'user', '2025-11-08 02:35:07');

-- Volcando estructura para tabla infouna.videos_informativos
CREATE TABLE IF NOT EXISTS `videos_informativos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `youtube_url` varchar(500) NOT NULL,
  `youtube_id` varchar(50) NOT NULL,
  `categoria` enum('tutorial','promocion','informativo','otro') DEFAULT 'informativo',
  `nombre_testimonio` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `orden` int DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla infouna.videos_informativos: ~3 rows (aproximadamente)
INSERT INTO `videos_informativos` (`id`, `titulo`, `descripcion`, `youtube_url`, `youtube_id`, `categoria`, `nombre_testimonio`, `activo`, `orden`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'C├│mo matricularte en INFOUNA - Paso a paso', 'Tutorial completo para realizar tu matr├¡cula en l├¡nea de forma r├ípida y sencilla.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'tutorial', 'Equipo INFOUNA', 1, 1, '2025-10-24 00:58:52', '2025-10-24 00:58:52'),
	(2, 'Conoce nuestros cursos de AutoCAD', 'Descubre todo lo que aprender├ís en nuestros cursos de dise├▒o t├®cnico con AutoCAD.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'promocion', 'Instructor CAD', 1, 2, '2025-10-24 00:58:52', '2025-10-24 00:58:52'),
	(3, 'Requisitos para la matr├¡cula 2024', 'Informaci├│n importante sobre los documentos y requisitos necesarios para tu inscripci├│n.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'informativo', 'Admisiones INFOUNA', 1, 3, '2025-10-24 00:58:52', '2025-10-24 00:58:52');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

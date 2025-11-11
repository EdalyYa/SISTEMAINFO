const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const PDFGeneratorService = require('../services/PDFGeneratorService');

// Función para generar código de verificación único
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para formatear fechas
function formatDateSpanish(startDate, endDate) {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `del ${start.getDate()} al ${end.getDate()} de ${months[start.getMonth()]} del año ${start.getFullYear()}`;
  } else {
    return `del ${start.getDate()} de ${months[start.getMonth()]} al ${end.getDate()} de ${months[end.getMonth()]} del año ${end.getFullYear()}`;
  }
}

// Obtener todos los certificados
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        dni,
        nombre_completo,
        tipo_certificado,
        nombre_evento,
        descripcion_evento,
        fecha_inicio,
        fecha_fin,
        horas_academicas,
        codigo_verificacion,
        fecha_emision,
        activo,
        CONCAT(
          'del ', DAY(fecha_inicio), 
          CASE 
            WHEN MONTH(fecha_inicio) = MONTH(fecha_fin) AND YEAR(fecha_inicio) = YEAR(fecha_fin)
            THEN CONCAT(' al ', DAY(fecha_fin), ' de ',
              CASE MONTH(fecha_inicio)
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
              END, ' del año ', YEAR(fecha_inicio))
            ELSE CONCAT(' de ',
              CASE MONTH(fecha_inicio)
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
              END, ' al ', DAY(fecha_fin), ' de ',
              CASE MONTH(fecha_fin)
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
              END, ' del año ', YEAR(fecha_fin))
          END
        ) as periodo_evento
      FROM certificados 
      WHERE activo = 1
      ORDER BY fecha_emision DESC
    `;
    
    const [certificados] = await db.execute(query);
    res.json(certificados);
  } catch (error) {
    console.error('Error fetching certificados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Buscar certificados por DNI
router.post('/buscar', auth, adminAuth, async (req, res) => {
  try {
    const { dni } = req.body;
    
    if (!dni || dni.length !== 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'DNI debe tener exactamente 8 dígitos' 
      });
    }
    
    const query = `
      SELECT 
        id,
        dni,
        nombre_completo,
        tipo_certificado,
        nombre_evento,
        descripcion_evento,
        fecha_inicio,
        fecha_fin,
        horas_academicas,
        codigo_verificacion,
        fecha_emision,
        activo,
        CONCAT(
          'del ', DAY(fecha_inicio), 
          CASE 
            WHEN MONTH(fecha_inicio) = MONTH(fecha_fin) AND YEAR(fecha_inicio) = YEAR(fecha_fin)
            THEN CONCAT(' al ', DAY(fecha_fin), ' de ',
              CASE MONTH(fecha_inicio)
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
              END, ' del año ', YEAR(fecha_inicio))
            ELSE CONCAT(' de ',
              CASE MONTH(fecha_inicio)
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
              END, ' al ', DAY(fecha_fin), ' de ',
              CASE MONTH(fecha_fin)
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
              END, ' del año ', YEAR(fecha_fin))
          END
        ) as periodo_evento
      FROM certificados 
      WHERE dni = ? AND activo = 1
      ORDER BY fecha_emision DESC
    `;
    
    const [certificados] = await db.execute(query, [dni]);
    
    if (certificados.length === 0) {
      return res.json({ 
        success: false, 
        message: 'No se encontraron certificados para este DNI',
        certificados: []
      });
    }
    
    res.json({ 
      success: true, 
      message: `Se encontraron ${certificados.length} certificado(s)`,
      certificados 
    });
  } catch (error) {
    console.error('Error searching certificados:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Crear nuevo certificado
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      dni,
      nombre_completo,
      tipo_certificado,
      nombre_evento,
      descripcion_evento,
      fecha_inicio,
      fecha_fin,
      horas_academicas,
      plantilla_certificado
    } = req.body;
    
    // Validaciones
    if (!dni || dni.length !== 8) {
      return res.status(400).json({ error: 'DNI debe tener exactamente 8 dígitos' });
    }
    
    if (!nombre_completo || !tipo_certificado || !nombre_evento || !fecha_inicio || !fecha_fin || !horas_academicas) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }
    
    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin' });
    }
    
    if (parseInt(horas_academicas) < 1) {
      return res.status(400).json({ error: 'Las horas académicas deben ser mayor a 0' });
    }
    
    // Verificar si ya existe un certificado para este DNI y evento
    const [existing] = await db.execute(
      'SELECT id FROM certificados WHERE dni = ? AND nombre_evento = ? AND activo = 1',
      [dni, nombre_evento]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un certificado activo para este DNI y evento' 
      });
    }
    
    // Generar código de verificación único
    let codigo_verificacion;
    let isUnique = false;
    
    while (!isUnique) {
      codigo_verificacion = generateVerificationCode();
      const [existingCode] = await db.execute(
        'SELECT id FROM certificados WHERE codigo_verificacion = ?',
        [codigo_verificacion]
      );
      if (existingCode.length === 0) {
        isUnique = true;
      }
    }
    
    // Insertar certificado
    const query = `
      INSERT INTO certificados (
        dni, nombre_completo, tipo_certificado, nombre_evento, 
        descripcion_evento, fecha_inicio, fecha_fin, horas_academicas,
        codigo_verificacion, plantilla_certificado, fecha_emision, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
    `;
    
    const [result] = await db.execute(query, [
      dni,
      nombre_completo,
      tipo_certificado,
      nombre_evento,
      descripcion_evento || null,
      fecha_inicio,
      fecha_fin,
      parseInt(horas_academicas),
      codigo_verificacion,
      plantilla_certificado || 'seminario-desarrollo.svg'
    ]);
    
    res.status(201).json({
      message: 'Certificado creado exitosamente',
      id: result.insertId,
      codigo_verificacion
    });
  } catch (error) {
    console.error('Error creating certificado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar certificado por código
router.post('/verificar', async (req, res) => {
  try {
    const { codigo } = req.body;
    
    if (!codigo) {
      return res.json({ 
        success: false, 
        message: 'Código de verificación requerido' 
      });
    }
    
    const query = `
      SELECT 
        id,
        dni,
        nombre_completo,
        tipo_certificado,
        nombre_evento,
        descripcion_evento,
        fecha_inicio,
        fecha_fin,
        horas_academicas,
        codigo_verificacion,
        DATE_FORMAT(fecha_emision, '%d/%m/%Y') as fecha_emision,
        activo,
        CONCAT(
          'del ', DAY(fecha_inicio), 
          CASE 
            WHEN MONTH(fecha_inicio) = MONTH(fecha_fin) AND YEAR(fecha_inicio) = YEAR(fecha_fin)
            THEN CONCAT(' al ', DAY(fecha_fin), ' de ',
              CASE MONTH(fecha_inicio)
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
              END, ' del año ', YEAR(fecha_inicio))
            ELSE CONCAT(' de ',
              CASE MONTH(fecha_inicio)
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
              END, ' al ', DAY(fecha_fin), ' de ',
              CASE MONTH(fecha_fin)
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
              END, ' del año ', YEAR(fecha_fin))
          END
        ) as periodo_evento
      FROM certificados 
      WHERE codigo_verificacion = ?
    `;
    
    const [certificados] = await db.execute(query, [codigo]);
    
    if (certificados.length === 0) {
      return res.json({ 
        success: false, 
        message: 'Código de verificación no válido o certificado no encontrado' 
      });
    }
    
    const certificado = certificados[0];
    
    if (!certificado.activo) {
      return res.json({ 
        success: false, 
        message: 'Este certificado ha sido desactivado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Certificado válido',
      certificado 
    });
  } catch (error) {
    console.error('Error verifying certificado:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Desactivar certificado
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute(
      'UPDATE certificados SET activo = 0 WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado' });
    }
    
    res.json({ message: 'Certificado desactivado exitosamente' });
  } catch (error) {
    console.error('Error deleting certificado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar campos de un certificado
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dni,
      nombre_completo,
      tipo_certificado,
      nombre_evento,
      descripcion_evento,
      fecha_inicio,
      fecha_fin,
      horas_academicas,
      fecha_emision,
      activo
    } = req.body;

    // Validaciones básicas
    if (dni && dni.length !== 8) {
      return res.status(400).json({ error: 'DNI debe tener exactamente 8 dígitos' });
    }
    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin' });
    }
    if (horas_academicas && parseInt(horas_academicas) < 1) {
      return res.status(400).json({ error: 'Las horas académicas deben ser mayor a 0' });
    }

    // Construir actualización dinámica solo con campos provistos
    const fields = [];
    const values = [];
    const push = (col, val) => { fields.push(`${col} = ?`); values.push(val); };

    if (dni !== undefined) push('dni', dni);
    if (nombre_completo !== undefined) push('nombre_completo', nombre_completo);
    if (tipo_certificado !== undefined) push('tipo_certificado', tipo_certificado);
    if (nombre_evento !== undefined) push('nombre_evento', nombre_evento);
    if (descripcion_evento !== undefined) push('descripcion_evento', descripcion_evento || null);
    if (fecha_inicio !== undefined) push('fecha_inicio', fecha_inicio);
    if (fecha_fin !== undefined) push('fecha_fin', fecha_fin);
    if (horas_academicas !== undefined) push('horas_academicas', parseInt(horas_academicas));
    if (fecha_emision !== undefined) push('fecha_emision', fecha_emision);
    if (activo !== undefined) push('activo', activo ? 1 : 0);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    const sql = `UPDATE certificados SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await db.execute(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado' });
    }

    res.json({ message: 'Certificado actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando certificado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generar PDF del certificado usando servicio centralizado
router.get('/pdf/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { download } = req.query;
    
    // Buscar certificado con su diseño personalizado
    const query = `
      SELECT 
        c.dni,
        c.nombre_completo,
        c.tipo_certificado,
        c.nombre_evento,
        c.descripcion_evento,
        c.fecha_inicio,
        c.fecha_fin,
        c.horas_academicas,
        c.codigo_verificacion,
        c.plantilla_certificado,
        dc.configuracion,
        dc.logo_izquierdo,
        dc.logo_derecho,
        dc.fondo_certificado,
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
      LEFT JOIN disenos_certificados dc ON CAST(SUBSTRING(c.plantilla_certificado, 8, LENGTH(c.plantilla_certificado) - 11) AS UNSIGNED) = dc.id
      WHERE c.codigo_verificacion = ? AND c.activo = 1
    `;
    
    const [certificados] = await db.execute(query, [codigo]);
    
    if (certificados.length === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado o inactivo' });
    }
    
    const certificado = certificados[0];
    
    // Preparar configuración de plantilla
    // Preparar configuración de plantilla con fallback a certiinfo.png
    let templateConfig = {
      configuracion: certificado.configuracion,
      logo_izquierdo: certificado.logo_izquierdo,
      logo_derecho: certificado.logo_derecho,
      fondo_certificado: certificado.fondo_certificado
    };

    if (!templateConfig.fondo_certificado) {
      try {
        const defaultConfigPath = path.join(__dirname, '..', 'uploads', 'certificados', 'plantillas', 'config_certificado_A4.json');
        let configJson = null;
        if (fs.existsSync(defaultConfigPath)) {
          configJson = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
        }
        templateConfig = {
          configuracion: configJson || {
            nombreInstituto: { x: 221, y: 40, fontSize: 16, color: '#1e293b', fontWeight: 'bold' },
            titulo: { x: 221, y: 90, fontSize: 38, color: '#0f172a', fontWeight: 'bold' },
            otorgado: { x: 221, y: 150, fontSize: 14, color: '#334155' },
            nombreEstudiante: { x: 221, y: 195, fontSize: 30, color: '#000000', fontWeight: 'bold' },
            descripcion: { x: 196, y: 240, fontSize: 14, color: '#000000' },
            fecha: { x: 221, y: 290, fontSize: 12, color: '#000000' },
            codigo: { x: 221, y: 325, fontSize: 10, color: '#666666' },
            qr: { x: 680, y: 370, width: 130 }
          },
          fondo_certificado: path.join('plantillas', 'certificado_A4.png')
        };
      } catch (cfgErr) {
        console.warn('No se pudo cargar configuración por defecto de certiinfo.png:', cfgErr.message);
      }
    }
    
    // Usar servicio centralizado para generar PDF
    const pdfGeneratorService = new PDFGeneratorService();
    const pdfBuffer = await pdfGeneratorService.generateCertificatePDF(certificado, templateConfig, true);
    
    // Configurar headers para visualización o descarga según query
    res.setHeader('Content-Type', 'application/pdf');
    const sanitizeName = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const nombreArchivo = sanitizeName(certificado.nombre_completo) || 'Estudiante';
    const fileName = `certificado_${nombreArchivo}_INF-UNA.pdf`;
    const isDownload = String(download).toLowerCase() === '1' || String(download).toLowerCase() === 'true';
    res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
    
    // Enviar PDF
    res.send(pdfBuffer);
    
    console.log('✅ PDF generado usando servicio centralizado (Admin)');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});

// Vista previa de PDF desde datos proporcionados (sin DB)
router.post('/preview-pdf', auth, adminAuth, async (req, res) => {
  try {
    const body = req.body || {};

    // Construir objeto de certificado con campos mínimos requeridos
    const certificado = {
      dni: body.dni || '00000000',
      nombre_completo: body.nombre_completo || body.nombre || 'Estudiante de Ejemplo',
      tipo_certificado: body.tipo_certificado || body.tipo || 'CERTIFICADO',
      nombre_evento: body.nombre_evento || body.evento || 'Curso de Ejemplo',
      descripcion_evento: body.descripcion_evento || body.descripcion || 'Por su destacada participación y culminación satisfactoria.',
      fecha_inicio: body.fecha_inicio || '2024-10-01',
      fecha_fin: body.fecha_fin || '2024-10-15',
      horas_academicas: body.horas_academicas || body.horas || 20,
      codigo_verificacion: (body.codigo_verificacion || '').toUpperCase().match(/^[A-Z0-9]{6}$/) ? (body.codigo_verificacion || '').toUpperCase() : generateVerificationCode(),
      periodo_evento: body.periodo_evento || null
    };

    // Preparar configuración de plantilla con fallback a certificado_A4
    let templateConfig = {
      configuracion: body.configuracion || null,
      logo_izquierdo: body.logo_izquierdo || null,
      logo_derecho: body.logo_derecho || null,
      fondo_certificado: body.fondo_certificado || null
    };

    if (!templateConfig.fondo_certificado) {
      try {
        const defaultConfigPath = path.join(__dirname, '..', 'uploads', 'certificados', 'plantillas', 'config_certificado_A4.json');
        let configJson = null;
        if (fs.existsSync(defaultConfigPath)) {
          configJson = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
        }
        templateConfig = {
          configuracion: configJson || {
            nombreInstituto: { x: 221, y: 40, fontSize: 16, color: '#1e293b', fontWeight: 'bold' },
            titulo: { x: 221, y: 90, fontSize: 38, color: '#0f172a', fontWeight: 'bold' },
            otorgado: { x: 221, y: 150, fontSize: 14, color: '#334155' },
            nombreEstudiante: { x: 221, y: 195, fontSize: 30, color: '#000000', fontWeight: 'bold' },
            descripcion: { x: 196, y: 240, fontSize: 14, color: '#000000' },
            fecha: { x: 221, y: 290, fontSize: 12, color: '#000000' },
            codigo: { x: 221, y: 325, fontSize: 10, color: '#666666' },
            qr: { x: 680, y: 370, width: 130 }
          },
          fondo_certificado: path.join('plantillas', 'certificado_A4.png')
        };
      } catch (cfgErr) {
        console.warn('No se pudo cargar configuración por defecto para certificado_A4.png:', cfgErr.message);
      }
    }

    // Generar PDF de vista previa (sin marca de agua)
    const pdfGeneratorService = new PDFGeneratorService();
    const pdfBuffer = await pdfGeneratorService.generatePreview(certificado, templateConfig);

    // Configurar headers para visualización inline
    res.setHeader('Content-Type', 'application/pdf');
    const sanitize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const nombreFile = sanitize(certificado.nombre_completo) || 'Estudiante';
    const fileName = `certificado_${nombreFile}_INF-UNA.pdf`;
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error en vista previa de PDF:', error);
    res.status(500).json({ error: 'Error al generar la vista previa del PDF' });
  }
});

// Obtener diseños de certificados guardados
router.get('/disenos', auth, adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        nombre,
        configuracion,
        fondo_certificado as fondoCertificado,
        logo_izquierdo as logoIzquierdo,
        logo_derecho as logoDerecho,
        created_at,
        updated_at
      FROM disenos_certificados 
      ORDER BY created_at DESC
    `);
    
    // Parsear la configuración JSON para cada diseño
    const disenosConConfiguracion = rows.map(diseno => ({
      ...diseno,
      configuracion: typeof diseno.configuracion === 'string' 
        ? JSON.parse(diseno.configuracion) 
        : diseno.configuracion
    }));
    
    res.json(disenosConConfiguracion);
  } catch (error) {
    console.error('Error fetching certificate designs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener diseños de certificados'
    });
  }
});

// Obtener diseño específico por ID
router.get('/disenos/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        id,
        nombre,
        configuracion,
        fondo_certificado as fondoCertificado,
        logo_izquierdo as logoIzquierdo,
        logo_derecho as logoDerecho,
        activa,
        created_at,
        updated_at
      FROM disenos_certificados 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }
    
    const diseno = rows[0];
    diseno.configuracion = typeof diseno.configuracion === 'string' 
      ? JSON.parse(diseno.configuracion) 
      : diseno.configuracion;
    
    res.json(diseno);
  } catch (error) {
    console.error('Error fetching certificate design:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener diseño de certificado'
    });
  }
});

// Guardar diseño de certificado
const multer = require('multer');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/certificados');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

router.post('/disenos', 
  auth, 
  adminAuth, 
  upload.fields([
    { name: 'fondoCertificado', maxCount: 1 },
    { name: 'logoIzquierdo', maxCount: 1 },
    { name: 'logoDerecho', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { nombre, configuracion, logoIzquierdoUrl, logoDerechoUrl, fondoCertificadoUrl } = req.body;
      
      if (!nombre || !configuracion) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y configuración son obligatorios'
        });
      }
      
      // Procesar archivos subidos o URLs existentes
      const fondoCertificado = req.files?.fondoCertificado?.[0] 
        ? `/uploads/certificados/${req.files.fondoCertificado[0].filename}` 
        : fondoCertificadoUrl || null;
      const logoIzquierdo = req.files?.logoIzquierdo?.[0] 
        ? `/uploads/certificados/${req.files.logoIzquierdo[0].filename}` 
        : logoIzquierdoUrl || null;
      const logoDerecho = req.files?.logoDerecho?.[0] 
        ? `/uploads/certificados/${req.files.logoDerecho[0].filename}` 
        : logoDerechoUrl || null;
      
      // Convertir configuracion a JSON string si es un objeto
      const configuracionJSON = typeof configuracion === 'object' 
        ? JSON.stringify(configuracion) 
        : configuracion;
      
      const [result] = await db.execute(`
        INSERT INTO disenos_certificados (
          nombre, configuracion, fondo_certificado, logo_izquierdo, logo_derecho
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        nombre,
        configuracionJSON,
        fondoCertificado,
        logoIzquierdo,
        logoDerecho
      ]);
      
      res.status(201).json({
        success: true,
        message: 'Diseño guardado exitosamente',
        diseno: {
          id: result.insertId,
          nombre,
          configuracion: typeof configuracion === 'object' ? configuracion : JSON.parse(configuracion),
          fondoCertificado,
          logoIzquierdo,
          logoDerecho
        }
      });
    } catch (error) {
      console.error('Error saving certificate design:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar diseño'
      });
    }
  }
);

// Activar diseño de certificado
router.put('/disenos/:id/activar', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Desactivar todos los diseños
    await db.execute('UPDATE disenos_certificados SET activa = 0');
    
    // Activar el diseño seleccionado
    const [result] = await db.execute('UPDATE disenos_certificados SET activa = 1 WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Diseño activado exitosamente'
    });
  } catch (error) {
    console.error('Error activating certificate design:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar diseño'
    });
  }
});

// Eliminar diseño de certificado
router.delete('/disenos/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del diseño antes de eliminarlo
    const [existing] = await db.execute('SELECT * FROM disenos_certificados WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }
    
    const diseno = existing[0];
    
    // Eliminar archivos asociados
    const filesToDelete = [diseno.fondoCertificado, diseno.logoIzquierdo, diseno.logoDerecho]
      .filter(file => file)
      .map(file => path.join(__dirname, '..', file));
    
    filesToDelete.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Eliminar registro de la base de datos
    await db.execute('DELETE FROM disenos_certificados WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Diseño eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting certificate design:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar diseño'
    });
  }
});

// Endpoint para guardar certificado con diseño personalizado
router.post('/guardar-con-diseno', auth, adminAuth, async (req, res) => {
  console.log('=== INICIO ENDPOINT guardar-con-diseno ===');
  console.log('req.body:', req.body);
  
  try {
    const {
      datosEstudiante,
      disenoId,
      codigoVerificacion
    } = req.body;
    
    console.log('Datos extraídos:', {
      datosEstudiante,
      disenoId,
      codigoVerificacion
    });

    // Validar datos del estudiante
    const { 
      dni, 
      nombreCompleto, 
      tipoDocumento, 
      nombreEvento, 
      fechaInicio, 
      fechaFin, 
      horasAcademicas, 
      modalidad, 
      observaciones 
    } = datosEstudiante;
    
    if (!dni || !nombreCompleto) {
      return res.status(400).json({ 
        success: false, 
        message: 'DNI y nombre completo son obligatorios' 
      });
    }

    // Obtener datos del diseño
    console.log('Buscando diseño con ID:', disenoId);
    
    if (!disenoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID del diseño es requerido' 
      });
    }
    
    const [disenoResult] = await db.execute(
      'SELECT * FROM disenos_certificados WHERE id = ?',
      [disenoId]
    );

    if (disenoResult.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diseño no encontrado' 
      });
    }

    const diseno = disenoResult[0];

    // Verificar si ya existe un certificado para este DNI y evento
    console.log('Verificando certificado existente:', {
      dni,
      nombreEvento: nombreEvento || diseno.nombre_evento,
      disenoNombreEvento: diseno.nombre_evento
    });
    
    const eventoNombre = nombreEvento || diseno.nombre_evento;
    if (!eventoNombre) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre del evento es requerido' 
      });
    }
    
    const [existing] = await db.execute(
      'SELECT id FROM certificados WHERE dni = ? AND nombre_evento = ? AND activo = 1',
      [dni, eventoNombre]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Ya existe un certificado activo para este DNI y evento' 
      });
    }

    // Generar PDF en memoria primero
    const pdfBuffers = [];
    
    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Capturar el PDF en memoria
    doc.on('data', (chunk) => {
      pdfBuffers.push(chunk);
    });

    // Agregar imagen de fondo si existe
    if (diseno.fondo_certificado) {
      const fondoPath = path.join(__dirname, '../public/uploads', diseno.fondo_certificado);
      if (fs.existsSync(fondoPath)) {
        doc.image(fondoPath, 0, 0, { width: 842, height: 595 });
      }
    }

    // Agregar logos si existen
    if (diseno.logo_izquierdo) {
      const logoIzqPath = path.join(__dirname, '../public/uploads', diseno.logo_izquierdo);
      if (fs.existsSync(logoIzqPath)) {
        doc.image(logoIzqPath, 50, 50, { width: 80, height: 80 });
      }
    }

    if (diseno.logo_derecho) {
      const logoDerPath = path.join(__dirname, '../public/uploads', diseno.logo_derecho);
      if (fs.existsSync(logoDerPath)) {
        doc.image(logoDerPath, 712, 50, { width: 80, height: 80 });
      }
    }

    // Parsear configuración del diseño
    let configuracion = {};
    try {
      configuracion = typeof diseno.configuracion === 'string' 
        ? JSON.parse(diseno.configuracion) 
        : diseno.configuracion || {};
      
      console.log('Configuración del diseño:', {
        disenoId,
        tieneConfiguracion: !!diseno.configuracion,
        tipoConfiguracion: typeof diseno.configuracion,
        elementosEncontrados: configuracion.elementos ? configuracion.elementos.length : 0,
        tieneImagenFondo: !!diseno.imagen_fondo,
        tieneLogoIzquierdo: !!diseno.logo_izquierdo,
        tieneLogoDerecho: !!diseno.logo_derecho
      });
    } catch (e) {
      console.error('Error parsing configuracion:', e);
      configuracion = {};
    }

    // Renderizar imagen de fondo primero si existe
     if (diseno.imagen_fondo) {
       try {
         const fondoPath = path.join(__dirname, '..', 'uploads', diseno.imagen_fondo);
         if (fs.existsSync(fondoPath)) {
           doc.image(fondoPath, 0, 0, {
             width: doc.page.width,
             height: doc.page.height
           });
         }
       } catch (error) {
         console.error('Error renderizando fondo:', error);
       }
     }

     // Renderizar logos si existen
     if (diseno.logo_izquierdo) {
       try {
         const logoPath = path.join(__dirname, '..', 'uploads', diseno.logo_izquierdo);
         if (fs.existsSync(logoPath)) {
           doc.image(logoPath, 50, 50, { width: 80, height: 80 });
         }
       } catch (error) {
         console.error('Error renderizando logo izquierdo:', error);
       }
     }

     if (diseno.logo_derecho) {
       try {
         const logoPath = path.join(__dirname, '..', 'uploads', diseno.logo_derecho);
         if (fs.existsSync(logoPath)) {
           doc.image(logoPath, doc.page.width - 130, 50, { width: 80, height: 80 });
         }
       } catch (error) {
         console.error('Error renderizando logo derecho:', error);
       }
     }

    // Renderizar elementos desde la configuración
     if (configuracion.elementos && Array.isArray(configuracion.elementos)) {
       for (const elemento of configuracion.elementos) {
         if (elemento.tipo === 'texto') {
           let texto = elemento.contenido || elemento.text || '';
           
           // Reemplazar placeholders con datos reales
           texto = texto.replace(/\[NOMBRE_ESTUDIANTE\]/g, nombreCompleto);
           texto = texto.replace(/\[DNI_ESTUDIANTE\]/g, dni);
           texto = texto.replace(/\[TIPO_DOCUMENTO\]/g, tipoDocumento || 'DNI');
           texto = texto.replace(/\[NOMBRE_EVENTO\]/g, diseno.nombre_evento || '');
           texto = texto.replace(/\[DESCRIPCION_EVENTO\]/g, diseno.descripcion_evento || '');
           texto = texto.replace(/\[HORAS_ACADEMICAS\]/g, diseno.horas_academicas || '');
           texto = texto.replace(/\[FECHA_EVENTO\]/g, formatDateSpanish(diseno.fecha_inicio, diseno.fecha_fin));
           texto = texto.replace(/\[CODIGO_VERIFICACION\]/g, codigoVerificacion);

           // Configurar fuente y estilo
           doc.fontSize(elemento.fontSize || elemento.size || 12);
           doc.fillColor(elemento.color || elemento.fill || '#000000');
           
           if (elemento.fontWeight === 'bold' || elemento.bold) {
             doc.font('Helvetica-Bold');
           } else {
             doc.font('Helvetica');
           }

           // Renderizar texto
           doc.text(texto, elemento.x || 0, elemento.y || 0, {
             width: elemento.width || 200,
             align: elemento.textAlign || elemento.align || 'left'
           });
         } else if (elemento.tipo === 'imagen' || elemento.tipo === 'image') {
           try {
             // Renderizar imagen desde base64 o URL
             if (elemento.src || elemento.url) {
               const imageSrc = elemento.src || elemento.url;
               
               // Si es base64, extraer solo los datos
               let imageData = imageSrc;
               if (imageSrc.startsWith('data:image/')) {
                 imageData = imageSrc.split(',')[1];
                 const imageBuffer = Buffer.from(imageData, 'base64');
                 
                 doc.image(imageBuffer, elemento.x || 0, elemento.y || 0, {
                   width: elemento.width || 100,
                   height: elemento.height || 100
                 });
               } else if (imageSrc.startsWith('http')) {
                 // Para URLs externas, necesitarías descargar la imagen primero
                 console.log('URL externa detectada:', imageSrc);
               } else {
                 // Ruta local
                 const imagePath = path.join(__dirname, '..', 'uploads', imageSrc);
                 if (fs.existsSync(imagePath)) {
                   doc.image(imagePath, elemento.x || 0, elemento.y || 0, {
                     width: elemento.width || 100,
                     height: elemento.height || 100
                   });
                 }
               }
             }
           } catch (error) {
             console.error('Error renderizando imagen:', error);
           }
         }
       }
     }



    // Finalizar documento
    doc.end();

    // Esperar a que se complete la generación del PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(pdfBuffers));
      });
      doc.on('error', reject);
    });

    // Insertar certificado en la base de datos con el PDF
    const insertQuery = `
      INSERT INTO certificados (
        dni, nombre_completo, tipo_certificado, nombre_evento, 
        descripcion_evento, fecha_inicio, fecha_fin, horas_academicas,
        codigo_verificacion, plantilla_certificado, fecha_emision, activo, pdf_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, ?)
    `;

    const [result] = await db.execute(insertQuery, [
      dni,
      nombreCompleto,
      diseno.tipo_certificado || 'Participación',
      nombreEvento || diseno.nombre_evento,
      observaciones || diseno.descripcion_evento || null,
      fechaInicio || diseno.fecha_inicio,
      fechaFin || diseno.fecha_fin,
      parseInt(horasAcademicas) || parseInt(diseno.horas_academicas) || 0,
      codigoVerificacion,
      `diseno_${disenoId}.pdf`,
      pdfBuffer
    ]);

    // Crear directorio para PDFs si no existe
    // El PDF ya se generó y almacenó en la base de datos arriba

    res.status(201).json({
      success: true,
      message: 'Certificado guardado exitosamente',
      certificado: {
        id: result.insertId,
        codigo_verificacion: codigoVerificacion,
        pdf_path: `${dni}_${codigoVerificacion}.pdf`,
        nombre_completo: nombreCompleto,
        dni: dni,
        nombre_evento: diseno.nombre_evento
      }
    });

  } catch (error) {
    console.error('=== ERROR EN guardar-con-diseno ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
});

// Endpoint para recuperar PDF desde la base de datos
router.get('/certificado/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el certificado con el PDF
    const [rows] = await db.execute(
      'SELECT pdf_content, nombre_completo, codigo_verificacion FROM certificados WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }

    const certificado = rows[0];

    if (!certificado.pdf_content) {
      return res.status(404).json({
        success: false,
        message: 'PDF no disponible para este certificado'
      });
    }

    // Configurar headers para la descarga del PDF con nombre amigable
    res.setHeader('Content-Type', 'application/pdf');
    const sanitize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const nombreFile = sanitize(certificado.nombre_completo) || 'Estudiante';
    const fileName = `certificado_${nombreFile}_INF-UNA.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el PDF
    res.send(certificado.pdf_content);

  } catch (error) {
    console.error('Error al recuperar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
});

// Endpoint para recuperar PDF por código de verificación
router.get('/certificado/codigo/:codigo/pdf', async (req, res) => {
  try {
    const { codigo } = req.params;

    // Buscar el certificado con el PDF por código de verificación
    const [rows] = await db.execute(
      'SELECT pdf_content, nombre_completo, codigo_verificacion FROM certificados WHERE codigo_verificacion = ?',
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }

    const certificado = rows[0];

    if (!certificado.pdf_content) {
      return res.status(404).json({
        success: false,
        message: 'PDF no disponible para este certificado'
      });
    }

    // Configurar headers para la descarga del PDF con nombre amigable
    res.setHeader('Content-Type', 'application/pdf');
    const sanitize2 = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const nombreFile2 = sanitize2(certificado.nombre_completo) || 'Estudiante';
    const fileName2 = `certificado_${nombreFile2}_INF-UNA.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName2}"`);
    
    // Enviar el PDF
    res.send(certificado.pdf_content);

  } catch (error) {
    console.error('Error al recuperar PDF por código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
});

module.exports = router;

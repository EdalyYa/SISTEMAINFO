const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const PDFGeneratorService = require('../services/PDFGeneratorService');
const CertificateRenderService = require('../services/CertificateRenderService');

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
      ORDER BY id DESC
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
      ORDER BY id DESC
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
    const quick = await CertificateRenderService.renderByCode(db, codigo);
    if (quick) {
      res.setHeader('Content-Type', 'application/pdf');
      const isDownload = String(download).toLowerCase() === '1' || String(download).toLowerCase() === 'true';
      res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${quick.fileName}"`);
      return res.send(quick.buffer);
    }

    // Helper para parsear JSON de forma segura
    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (err) {
        return {};
      }
    };

    // Buscar certificado con su diseño personalizado
    let certificados;
    try {
      const queryNew = `
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
          dc.campos_json,
          dc.fondo_url,
          dc.configuracion,
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
        LEFT JOIN disenos_certificados dc ON COALESCE(
          c.diseno_id,
          CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(c.plantilla_certificado, '.', 1), 'diseno_', -1) AS UNSIGNED)
        ) = dc.id
        WHERE c.codigo_verificacion = ? AND c.activo = 1
      `;
      const [rows] = await db.execute(queryNew, [codigo]);
      certificados = rows;
    } catch (e) {
      // Fallback a columnas antiguas si la consulta falla (p.ej. no existen nuevas columnas)
      const queryOld = `
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
        LEFT JOIN disenos_certificados dc ON 
          CAST(
            SUBSTRING_INDEX(
              SUBSTRING_INDEX(c.plantilla_certificado, '.', 1),
              'diseno_', -1
            ) AS UNSIGNED
          ) = dc.id
        WHERE c.codigo_verificacion = ? AND c.activo = 1
      `;
      const [rows] = await db.execute(queryOld, [codigo]);
      certificados = rows;
    }

    if (!certificados || certificados.length === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado o inactivo' });
    }

    const certificado = certificados[0];

    // Preparar configuración de plantilla priorizando nuevas columnas
    const configJson = certificado.campos_json ? parseJsonSafe(certificado.campos_json) : parseJsonSafe(certificado.configuracion);
    const fondoUrl = certificado.fondo_url || certificado.fondo_certificado || null;

    let templateConfig = {
      configuracion: configJson,
      fondo_certificado: fondoUrl
    };

    // Si no hay configuración en el certificado, buscar la configuración actual del diseño activo
    if (!templateConfig.configuracion || !templateConfig.fondo_certificado) {
      try {
        // Primero intentar obtener el diseño activo actual
        let disenoActivo = null;
        
        // Si el certificado tiene diseno_id, usar ese
        if (certificado.diseno_id) {
          const [rows] = await db.execute('SELECT configuracion, fondo_certificado FROM disenos_certificados WHERE id = ? AND activo = 1', [certificado.diseno_id]);
          if (rows.length > 0) {
            disenoActivo = rows[0];
          }
        }
        
        // Si no hay diseno_id, buscar por el patrón en plantilla_certificado
        if (!disenoActivo && certificado.plantilla_certificado) {
          const match = certificado.plantilla_certificado.match(/diseno_(\d+)/);
          if (match) {
            const disenoId = parseInt(match[1]);
            const [rows] = await db.execute('SELECT configuracion, fondo_certificado FROM disenos_certificados WHERE id = ? AND activo = 1', [disenoId]);
            if (rows.length > 0) {
              disenoActivo = rows[0];
            }
          }
        }
        
        // Si encontramos un diseño activo, usar su configuración
        if (disenoActivo) {
          templateConfig.configuracion = parseJsonSafe(disenoActivo.configuracion);
          templateConfig.fondo_certificado = disenoActivo.fondo_certificado;
        }
        
        // Si aún no hay configuración, usar el fallback por defecto
        if (!templateConfig.configuracion || !templateConfig.fondo_certificado) {
        const defaultConfigPath = path.join(__dirname, '..', 'uploads', 'certificados', 'plantillas', 'config_certificado_A4.json');
        let configJsonDefault = null;
        if (fs.existsSync(defaultConfigPath)) {
          configJsonDefault = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
        }
        templateConfig = {
          configuracion: configJsonDefault || {
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
        }
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
    // Intentar usar columnas nuevas si existen; fallback a columnas antiguas
    let rows;
    try {
      const [r] = await db.execute(`
        SELECT 
          id,
          nombre,
          campos_json,
          fondo_url,
          incluye_qr,
          fondo_certificado,
          configuracion,
          activa,
          created_at,
          updated_at
        FROM disenos_certificados 
        ORDER BY created_at DESC
      `);
      rows = r;
    } catch (_) {
      const [r] = await db.execute(`
        SELECT 
          id,
          nombre,
          configuracion,
          fondo_certificado,
          activa,
          created_at,
          updated_at
        FROM disenos_certificados 
        ORDER BY created_at DESC
      `);
      rows = r;
    }

    const normalizeRow = (row) => {
      // Preferir campos_json si está presente; sino usar configuracion
      let rawCfg = row.campos_json ?? row.configuracion;
      let configuracion;
      try {
        configuracion = typeof rawCfg === 'string' ? JSON.parse(rawCfg) : (rawCfg || {});
      } catch (e) {
        configuracion = {};
      }
      // Normalizar fondo desde BD evitando duplicar prefijo '/uploads/certificados'
      const fondoOrigen = row.fondo_url || row.fondo_certificado || null;
      const fondoCertificado = (() => {
        if (!fondoOrigen) return null;
        const s = String(fondoOrigen);
        // Si ya viene con ruta absoluta del backend (/uploads/...), respetarla
        if (s.startsWith('/')) return s;
        // Si es sólo nombre de archivo, construir ruta completa
        return `/uploads/certificados/${s.replace(/^\/+/, '')}`;
      })();
      return {
        id: row.id,
        nombre: row.nombre,
        configuracion,
        // Ruta de fondo ya normalizada
        fondoCertificado,
        incluye_qr: typeof row.incluye_qr !== 'undefined' ? !!row.incluye_qr : undefined,
        activa: row.activa,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    };

    const disenosConConfiguracion = rows.map(normalizeRow);
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

    // Intentar leer nuevas columnas si existen; fallback a antiguas
    let rows;
    try {
      const [r] = await db.execute(`
        SELECT 
          id,
          nombre,
          campos_json,
          fondo_url,
          incluye_qr,
          fondo_certificado,
          configuracion,
          activa,
          created_at,
          updated_at
        FROM disenos_certificados 
        WHERE id = ?
      `, [id]);
      rows = r;
    } catch (_) {
      const [r] = await db.execute(`
        SELECT 
          id,
          nombre,
          configuracion,
          fondo_certificado,
          activa,
          created_at,
          updated_at
        FROM disenos_certificados 
        WHERE id = ?
      `, [id]);
      rows = r;
    }

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }

    const row = rows[0];
    const rawCfg = row.campos_json ?? row.configuracion;
    let configuracion;
    try {
      configuracion = typeof rawCfg === 'string' ? JSON.parse(rawCfg) : (rawCfg || {});
    } catch (e) {
      configuracion = {};
    }

    // Normalizar fondo evitando duplicar prefijo
    const fondoOrigen = row.fondo_url || row.fondo_certificado || null;
    const fondoCertificado = (() => {
      if (!fondoOrigen) return null;
      const s = String(fondoOrigen);
      if (s.startsWith('/')) return s;
      return `/uploads/certificados/${s.replace(/^\/+/, '')}`;
    })();

    res.json({
      id: row.id,
      nombre: row.nombre,
      configuracion,
      fondoCertificado,
      incluye_qr: typeof row.incluye_qr !== 'undefined' ? !!row.incluye_qr : undefined,
      activa: row.activa,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
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
    ]), 
  async (req, res) => {
    try {
      const { nombre, configuracion, fondoCertificadoUrl } = req.body;
      
      // Desde ahora solo requerimos el nombre; la configuración será opcional.
      // Si no se envía, se guarda un objeto vacío por defecto para cumplir con la columna JSON NOT NULL.
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la plantilla es obligatorio'
        });
      }
      
      // Procesar archivos subidos o URLs existentes
      const fondoCertificado = req.files?.fondoCertificado?.[0] 
        ? `/uploads/certificados/${req.files.fondoCertificado[0].filename}` 
        : fondoCertificadoUrl || null;
      // Campos de logos eliminados del flujo
      
      // Convertir configuracion a JSON string si es un objeto
      const configuracionJSON = (() => {
        if (typeof configuracion === 'object') return JSON.stringify(configuracion);
        if (typeof configuracion === 'string' && configuracion.trim().length) return configuracion;
        // Valor por defecto seguro
        return JSON.stringify({});
      })();
      
      const [result] = await db.execute(`
        INSERT INTO disenos_certificados (
          nombre, configuracion, fondo_certificado
        ) VALUES (?, ?, ?)
      `, [
        nombre,
        configuracionJSON,
        fondoCertificado
      ]);
      
      res.status(201).json({
        success: true,
        message: 'Diseño guardado exitosamente',
        diseno: {
          id: result.insertId,
          nombre,
          configuracion: (typeof configuracion === 'object') 
            ? configuracion 
            : (typeof configuracion === 'string' && configuracion.trim().length ? JSON.parse(configuracion) : {}),
          fondoCertificado
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

// Subida directa de imagen de fondo desde el editor (endpoint usado por el panel)
router.post('/disenos/upload', auth, adminAuth, upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se envió archivo' });
    }
    const url = `/uploads/certificados/${req.file.filename}`;
    return res.json({ success: true, url });
  } catch (err) {
    console.error('Error en subida de imagen de fondo:', err);
    return res.status(500).json({ success: false, error: 'Error al subir imagen' });
  }
});

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
    const filesToDelete = [diseno.fondo_certificado]
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

    // Preparar configuración para el servicio centralizado (preferir nuevos campos)
    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (err) {
        return {};
      }
    };
    const configJson = diseno.campos_json ? parseJsonSafe(diseno.campos_json) : parseJsonSafe(diseno.configuracion);
    const fondoUrl = diseno.fondo_url || diseno.fondo_certificado || diseno.imagen_fondo || null;

    const certificado = {
      dni,
      nombre_completo: nombreCompleto,
      tipo_certificado: diseno.tipo_certificado || 'Participación',
      nombre_evento: nombreEvento || diseno.nombre_evento,
      descripcion_evento: observaciones || diseno.descripcion_evento || null,
      fecha_inicio: fechaInicio || diseno.fecha_inicio,
      fecha_fin: fechaFin || diseno.fecha_fin,
      horas_academicas: parseInt(horasAcademicas) || parseInt(diseno.horas_academicas) || 0,
      codigo_verificacion: (codigoVerificacion || '').toUpperCase()
    };

    const templateConfig = {
      configuracion: configJson,
      fondo_certificado: fondoUrl
    };

    const pdfGeneratorService = new PDFGeneratorService();
    const pdfBuffer = await pdfGeneratorService.generateCertificatePDF(certificado, templateConfig, true);

    // Helper: verificar si existe una columna en la tabla certificados
    async function columnExists(columnName) {
      try {
        const [rows] = await db.execute(
          `SELECT COUNT(*) AS cnt
           FROM information_schema.columns
           WHERE table_schema = DATABASE()
             AND table_name = 'certificados'
             AND column_name = ?`,
          [columnName]
        );
        return rows[0]?.cnt > 0;
      } catch (e) {
        console.warn('No se pudo verificar columna', columnName, e.message);
        return false;
      }
    }

    // Construir snapshot de configuración usada (preferir nuevos campos)
    const snapshotConfig = {
      configuracion: configJson || {},
      fondo: diseno.fondo_url || diseno.fondo_certificado || diseno.imagen_fondo || null
    };

    // Construir inserción dinámica con columnas opcionales
    const baseColumns = [
      'dni', 'nombre_completo', 'tipo_certificado', 'nombre_evento',
      'descripcion_evento', 'fecha_inicio', 'fecha_fin', 'horas_academicas',
      'codigo_verificacion', 'plantilla_certificado'
    ];
    const baseValues = [
      dni,
      nombreCompleto,
      diseno.tipo_certificado || 'Participación',
      nombreEvento || diseno.nombre_evento,
      observaciones || diseno.descripcion_evento || null,
      fechaInicio || diseno.fecha_inicio,
      fechaFin || diseno.fecha_fin,
      parseInt(horasAcademicas) || parseInt(diseno.horas_academicas) || 0,
      codigoVerificacion,
      `diseno_${disenoId}.pdf`
    ];

    // Determinar columnas opcionales disponibles
    const includeDisenoId = await columnExists('diseno_id');
    const includeConfigUsada = await columnExists('config_usada');
    const includeFondoUsado = await columnExists('fondo_usado');
    const includeLogoIzqUsado = await columnExists('logo_izquierdo_usado');
    const includeLogoDerUsado = await columnExists('logo_derecho_usado');

    if (includeDisenoId) {
      baseColumns.push('diseno_id');
      baseValues.push(disenoId);
    }
    if (includeConfigUsada) {
      baseColumns.push('config_usada');
      baseValues.push(JSON.stringify(snapshotConfig));
    }
    if (includeFondoUsado) {
      baseColumns.push('fondo_usado');
      baseValues.push(diseno.fondo_certificado || diseno.imagen_fondo || null);
    }
    if (includeLogoIzqUsado) {
      baseColumns.push('logo_izquierdo_usado');
      baseValues.push(null);
    }
    if (includeLogoDerUsado) {
      baseColumns.push('logo_derecho_usado');
      baseValues.push(null);
    }

    // Construir placeholders dinámicos: base + NOW(), 1, pdf_content
    const placeholders = baseColumns.map(() => '?').join(', ');
    const insertQuery = `
      INSERT INTO certificados (${baseColumns.join(', ')}, fecha_emision, activo, pdf_content)
      VALUES (${placeholders}, NOW(), 1, ?)
    `;

    const [result] = await db.execute(insertQuery, [
      ...baseValues,
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

// Actualizar certificado existente con un diseño específico (regenerar PDF y plantilla)
router.put('/actualizar-con-diseno', auth, adminAuth, async (req, res) => {
  try {
    const {
      datosEstudiante,
      disenoId,
      codigoVerificacion
    } = req.body;

    if (!datosEstudiante || !datosEstudiante.dni) {
      return res.status(400).json({ success: false, message: 'Datos del estudiante (DNI) son requeridos' });
    }

    const {
      dni,
      nombreCompleto,
      nombreEvento,
      fechaInicio,
      fechaFin,
      horasAcademicas,
      observaciones
    } = datosEstudiante;

    // Buscar certificado activo existente por DNI y evento
    const [existingRows] = await db.execute(
      'SELECT * FROM certificados WHERE dni = ? AND nombre_evento = ? AND activo = 1 ORDER BY id DESC LIMIT 1',
      [dni, nombreEvento]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No existe certificado activo para este DNI y evento' });
    }

    const certificadoPrevio = existingRows[0];

    // Obtener datos del diseño
    if (!disenoId) {
      return res.status(400).json({ success: false, message: 'ID del diseño es requerido' });
    }

    const [disenoResult] = await db.execute(
      'SELECT * FROM disenos_certificados WHERE id = ?',
      [disenoId]
    );

    if (disenoResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Diseño no encontrado' });
    }

    const diseno = disenoResult[0];
    // Usar servicio centralizado para respetar X/Y y nuevos campos
    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (err) {
        return {};
      }
    };

    const configJson = diseno.campos_json ? parseJsonSafe(diseno.campos_json) : parseJsonSafe(diseno.configuracion);
    const fondoUrl = diseno.fondo_url || diseno.fondo_certificado || diseno.imagen_fondo || null;

    const certificado = {
      dni,
      nombre_completo: nombreCompleto || certificadoPrevio.nombre_completo,
      tipo_certificado: diseno.tipo_certificado || certificadoPrevio.tipo_certificado || 'Participación',
      nombre_evento: nombreEvento || diseno.nombre_evento || certificadoPrevio.nombre_evento,
      descripcion_evento: observaciones || diseno.descripcion_evento || certificadoPrevio.descripcion_evento || null,
      fecha_inicio: fechaInicio || diseno.fecha_inicio || certificadoPrevio.fecha_inicio,
      fecha_fin: fechaFin || diseno.fecha_fin || certificadoPrevio.fecha_fin,
      horas_academicas: parseInt(horasAcademicas) || parseInt(diseno.horas_academicas) || parseInt(certificadoPrevio.horas_academicas) || 0,
      codigo_verificacion: (codigoVerificacion || certificadoPrevio.codigo_verificacion || '').toUpperCase()
    };

    const templateConfig = {
      configuracion: configJson,
      fondo_certificado: fondoUrl
    };

    const pdfGeneratorService = new PDFGeneratorService();
    const pdfBuffer = await pdfGeneratorService.generateCertificatePDF(certificado, templateConfig, true);

    // Actualizar el certificado con la nueva plantilla y contenido
    const updateQuery = `
      UPDATE certificados SET 
        tipo_certificado = ?,
        descripcion_evento = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        horas_academicas = ?,
        plantilla_certificado = ?,
        pdf_content = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(updateQuery, [
      diseno.tipo_certificado || certificadoPrevio.tipo_certificado || 'Participación',
      (observaciones || diseno.descripcion_evento || certificadoPrevio.descripcion_evento || null),
      (fechaInicio || diseno.fecha_inicio || certificadoPrevio.fecha_inicio),
      (fechaFin || diseno.fecha_fin || certificadoPrevio.fecha_fin),
      parseInt(horasAcademicas) || parseInt(diseno.horas_academicas) || parseInt(certificadoPrevio.horas_academicas) || 0,
      `diseno_${disenoId}.pdf`,
      pdfBuffer,
      certificadoPrevio.id
    ]);

    res.json({
      success: true,
      message: 'Certificado actualizado exitosamente',
      certificado: {
        id: certificadoPrevio.id,
        codigo_verificacion: (codigoVerificacion || certificadoPrevio.codigo_verificacion || '').toUpperCase(),
        nombre_completo: nombreCompleto || certificadoPrevio.nombre_completo,
        dni: dni,
        nombre_evento: nombreEvento || diseno.nombre_evento || certificadoPrevio.nombre_evento
      }
    });
  } catch (error) {
    console.error('Error al actualizar certificado con diseño:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor: ' + error.message });
  }
});

// Reconstruir en lote los PDFs de todos los certificados asociados a un diseño
router.post('/reconstruir-por-diseno', auth, adminAuth, async (req, res) => {
  try {
    const { disenoId, activoSolo = true, dryRun = false, limite = null } = req.body || {};

    if (!disenoId) {
      return res.status(400).json({ success: false, message: 'ID del diseño es requerido' });
    }

    // Helper: parseo seguro de JSON
    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (_) {
        return {};
      }
    };

    // Helper: verificar existencia de columnas opcionales
    async function columnExists(columnName) {
      try {
        const [rows] = await db.execute(
          `SELECT COUNT(*) AS cnt
           FROM information_schema.columns
           WHERE table_schema = DATABASE()
             AND table_name = 'certificados'
             AND column_name = ?`,
          [columnName]
        );
        return rows[0]?.cnt > 0;
      } catch (e) {
        console.warn('No se pudo verificar columna', columnName, e.message);
        return false;
      }
    }

    // Obtener datos del diseño
    const [disenoRows] = await db.execute('SELECT * FROM disenos_certificados WHERE id = ?', [disenoId]);
    if (disenoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Diseño no encontrado' });
    }
    const diseno = disenoRows[0];

    const configJson = diseno.campos_json ? parseJsonSafe(diseno.campos_json) : parseJsonSafe(diseno.configuracion);
    const fondoUrl = diseno.fondo_url || diseno.fondo_certificado || diseno.imagen_fondo || null;

    const templateConfig = {
      configuracion: configJson,
      fondo_certificado: fondoUrl
    };

    // Seleccionar certificados que usan este diseño
    let certificados = [];
    const estadoFiltro = activoSolo ? 'AND c.activo = 1' : '';
    const limiteSql = (limite && Number.isInteger(limite)) ? `LIMIT ${limite}` : '';
    try {
      const [rowsNew] = await db.execute(
        `SELECT c.*
         FROM certificados c
         WHERE (c.diseno_id = ?) ${estadoFiltro}
         ORDER BY c.id ASC ${limiteSql}`,
        [disenoId]
      );
      certificados = rowsNew;
    } catch (_) {
      certificados = [];
    }

    // Fallback: intentar por plantilla_certificado tipo "diseno_<id>.pdf"
    if (!certificados || certificados.length === 0) {
      try {
        const [rowsOld] = await db.execute(
          `SELECT c.*
           FROM certificados c
           WHERE (
             CAST(
               SUBSTRING_INDEX(SUBSTRING_INDEX(c.plantilla_certificado, '.', 1), 'diseno_', -1)
               AS UNSIGNED
             ) = ?
           ) ${estadoFiltro}
           ORDER BY c.id ASC ${limiteSql}`,
          [disenoId]
        );
        certificados = rowsOld;
      } catch (_) {
        certificados = [];
      }
    }

    if (!certificados || certificados.length === 0) {
      return res.json({ success: true, message: 'No hay certificados para reconstruir con este diseño', totalEncontrados: 0, actualizados: 0, errores: [] });
    }

    const pdfGeneratorService = new PDFGeneratorService();
    const includeUpdatedAt = await columnExists('updated_at');
    const includeDisenoId = await columnExists('diseno_id');
    const includeConfigUsada = await columnExists('config_usada');
    const includeFondoUsado = await columnExists('fondo_usado');

    const snapshotConfig = {
      configuracion: configJson || {},
      fondo: diseno.fondo_url || diseno.fondo_certificado || diseno.imagen_fondo || null
    };

    const resultados = { totalEncontrados: certificados.length, actualizados: 0, errores: [] };

    for (const cert of certificados) {
      try {
        // Generar PDF con datos actuales del certificado y diseño vigente
        const pdfBuffer = await pdfGeneratorService.generateCertificatePDF(cert, templateConfig, true);

        if (dryRun) {
          continue; // sólo simulación
        }

        // Construir UPDATE dinámico
        const setClauses = ['pdf_content = ?', 'plantilla_certificado = ?'];
        const values = [pdfBuffer, `diseno_${disenoId}.pdf`];
        if (includeDisenoId) {
          setClauses.push('diseno_id = ?');
          values.push(disenoId);
        }
        if (includeConfigUsada) {
          setClauses.push('config_usada = ?');
          values.push(JSON.stringify(snapshotConfig));
        }
        if (includeFondoUsado) {
          setClauses.push('fondo_usado = ?');
          values.push(diseno.fondo_certificado || diseno.imagen_fondo || null);
        }
        if (includeUpdatedAt) {
          setClauses.push('updated_at = NOW()');
        }

        const updateSql = `UPDATE certificados SET ${setClauses.join(', ')} WHERE id = ?`;
        await db.execute(updateSql, [...values, cert.id]);
        resultados.actualizados += 1;
      } catch (e) {
        resultados.errores.push({ id: cert.id, dni: cert.dni, motivo: e.message });
      }
    }

    res.json({ success: true, message: 'Reconstrucción completada', ...resultados });
  } catch (error) {
    console.error('Error en reconstrucción masiva de PDFs:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor: ' + error.message });
  }
});

// Endpoint para recuperar PDF desde la base de datos
router.get('/certificado/:id/pdf', async (req, res) => {
  try {
    const result = await CertificateRenderService.renderById(db, req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Certificado no encontrado' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Endpoint para recuperar PDF por código de verificación
router.get('/certificado/codigo/:codigo/pdf', async (req, res) => {
  try {
    const result = await CertificateRenderService.renderByCode(db, req.params.codigo);
    if (!result) return res.status(404).json({ success: false, message: 'Certificado no encontrado' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;

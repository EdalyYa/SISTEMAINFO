const express = require('express');
const router = express.Router();
const db = require('../config/database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const PDFGeneratorService = require('../services/PDFGeneratorService');
const CertificateRenderService = require('../services/CertificateRenderService');

// Horario de atención: Lunes-Viernes 09:00–15:00 (zona America/Lima)
// Desactivado por defecto; se puede activar con CERT_HORARIO_ENABLED=true
const HORARIO_LABEL = process.env.CERT_HORARIO_LABEL || 'Lun-Vie 09:00-15:00';
const HORARIO_ENABLED = String(process.env.CERT_HORARIO_ENABLED ?? 'false') === 'true';

// Obtiene fecha/hora en la zona horaria de Lima sin depender del timezone del servidor
const getPeruDate = () => {
  const now = new Date();
  const peruString = now.toLocaleString('en-US', { timeZone: 'America/Lima' });
  return new Date(peruString);
};

const dentroHorario = () => {
  if (!HORARIO_ENABLED) return true;
  const limaNow = getPeruDate();
  const day = limaNow.getDay(); // 0=Domingo, 1=Lunes, ... 6=Sábado
  const hour = limaNow.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 15;
};

// GET - Buscar certificado por código de verificación (público)
router.get('/verificar/:codigo', async (req, res) => {
  try {
    if (!dentroHorario()) {
      return res.status(403).json({ 
        error: 'Servicio fuera de horario de atención', 
        horario: HORARIO_LABEL,
        server_time_peru: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
      });
    }
    const { codigo } = req.params;
    
    let rows;
    try {
      const queryNew = `
        SELECT 
          c.*,
          dc.nombre as diseno_nombre,
          dc.configuracion,
          dc.fondo_certificado
        FROM certificados c
        LEFT JOIN disenos_certificados dc ON COALESCE(
          c.diseno_id,
          CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(c.plantilla_certificado, '.', 1), 'diseno_', -1) AS UNSIGNED)
        ) = dc.id
        WHERE c.codigo_verificacion = ?
      `;
      const [r] = await db.execute(queryNew, [codigo]);
      rows = r;
    } catch (_) {
      const queryOld = `
        SELECT 
          c.*,
          dc.nombre as diseno_nombre,
          dc.configuracion,
          dc.fondo_certificado
        FROM certificados c
        LEFT JOIN disenos_certificados dc ON 
          CAST(
            SUBSTRING_INDEX(SUBSTRING_INDEX(c.plantilla_certificado, '.', 1), 'diseno_', -1)
            AS UNSIGNED
          ) = dc.id
        WHERE c.codigo_verificacion = ?
      `;
      const [r] = await db.execute(queryOld, [codigo]);
      rows = r;
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado' });
    }
    
    const certificado = rows[0];
    
    // Formatear la respuesta
    const response = {
      id: certificado.id,
      dni: certificado.dni,
      nombre: certificado.nombre,
      tipo: certificado.tipo,
      evento: certificado.evento,
      fecha_emision: certificado.fecha_emision,
      horas: certificado.horas,
      codigo_verificacion: certificado.codigo_verificacion,
      diseno: {
        nombre: certificado.diseno_nombre,
        configuracion: certificado.configuracion ? JSON.parse(certificado.configuracion) : null,
        fondo_certificado: certificado.fondo_certificado
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error al verificar certificado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Descargar PDF del certificado (público) usando servicio centralizado
router.get('/descargar/:codigo', async (req, res) => {
  try {
    if (!dentroHorario()) {
      return res.status(403).json({ error: 'Servicio fuera de horario de atención', horario: HORARIO_LABEL });
    }
    const { codigo } = req.params;
    const quick = await CertificateRenderService.renderByCode(db, codigo);
    if (quick) {
      res.setHeader('Content-Type', 'application/pdf');
      const forceDownload = String(req.query.download || '').trim() === '1' || String(req.query.download || '').toLowerCase() === 'true';
      res.setHeader('Content-Disposition', `${forceDownload ? 'attachment' : 'inline'}; filename="${quick.fileName}"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
      res.setHeader('X-PDF-Generated', new Date().toISOString());
      return res.send(quick.buffer);
    }
    
    // DEBUG: Log de la solicitud
    console.log('🔍 SOLICITUD DE DESCARGA PÚBLICA:');
    console.log('  - Código:', codigo);
    console.log('  - User-Agent:', req.headers['user-agent']);
    console.log('  - Referer:', req.headers['referer']);
    console.log('  - Timestamp:', new Date().toISOString());
    
    // Buscar certificado con su diseño personalizado (misma query que admin)
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
          dc.configuracion,
          dc.fondo_url,
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
      const [r] = await db.execute(queryNew, [codigo]);
      certificados = r;
    } catch (_) {
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
          dc.campos_json,
          dc.configuracion,
          dc.fondo_url,
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
      const [r] = await db.execute(queryOld, [codigo]);
      certificados = r;
    }
    
    if (certificados.length === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado o inactivo' });
    }
    
    const certificado = certificados[0];
    
    // Preparar configuración de plantilla (preferir campos_json/fondo_url)
    const safeParse = (val) => { try { return typeof val === 'string' ? JSON.parse(val) : (val || null); } catch { return null; } };
    let templateConfig = {
      configuracion: certificado.campos_json ? safeParse(certificado.campos_json) : safeParse(certificado.configuracion),
      fondo_certificado: certificado.fondo_url || certificado.fondo_certificado
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
    
    // Configurar headers con nombre amigable
    res.setHeader('Content-Type', 'application/pdf');
    const sanitize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const nombreFile = sanitize(certificado.nombre_completo || certificado.nombre || 'Estudiante');
    const fileName = `certificado_${nombreFile}_INF-UNA.pdf`;
    const forceDownload = String(req.query.download || '').trim() === '1' || String(req.query.download || '').toLowerCase() === 'true';
    res.setHeader('Content-Disposition', `${forceDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
    res.setHeader('X-PDF-Generated', new Date().toISOString());
    
    // DEBUG: Log del PDF generado
    console.log('📄 PDF GENERADO:');
    console.log('  - Tamaño:', pdfBuffer.length, 'bytes');
    console.log('  - Timestamp:', new Date().toISOString());
    
    // Enviar PDF
    res.send(pdfBuffer);
    
    console.log('✅ PDF generado usando servicio centralizado (Público)');
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error al generar el certificado' });
  }
});

// DEBUG: Ruta especial para debug
router.get('/debug/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    console.log('🐛 DEBUG REQUEST:', {
      codigo,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer']
    });
    
    // Buscar certificado
    let certificados;
    try {
      const queryNew = `
        SELECT 
          c.codigo_verificacion,
          c.nombre_completo,
          c.nombre_evento,
          dc.configuracion IS NOT NULL as tiene_configuracion,
          dc.fondo_certificado IS NOT NULL as tiene_fondo
        FROM certificados c
        LEFT JOIN disenos_certificados dc ON COALESCE(
          c.diseno_id,
          CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(c.plantilla_certificado, '.', 1), 'diseno_', -1) AS UNSIGNED)
        ) = dc.id
        WHERE c.codigo_verificacion = ? AND c.activo = 1
      `;
      const [r] = await db.execute(queryNew, [codigo]);
      certificados = r;
    } catch (_) {
      const queryOld = `
        SELECT 
          c.codigo_verificacion,
          c.nombre_completo,
          c.nombre_evento,
          dc.configuracion IS NOT NULL as tiene_configuracion,
          dc.fondo_certificado IS NOT NULL as tiene_fondo
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
      const [r] = await db.execute(queryOld, [codigo]);
      certificados = r;
    }
    
    if (certificados.length === 0) {
      return res.json({ error: 'Certificado no encontrado', codigo });
    }
    
    const cert = certificados[0];
    
    res.json({
      success: true,
      certificado: {
        codigo: cert.codigo_verificacion,
        nombre: cert.nombre_completo,
        evento: cert.nombre_evento,
        tiene_configuracion: !!cert.tiene_configuracion,
        tiene_fondo: !!cert.tiene_fondo
      },
      timestamp: new Date().toISOString(),
      backend_version: 'v2.0-fixed'
    });
    
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
// GET - Validar certificado por DNI y código (público)
router.get('/validar', async (req, res) => {
  try {
    const { dni, codigo } = req.query;

    if (!dni || !codigo) {
      return res.status(400).json({ error: 'Parámetros requeridos: dni y codigo' });
    }

    const dniStr = String(dni).trim();
    const codeStr = String(codigo).trim().toUpperCase();

    if (!/^\d{8}$/.test(dniStr)) {
      return res.status(400).json({ error: 'DNI debe tener 8 dígitos' });
    }
    if (!/^[A-Z0-9]{6}$/.test(codeStr)) {
      return res.status(400).json({ error: 'Código debe tener 6 caracteres alfanuméricos' });
    }

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
        c.fecha_emision,
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
      WHERE c.dni = ? AND c.codigo_verificacion = ? AND c.activo = 1
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [dniStr, codeStr]);
    if (rows.length === 0) {
      return res.status(404).json({ valido: false, error: 'Certificado no encontrado o inactivo' });
    }

    const certificado = rows[0];
    return res.json({
      valido: true,
      certificado: {
        dni: certificado.dni,
        nombre_completo: certificado.nombre_completo,
        tipo_certificado: certificado.tipo_certificado,
        nombre_evento: certificado.nombre_evento,
        periodo_evento: certificado.periodo_evento,
        horas_academicas: certificado.horas_academicas,
        fecha_emision: certificado.fecha_emision,
        codigo_verificacion: certificado.codigo_verificacion
      }
    });
  } catch (error) {
    console.error('Error al validar certificado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

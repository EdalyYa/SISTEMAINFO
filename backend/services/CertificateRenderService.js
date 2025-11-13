const fs = require('fs');
const path = require('path');
const PDFGeneratorService = require('./PDFGeneratorService');

function parseSafe(val) {
  try {
    if (typeof val === 'string') return JSON.parse(val);
    return val || null;
  } catch (_) {
    return null;
  }
}

function sanitizeName(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Estudiante';
}

async function getTemplateConfig(db, certificado) {
  const cfg = certificado.campos_json ? parseSafe(certificado.campos_json) : parseSafe(certificado.configuracion);
  const fondo = certificado.fondo_url || certificado.fondo_certificado || null;
  let templateConfig = { configuracion: cfg || null, fondo_certificado: fondo || null };
  if (!templateConfig.configuracion || !templateConfig.fondo_certificado) {
    let disenoId = null;
    if (certificado.diseno_id) disenoId = certificado.diseno_id;
    if (!disenoId && certificado.plantilla_certificado) {
      const m = String(certificado.plantilla_certificado).match(/diseno_(\d+)/);
      if (m) disenoId = parseInt(m[1]);
    }
    if (disenoId) {
      const [rows] = await db.execute('SELECT configuracion, fondo_certificado FROM disenos_certificados WHERE id = ? AND activo = 1', [disenoId]);
      if (Array.isArray(rows) && rows.length > 0) {
        templateConfig.configuracion = parseSafe(rows[0].configuracion) || templateConfig.configuracion;
        templateConfig.fondo_certificado = rows[0].fondo_certificado || templateConfig.fondo_certificado;
      }
    }
  }
  if (!templateConfig.configuracion || !templateConfig.fondo_certificado) {
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
  }
  return templateConfig;
}

async function renderByCode(db, codigo) {
  const query = `
    SELECT 
      c.id,
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
      c.diseno_id,
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
  const [rows] = await db.execute(query, [codigo]);
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const certificado = rows[0];
  const templateConfig = await getTemplateConfig(db, certificado);
  const pdfService = new PDFGeneratorService();
  const buffer = await pdfService.generateCertificatePDF(certificado, templateConfig, true);
  const fileName = `certificado_${sanitizeName(certificado.nombre_completo)}_INF-UNA.pdf`;
  return { buffer, fileName };
}

async function renderById(db, id) {
  const [rows] = await db.execute('SELECT codigo_verificacion FROM certificados WHERE id = ? AND activo = 1', [id]);
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const codigo = rows[0].codigo_verificacion;
  return renderByCode(db, codigo);
}

async function renderPreviewFromBody(db, body) {
  const certificado = {
    dni: body.dni || '00000000',
    nombre_completo: body.nombre_completo || body.nombre || 'Estudiante',
    tipo_certificado: body.tipo_certificado || body.tipo || 'CERTIFICADO',
    nombre_evento: body.nombre_evento || body.evento || 'Evento',
    descripcion_evento: body.descripcion_evento || body.descripcion || 'Participación destacada.',
    fecha_inicio: body.fecha_inicio || '2024-10-01',
    fecha_fin: body.fecha_fin || '2024-10-15',
    horas_academicas: body.horas_academicas || body.horas || 20,
    codigo_verificacion: (body.codigo_verificacion || 'AAAAAA').toUpperCase(),
    periodo_evento: body.periodo_evento || null
  };
  let templateConfig = {
    configuracion: body.configuracion || null,
    fondo_certificado: body.fondo_certificado || null
  };
  if (!templateConfig.configuracion || !templateConfig.fondo_certificado) {
    const defaultConfigPath = path.join(__dirname, '..', 'uploads', 'certificados', 'plantillas', 'config_certificado_A4.json');
    let configJson = null;
    if (fs.existsSync(defaultConfigPath)) {
      configJson = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    }
    templateConfig = {
      configuracion: templateConfig.configuracion || configJson || {
        nombreInstituto: { x: 221, y: 40, fontSize: 16, color: '#1e293b', fontWeight: 'bold' },
        titulo: { x: 221, y: 90, fontSize: 38, color: '#0f172a', fontWeight: 'bold' },
        otorgado: { x: 221, y: 150, fontSize: 14, color: '#334155' },
        nombreEstudiante: { x: 221, y: 195, fontSize: 30, color: '#000000', fontWeight: 'bold' },
        descripcion: { x: 196, y: 240, fontSize: 14, color: '#000000' },
        fecha: { x: 221, y: 290, fontSize: 12, color: '#000000' },
        codigo: { x: 221, y: 325, fontSize: 10, color: '#666666' },
        qr: { x: 680, y: 370, width: 130 }
      },
      fondo_certificado: templateConfig.fondo_certificado || path.join('plantillas', 'certificado_A4.png')
    };
  }
  const pdfService = new PDFGeneratorService();
  const buffer = await pdfService.generatePreview(certificado, templateConfig);
  const fileName = `certificado_${sanitizeName(certificado.nombre_completo)}_INF-UNA.pdf`;
  return { buffer, fileName };
}

module.exports = {
  renderByCode,
  renderById,
  renderPreviewFromBody,
};


const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const PDFGeneratorService = require('../services/PDFGeneratorService');
const RECORDS_FILE = path.join(__dirname, '..', 'uploads', 'certificados', 'records.json');

function genCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(__dirname, '..', 'uploads', 'certificados', 'templates');
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, name);
    }
  })
});

async function ensureTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cert_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        fondo_url VARCHAR(512) NULL,
        config_json JSON NULL,
        activo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS certificados_v2 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL,
        dni VARCHAR(16) NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        rol VARCHAR(64) NULL,
        nombre_evento VARCHAR(255) NOT NULL,
        descripcion_evento TEXT NULL,
        fecha_inicio DATE NULL,
        fecha_fin DATE NULL,
        horas_academicas INT NULL,
        codigo_verificacion VARCHAR(32) UNIQUE NOT NULL,
        pdf_content MEDIUMBLOB NULL,
        activo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES cert_templates(id)
      )
    `);
  } catch (e) {
    console.error('Error asegurando tablas V2:', e.message);
  }
}

ensureTables();

router.get('/templates', auth, adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM cert_templates ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error al listar plantillas' });
  }
});

router.post('/templates', auth, adminAuth, upload.single('background'), async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const config_json = typeof req.body.config_json === 'string' ? req.body.config_json : JSON.stringify(req.body.config_json || {});
    if (!nombre) return res.status(400).json({ error: 'Nombre de plantilla requerido' });
    const fondo_url = req.file ? path.join('uploads', 'certificados', 'templates', req.file.filename) : (req.body.fondo_url || null);
    const [result] = await db.execute('INSERT INTO cert_templates (nombre, fondo_url, config_json, activo) VALUES (?, ?, ?, 1)', [nombre, fondo_url, config_json]);
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    console.error('Error al crear plantilla:', e.message);
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
});

router.put('/templates/:id', auth, adminAuth, upload.single('background'), async (req, res) => {
  try {
    const { id } = req.params;
    const nombre = req.body.nombre || null;
    const activo = req.body.activo;
    const config_json = typeof req.body.config_json === 'string' ? req.body.config_json : JSON.stringify(req.body.config_json || {});
    const fondo_url = req.file ? path.join('uploads', 'certificados', 'templates', req.file.filename) : (req.body.fondo_url || null);
    const [result] = await db.execute(
      'UPDATE cert_templates SET nombre = COALESCE(?, nombre), fondo_url = COALESCE(?, fondo_url), config_json = COALESCE(?, config_json), activo = COALESCE(?, activo) WHERE id = ?',
      [nombre, fondo_url, config_json, typeof activo === 'number' ? activo : null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
});

async function getTemplate(id) {
  const [rows] = await db.execute('SELECT * FROM cert_templates WHERE id = ? AND activo = 1', [id]);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function parseConfig(template) {
  try {
    const cfg = typeof template.config_json === 'string' ? JSON.parse(template.config_json) : template.config_json;
    const c = cfg || {};
    const normalized = { ...c };
    if (c.nombre) normalized.nombreEstudiante = c.nombre;
    if (c.evento) normalized.eventoDetalle = c.evento;
    if (c.periodo) normalized.periodoHoras = c.periodo;
    if (c.rol) normalized.rolParticipacion = c.rol;
    // Preferir ruta absoluta a fondo si existe
    let fondo = null;
    if (template.fondo_url) {
      const rel = String(template.fondo_url).replace(/^\/+/, '').replace(/\\/g, '/');
      const abs = path.join(__dirname, '..', rel);
      fondo = fs.existsSync(abs) ? abs : rel;
    }
    return {
      configuracion: normalized,
      fondo_certificado: fondo || template.fondo_url || null,
    };
  } catch (_) {
    return { configuracion: {}, fondo_certificado: template.fondo_url || null };
  }
}

router.post('/generate', auth, adminAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const templateId = Number(payload.template_id);
    const template = await getTemplate(templateId);
    if (!template) return res.status(400).json({ error: 'Plantilla inválida o inactiva' });
    const normDate = (v) => {
      if (!v) return null;
      const s = String(v).trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split('/');
        return `${y}-${m}-${d}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      return null;
    };
    const codigo = genCode(8);
    const certificado = {
      dni: payload.dni || null,
      nombre_completo: payload.nombre_completo,
      rol: payload.rol || null,
      tipo_certificado: payload.tipo_certificado || 'CERTIFICADO',
      nombre_evento: payload.nombre_evento,
      descripcion_evento: payload.descripcion_evento || '',
      fecha_inicio: normDate(payload.fecha_inicio),
      fecha_fin: normDate(payload.fecha_fin),
      horas_academicas: payload.horas_academicas || null,
      codigo_verificacion: codigo,
      periodo_evento: payload.periodo_evento || null,
    };
    const pdfService = new PDFGeneratorService();
    const pdfBuffer = await pdfService.generateCertificatePDF(certificado, parseConfig(template), true);
    const [ins] = await db.execute(
      'INSERT INTO certificados_v2 (template_id, dni, nombre_completo, rol, nombre_evento, descripcion_evento, fecha_inicio, fecha_fin, horas_academicas, codigo_verificacion, pdf_content, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [templateId, certificado.dni, certificado.nombre_completo, certificado.rol, certificado.nombre_evento, certificado.descripcion_evento, certificado.fecha_inicio, certificado.fecha_fin, certificado.horas_academicas, codigo, pdfBuffer]
    );
    const id = ins?.insertId || Date.now();
    try {
      const dir = path.dirname(RECORDS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const existing = fs.existsSync(RECORDS_FILE) ? JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf8')) : [];
      existing.unshift({ id, dni: certificado.dni, nombre_completo: certificado.nombre_completo, rol: certificado.rol, nombre_evento: certificado.nombre_evento, horas_academicas: certificado.horas_academicas, codigo_verificacion: codigo, created_at: new Date().toISOString() });
      fs.writeFileSync(RECORDS_FILE, JSON.stringify(existing, null, 2));
    } catch (_) {}
    res.json({ id, codigo_verificacion: codigo, download_url: `/api/certificados-v2/download/${codigo}` });
  } catch (e) {
    console.error('Error generar certificado:', e.message);
    res.status(500).json({ error: 'Error al generar certificado', details: e.message });
  }
});

router.post('/batch', auth, adminAuth, upload.single('file'), async (req, res) => {
  try {
    const templateId = Number(req.body.template_id);
    const template = await getTemplate(templateId);
    if (!template) return res.status(400).json({ error: 'Plantilla inválida o inactiva' });
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const wb = XLSX.readFile(req.file.path);
    const wsName = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wsName], { defval: '' });
    const pdfService = new PDFGeneratorService();
    let creados = 0; const errores = [];
  for (const r of rows) {
    try {
      const codigo = genCode(8);
      const normDate = (v) => {
        if (!v) return null;
        const s = String(v).trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
          const [d, m, y] = s.split('/');
          return `${y}-${m}-${d}`;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        return null;
      };
      const cert = {
        dni: r.dni || null,
        nombre_completo: r.nombre_completo || r.nombre || '',
        rol: r.rol || null,
        tipo_certificado: r.tipo_certificado || 'CERTIFICADO',
        nombre_evento: r.nombre_evento || r.evento || '',
        descripcion_evento: r.descripcion_evento || r.descripcion || '',
        fecha_inicio: normDate(r.fecha_inicio),
        fecha_fin: normDate(r.fecha_fin),
        horas_academicas: r.horas_academicas || r.horas || null,
        codigo_verificacion: codigo,
      };
        const buf = await pdfService.generateCertificatePDF(cert, parseConfig(template), true);
        await db.execute(
          'INSERT INTO certificados_v2 (template_id, dni, nombre_completo, rol, nombre_evento, descripcion_evento, fecha_inicio, fecha_fin, horas_academicas, codigo_verificacion, pdf_content, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [templateId, cert.dni, cert.nombre_completo, cert.rol, cert.nombre_evento, cert.descripcion_evento, cert.fecha_inicio, cert.fecha_fin, cert.horas_academicas, codigo, buf]
        );
        creados++;
      } catch (err) {
        errores.push({ row: r, error: err.message });
      }
    }
    res.json({ success: true, creados, errores });
  } catch (e) {
    res.status(500).json({ error: 'Error al procesar lote' });
  }
});

router.get('/download/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await db.execute('SELECT pdf_content, nombre_completo FROM certificados_v2 WHERE codigo_verificacion = ? AND activo = 1', [codigo]);
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'Certificado no encontrado' });
    const cert = rows[0];
    res.setHeader('Content-Type', 'application/pdf');
    const name = (cert.nombre_completo || 'Estudiante').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_');
    const forceDownload = String(req.query.download || '').trim() === '1' || String(req.query.download || '').toLowerCase() === 'true';
    res.setHeader('Content-Disposition', `${forceDownload ? 'attachment' : 'inline'}; filename="certificado_${name}_INF-UNA.pdf"`);
    res.send(cert.pdf_content);
  } catch (e) {
    res.status(500).json({ error: 'Error al descargar certificado' });
  }
});

// Public: verificar existencia básica por código (sin auth)
router.get('/public/verify/:codigo', async (req, res) => {
  try {
    if (!dentroHorario()) {
      return res.status(403).json({ 
        error: 'Servicio fuera de horario de atención', 
        horario: HORARIO_LABEL,
        server_time_peru: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
      });
    }
    const { codigo } = req.params;
    const [rows] = await db.execute(
      'SELECT id, dni, nombre_completo, rol, nombre_evento, horas_academicas, codigo_verificacion, created_at FROM certificados_v2 WHERE codigo_verificacion = ? AND activo = 1',
      [codigo]
    );
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'Certificado no encontrado' });
    const r = rows[0];
    res.json({
      id: r.id,
      dni: r.dni,
      nombre: r.nombre_completo,
      tipo: 'CERTIFICADO',
      evento: r.nombre_evento,
      fecha_emision: r.created_at,
      horas: r.horas_academicas,
      codigo_verificacion: r.codigo_verificacion
    });
  } catch (e) {
    res.status(500).json({ error: 'Error al verificar certificado' });
  }
});

router.get('/certificados', auth, adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, dni, nombre_completo, rol, nombre_evento, horas_academicas, codigo_verificacion, created_at FROM certificados_v2 ORDER BY id DESC');
    if (Array.isArray(rows) && rows.length > 0) return res.json(rows);
    const fileRows = fs.existsSync(RECORDS_FILE) ? JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf8')) : [];
    res.json(Array.isArray(fileRows) ? fileRows : []);
  } catch (e) {
    res.status(500).json({ error: 'Error al listar certificados' });
  }
});

router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const [v2] = await db.execute('SELECT id, dni, nombre_completo, rol, nombre_evento, horas_academicas, codigo_verificacion, created_at FROM certificados_v2 ORDER BY id DESC');
    let legacy = [];
    try {
      const [rowsLegacy] = await db.execute('SELECT id, dni, nombre_completo, nombre_evento, horas_academicas, codigo_verificacion, created_at FROM certificados ORDER BY id DESC');
      legacy = Array.isArray(rowsLegacy) ? rowsLegacy.map(r => ({ ...r, rol: null })) : [];
    } catch (_) { legacy = []; }
    const merged = [...(Array.isArray(v2) ? v2 : []), ...legacy];
    merged.sort((a,b)=>Number(b.id)-Number(a.id));
    res.json(merged);
  } catch (e) {
    res.status(500).json({ error: 'Error al listar todos los certificados' });
  }
});

router.delete('/certificados/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM certificados_v2 WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      // Intentar eliminar del archivo si no está en BD
      if (fs.existsSync(RECORDS_FILE)) {
        try {
          const current = JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf8'));
          const next = Array.isArray(current) ? current.filter(r => String(r.id) !== String(id)) : [];
          fs.writeFileSync(RECORDS_FILE, JSON.stringify(next, null, 2));
          return res.json({ success: true });
        } catch (_) {}
      }
      return res.status(404).json({ error: 'Certificado no encontrado' });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar certificado' });
  }
});

module.exports = router;
// Horario de atención (público): Lunes-Viernes 09:00–15:00 (America/Lima)
const HORARIO_LABEL = process.env.CERT_HORARIO_LABEL || 'Lun-Vie 09:00-15:00';
const HORARIO_ENABLED = String(process.env.CERT_HORARIO_ENABLED ?? 'false') === 'true';
const getPeruDate = () => {
  const now = new Date();
  const peruString = now.toLocaleString('en-US', { timeZone: 'America/Lima' });
  return new Date(peruString);
};
const dentroHorario = () => {
  if (!HORARIO_ENABLED) return true;
  const limaNow = getPeruDate();
  const day = limaNow.getDay();
  const hour = limaNow.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 15;
};

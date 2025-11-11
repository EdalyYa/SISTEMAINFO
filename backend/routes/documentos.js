const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
let libreConvert = null;
try { libreConvert = require('libreoffice-convert'); } catch (_) { /* opcional, no instalado */ }

module.exports = (pool, { authenticateToken }) => {
  const router = express.Router();

  // Asegurar tabla de documentos
  const ensureTable = async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(100),
        etiquetas JSON,
        ruta VARCHAR(255) NOT NULL,
        mime VARCHAR(100),
        tamano BIGINT,
        publico TINYINT DEFAULT 1,
        descargas INT DEFAULT 0,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await pool.query(sql);
      // Seed inicial si la tabla está vacía
      const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM documentos');
      if ((countRows?.[0]?.cnt || 0) === 0) {
        const seed = [
          {
            titulo: 'Reglamento General INFOUNA',
            descripcion: 'Reglamento general institucional, versión 2024.',
            categoria: 'Reglamentos',
            etiquetas: JSON.stringify(['reglamento','institucional','2024']),
            ruta: '/uploads/docs/reglamento-general.txt',
            mime: 'text/plain',
            tamano: 0,
            publico: 1
          },
          {
            titulo: 'Normativa de Admisiones',
            descripcion: 'Normas y procedimientos para procesos de admisión.',
            categoria: 'Normativas',
            etiquetas: JSON.stringify(['normativa','admisiones']),
            ruta: '/uploads/docs/normativa-admisiones.txt',
            mime: 'text/plain',
            tamano: 0,
            publico: 1
          }
        ];
        for (const s of seed) {
          try {
            await pool.query(
              'INSERT INTO documentos (titulo, descripcion, categoria, etiquetas, ruta, mime, tamano, publico) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [s.titulo, s.descripcion, s.categoria, s.etiquetas, s.ruta, s.mime, s.tamano, s.publico]
            );
          } catch (e) { console.warn('Seed documentos skip:', e?.message || e); }
        }
      }
    } catch (e) { console.error('Error ensuring documentos table:', e); }
  };
  ensureTable();

  // Configuración de subida de archivos (docs)
  const uploadDir = path.join(__dirname, '..', 'uploads', 'docs');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${timestamp}-${safe}`);
    }
  });

  const allowedMimes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]);

  const fileFilter = (req, file, cb) => {
    if (allowedMimes.has(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido'));
  };

  const upload = multer({ storage, fileFilter });

  // Listado público con filtros
  router.get('/', async (req, res) => {
    const { categoria, tag, q } = req.query;
    try {
      let sql = 'SELECT id, titulo, descripcion, categoria, etiquetas, ruta, mime, tamano, publico, descargas, creado_en FROM documentos WHERE publico = 1';
      const params = [];
      if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
      if (q) { sql += ' AND titulo LIKE ?'; params.push(`%${q}%`); }
      // Filtrar por tag dentro de JSON
      if (tag) { sql += ' AND JSON_SEARCH(etiquetas, "one", ?) IS NOT NULL'; params.push(tag); }

      sql += ' ORDER BY creado_en DESC';
      const [rows] = await pool.query(sql, params);
      res.json(rows.map(r => ({
        ...r,
        etiquetas: (() => { try { return JSON.parse(r.etiquetas || '[]'); } catch { return []; } })()
      })));
    } catch (e) {
      console.error('Error fetching documentos:', e);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  });

  // Descargar (incrementa contador y sirve archivo)
  router.get('/:id/download', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT ruta, mime FROM documentos WHERE id = ? AND publico = 1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
      const doc = rows[0];
      await pool.query('UPDATE documentos SET descargas = descargas + 1 WHERE id = ?', [id]);
      const absPath = path.join(__dirname, '..', doc.ruta.replace(/^\//, ''));
      if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'Archivo no disponible' });
      res.setHeader('Content-Type', doc.mime || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(absPath)}"`);
      fs.createReadStream(absPath).pipe(res);
    } catch (e) {
      console.error('Error downloading documento:', e);
      res.status(500).json({ error: 'Error al descargar documento' });
    }
  });

  // Vista previa (PDF/texto directo, o intenta convertir Office a PDF si está disponible)
  router.get('/:id/preview', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT ruta, mime, titulo FROM documentos WHERE id = ? AND publico = 1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
      const doc = rows[0];
      const absPath = path.join(__dirname, '..', doc.ruta.replace(/^\//, ''));
      if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'Archivo no disponible' });

      const mime = doc.mime || 'application/octet-stream';
      const isPdf = mime === 'application/pdf';
      const isText = mime.startsWith('text/');
      const isOffice = (
        mime === 'application/msword' ||
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mime === 'application/vnd.ms-excel' ||
        mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      if (isPdf || isText) {
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(absPath)}"`);
        return fs.createReadStream(absPath).pipe(res);
      }

      if (isOffice) {
        const previewsDir = path.join(__dirname, '..', 'uploads', 'docs', 'previews');
        if (!fs.existsSync(previewsDir)) fs.mkdirSync(previewsDir, { recursive: true });
        const previewPath = path.join(previewsDir, `${id}.pdf`);

        const sourceStat = fs.statSync(absPath);
        const needConvert = (!fs.existsSync(previewPath)) || (fs.statSync(previewPath).mtimeMs < sourceStat.mtimeMs);

        if (needConvert) {
          if (!libreConvert) {
            return res.status(501).json({ error: 'Vista previa no disponible: conversión a PDF no instalada' });
          }
          try {
            const fileBuf = fs.readFileSync(absPath);
            await new Promise((resolve, reject) => {
              libreConvert(fileBuf, '.pdf', undefined, (err, done) => {
                if (err) return reject(err);
                try {
                  fs.writeFileSync(previewPath, done);
                  resolve();
                } catch (e) { reject(e); }
              });
            });
          } catch (e) {
            console.error('Error convirtiendo documento a PDF:', e);
            return res.status(500).json({ error: 'No fue posible generar vista previa' });
          }
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(previewPath)}"`);
        return fs.createReadStream(previewPath).pipe(res);
      }

      return res.status(415).json({ error: 'Tipo de archivo no soportado para vista previa' });
    } catch (e) {
      console.error('Error en vista previa de documento:', e);
      res.status(500).json({ error: 'Error al generar vista previa' });
    }
  });

  // Rutas de administración (protegidas)
  router.get('/admin/all', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM documentos ORDER BY creado_en DESC');
      res.json(rows.map(r => ({
        ...r,
        etiquetas: (() => { try { return JSON.parse(r.etiquetas || '[]'); } catch { return []; } })()
      })));
    } catch (e) {
      console.error('Error admin list documentos:', e);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  });

  router.post('/admin/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const { titulo, descripcion, categoria, etiquetas, publico } = req.body;
      if (!req.file || !titulo) return res.status(400).json({ error: 'Título y archivo son obligatorios' });
      const rutaRelativa = `/uploads/docs/${req.file.filename}`;
      const mime = req.file.mimetype;
      const tamano = req.file.size;
      const tags = (() => {
        try {
          if (!etiquetas) return JSON.stringify([]);
          if (Array.isArray(etiquetas)) return JSON.stringify(etiquetas);
          return JSON.stringify(String(etiquetas).split(',').map(s => s.trim()).filter(Boolean));
        } catch { return JSON.stringify([]); }
      })();
      const pub = publico === '0' ? 0 : 1;
      const sql = 'INSERT INTO documentos (titulo, descripcion, categoria, etiquetas, ruta, mime, tamano, publico) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [titulo, descripcion || null, categoria || null, tags, rutaRelativa, mime, tamano, pub];
      const [result] = await pool.query(sql, params);
      res.json({ id: result.insertId, ruta: rutaRelativa });
    } catch (e) {
      console.error('Error uploading documento:', e);
      res.status(500).json({ error: 'Error al subir documento' });
    }
  });

  router.patch('/admin/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, categoria, etiquetas, publico } = req.body;
    try {
      const tags = etiquetas ? JSON.stringify(Array.isArray(etiquetas) ? etiquetas : String(etiquetas).split(',').map(s => s.trim()).filter(Boolean)) : null;
      const sql = 'UPDATE documentos SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion), categoria = COALESCE(?, categoria), etiquetas = COALESCE(?, etiquetas), publico = COALESCE(?, publico) WHERE id = ?';
      const params = [titulo || null, descripcion || null, categoria || null, tags, (publico === undefined ? null : (publico ? 1 : 0)), id];
      await pool.query(sql, params);
      res.json({ ok: true });
    } catch (e) {
      console.error('Error updating documento:', e);
      res.status(500).json({ error: 'Error al actualizar documento' });
    }
  });

  router.delete('/admin/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT ruta FROM documentos WHERE id = ?', [id]);
      await pool.query('DELETE FROM documentos WHERE id = ?', [id]);
      // Opcional: borrar archivo físico
      if (rows.length > 0) {
        const abs = path.join(__dirname, '..', rows[0].ruta.replace(/^\//, ''));
        if (fs.existsSync(abs)) { try { fs.unlinkSync(abs); } catch (_) {} }
      }
      res.json({ ok: true });
    } catch (e) {
      console.error('Error deleting documento:', e);
      res.status(500).json({ error: 'Error al eliminar documento' });
    }
  });

  return router;
};

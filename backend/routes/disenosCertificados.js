const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../database/connection');
const authenticateToken = require('../middleware/auth');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/certificados');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

// Middleware para campos múltiples
const uploadFields = upload.fields([
  { name: 'fondoCertificado', maxCount: 1 }
]);

// GET - Obtener todas las configuraciones de diseño
// Actualizado: prioriza columnas nuevas (campos_json, fondo_url, incluye_qr) si existen.
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Intentar leer columnas nuevas; si falla, caer a antiguas
    let rows;
    try {
      const [r] = await db.execute(`
        SELECT id, nombre, campos_json, fondo_url, incluye_qr,
               configuracion, fondo_certificado,
               created_at, updated_at
        FROM disenos_certificados
        ORDER BY created_at DESC
      `);
      rows = r;
    } catch (_) {
      const [r] = await db.execute(`
        SELECT id, nombre, configuracion, fondo_certificado,
               created_at, updated_at
        FROM disenos_certificados
        ORDER BY created_at DESC
      `);
      rows = r;
    }

    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (err) {
        return {};
      }
    };

    const configuraciones = rows.map((row) => {
      const cfg = row.campos_json !== undefined
        ? parseJsonSafe(row.campos_json)
        : parseJsonSafe(row.configuracion);
      const fondoUrl = row.fondo_url
        || (row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null);

      return {
        id: row.id,
        nombre: row.nombre,
        // homogéneo: el frontend usa "configuracion"
        configuracion: cfg,
        // mantener compatibilidad con UI actual
        fondoCertificado: fondoUrl,
        incluye_qr: row.incluye_qr !== undefined ? !!row.incluye_qr : true,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });

    res.json(configuraciones);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener una configuración específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Intentar leer nuevas columnas si existen; fallback a antiguas
    let rows;
    try {
      const [r] = await db.execute(
        `SELECT id, nombre, campos_json, fondo_url, incluye_qr,
                fondo_certificado,
                configuracion,
                created_at, updated_at
         FROM disenos_certificados WHERE id = ?`,
        [id]
      );
      rows = r;
    } catch (e) {
      const [r] = await db.execute(
        `SELECT id, nombre, configuracion, fondo_certificado,
                created_at, updated_at
         FROM disenos_certificados WHERE id = ?`,
        [id]
      );
      rows = r;
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const row = rows[0];
    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (err) {
        console.error('Error al parsear JSON de diseño:', err);
        return {};
      }
    };
    const camposJson = row.campos_json !== undefined ? parseJsonSafe(row.campos_json) : parseJsonSafe(row.configuracion);
    const fondoUrl = row.fondo_url || (row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null);

    const payload = {
      id: row.id,
      nombre: row.nombre,
      campos_json: camposJson,
      configuracion: camposJson,
      incluye_qr: row.incluye_qr !== undefined ? !!row.incluye_qr : true,
      fondoUrl,
      fondoCertificado: row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    res.json(payload);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Subir imagen individual
router.post('/upload', authenticateToken, (req, res) => {
  const uploadSingle = upload.single('imagen');
  
  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error('Error en upload:', err);
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    
    try {
      res.json({
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/certificados/${req.file.filename}`,
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// POST - Crear nueva configuración de diseño con URLs
router.post('/save-with-urls', authenticateToken, async (req, res) => {
  try {
    const { nombre, configuracion, campos_json, fondoCertificado, fondo_url, activa, incluye_qr } = req.body;
    const configToUse = (campos_json ?? configuracion);
    if (!nombre || !configToUse) {
      return res.status(400).json({ error: 'Nombre y configuración (campos_json) son requeridos' });
    }

    // Extraer solo el nombre del archivo de las URLs
    const fondoCertificadoFilename = fondoCertificado ? fondoCertificado.replace('/uploads/certificados/', '') : null;

    // Detectar columnas nuevas en tabla
    let hasNewCols = false;
    try {
      const [cols] = await db.execute(`SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'disenos_certificados' AND COLUMN_NAME IN ('campos_json','fondo_url','incluye_qr')`);
      hasNewCols = Array.isArray(cols) && cols.length >= 1;
    } catch (_) {}

    let result;
    if (hasNewCols) {
      const insertQuery = `
        INSERT INTO disenos_certificados 
        (nombre, campos_json, fondo_url, incluye_qr, fondo_certificado, activa, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const [r] = await db.execute(insertQuery, [
        nombre,
        JSON.stringify(configToUse),
        fondo_url || (fondoCertificadoFilename ? `/uploads/certificados/${fondoCertificadoFilename}` : null),
        incluye_qr === undefined ? 1 : (incluye_qr ? 1 : 0),
        fondoCertificadoFilename,
        activa || 0
      ]);
      result = r;
    } else {
      const insertQuery = `
        INSERT INTO disenos_certificados 
        (nombre, configuracion, fondo_certificado, activa, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      const [r] = await db.execute(insertQuery, [
        nombre,
        JSON.stringify(configToUse),
        fondoCertificadoFilename,
        activa || 0
      ]);
      result = r;
    }

    res.status(201).json({
      success: true,
      message: 'Configuración creada exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
 // POST - Crear nueva configuración de diseño (ruta original con FormData)
 router.post('/', authenticateToken, (req, res) => {
   uploadFields(req, res, async (err) => {
     if (err) {
       console.error('Error en upload:', err);
       return res.status(400).json({ error: err.message });
     }
     
     try {
       const { nombre, configuracion } = req.body;
       
       if (!nombre || !configuracion) {
         return res.status(400).json({ error: 'Nombre y configuración son requeridos' });
       }
       
       // Obtener nombres de archivos subidos
       const fondoCertificado = req.files?.fondoCertificado?.[0]?.filename || null;
       
       const query = `
         INSERT INTO disenos_certificados 
         (nombre, configuracion, fondo_certificado, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())
       `;
      
      const [result] = await db.execute(query, [
        nombre,
        typeof configuracion === 'string' ? configuracion : JSON.stringify(configuracion),
        fondoCertificado
      ]);
      
      res.status(201).json({
        id: result.insertId,
        nombre,
        configuracion: typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion,
        fondoCertificado: fondoCertificado ? `/uploads/certificados/${fondoCertificado}` : null,
        message: 'Configuración guardada exitosamente'
      });
      
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// PUT - Actualizar configuración de diseño con URLs
router.put('/update-with-urls/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, configuracion, campos_json, fondoCertificado, fondo_url, activa, incluye_qr } = req.body;
    const configToUse = (campos_json ?? configuracion);
    
    if (!nombre || !configToUse) {
      return res.status(400).json({ error: 'Nombre y configuración (campos_json) son requeridos' });
    }
    
    // Verificar si la configuración existe
    const checkQuery = 'SELECT * FROM disenos_certificados WHERE id = ?';
    const [existing] = await db.execute(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    // Extraer solo el nombre del archivo de las URLs
    const fondoCertificadoFilename = fondoCertificado ? fondoCertificado.replace('/uploads/certificados/', '') : null;

    // Detectar columnas nuevas
    let hasNewCols = false;
    try {
      const [cols] = await db.execute(`SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'disenos_certificados' AND COLUMN_NAME IN ('campos_json','fondo_url','incluye_qr')`);
      hasNewCols = Array.isArray(cols) && cols.length >= 1;
    } catch (_) {}

    if (hasNewCols) {
      const updateQuery = `
        UPDATE disenos_certificados 
        SET nombre = ?, campos_json = ?, fondo_url = ?, incluye_qr = ?, fondo_certificado = ?, activa = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await db.execute(updateQuery, [
        nombre,
        JSON.stringify(configToUse),
        fondo_url || (fondoCertificadoFilename ? `/uploads/certificados/${fondoCertificadoFilename}` : null),
        incluye_qr === undefined ? 1 : (incluye_qr ? 1 : 0),
        fondoCertificadoFilename,
        activa || 0,
        id
      ]);
    } else {
      const updateQuery = `
        UPDATE disenos_certificados 
        SET nombre = ?, configuracion = ?, fondo_certificado = ?, activa = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await db.execute(updateQuery, [
        nombre,
        JSON.stringify(configToUse),
        fondoCertificadoFilename,
        activa || 0,
        id
      ]);
    }
    
    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar configuración de diseño (ruta original con FormData)
router.put('/:id', authenticateToken, (req, res) => {
  uploadFields(req, res, async (err) => {
    if (err) {
      console.error('Error en upload:', err);
      return res.status(400).json({ error: err.message });
    }
    
    try {
      const { id } = req.params;
      const { nombre, configuracion } = req.body;
      
      if (!nombre || !configuracion) {
        return res.status(400).json({ error: 'Nombre y configuración son requeridos' });
      }
      
      // Verificar si la configuración existe
      const checkQuery = 'SELECT * FROM disenos_certificados WHERE id = ?';
      const [existing] = await db.execute(checkQuery, [id]);
      
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Configuración no encontrada' });
      }
      
      // Obtener nombres de archivos subidos (si hay nuevos)
      const logoIzquierdo = null;
      const logoDerecho = null;
      const fondoCertificado = req.files?.fondoCertificado?.[0]?.filename || existing[0].fondo_certificado;
      
      // Si hay archivos nuevos, eliminar los antiguos
      // Campos de logos eliminados: no se procesan ni se borran
      
      if (req.files?.fondoCertificado && existing[0].fondo_certificado) {
        const oldPath = path.join(__dirname, '../uploads/certificados', existing[0].fondo_certificado);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      const updateQuery = `
        UPDATE disenos_certificados 
        SET nombre = ?, configuracion = ?, 
            fondo_certificado = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await db.execute(updateQuery, [
        nombre,
        typeof configuracion === 'string' ? configuracion : JSON.stringify(configuracion),
        fondoCertificado,
        id
      ]);
      
      res.json({
        id: parseInt(id),
        nombre,
        configuracion: typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion,
        fondoCertificado: fondoCertificado ? `/uploads/certificados/${fondoCertificado}` : null,
        message: 'Configuración actualizada exitosamente'
      });
      
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// DELETE - Eliminar configuración
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información de la configuración antes de eliminarla
    const selectQuery = 'SELECT * FROM disenos_certificados WHERE id = ?';
    const [rows] = await db.execute(selectQuery, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    const config = rows[0];
    
    // Eliminar archivos asociados
    const filesToDelete = [config.fondo_certificado]
      .filter(filename => filename);
    
    filesToDelete.forEach(filename => {
      const filePath = path.join(__dirname, '../uploads/certificados', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Eliminar registro de la base de datos
    const deleteQuery = 'DELETE FROM disenos_certificados WHERE id = ?';
    await db.execute(deleteQuery, [id]);
    
    res.json({ message: 'Configuración eliminada exitosamente' });
    
  } catch (error) {
    console.error('Error al eliminar configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Activar una configuración específica
router.put('/:id/activar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero desactivar todas las configuraciones
    await db.execute('UPDATE disenos_certificados SET activa = FALSE');
    
    // Luego activar la configuración seleccionada
    const [result] = await db.execute(
      'UPDATE disenos_certificados SET activa = TRUE WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json({ message: 'Configuración activada exitosamente' });
  } catch (error) {
    console.error('Error al activar configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener configuración activa (preferir marcada como activa; si no, la más reciente)
router.get('/activa/current', authenticateToken, async (req, res) => {
  try {
    // Intentar obtener columnas nuevas, fallback a antiguas
    let activeRows;
    try {
      const [r] = await db.execute(`
        SELECT id, nombre, campos_json, fondo_url, incluye_qr, fondo_certificado, configuracion
        FROM disenos_certificados 
        WHERE activa = TRUE
        ORDER BY updated_at DESC 
        LIMIT 1
      `);
      activeRows = r;
    } catch (_) {
      const [r] = await db.execute(`
        SELECT id, nombre, configuracion, fondo_certificado
        FROM disenos_certificados 
        WHERE activa = TRUE
        ORDER BY updated_at DESC 
        LIMIT 1
      `);
      activeRows = r;
    }

    let row = activeRows[0];
    // Si no hay activa, tomar la más reciente
    if (!row) {
      try {
        const [latestRows] = await db.execute(`
          SELECT id, nombre, campos_json, fondo_url, incluye_qr, fondo_certificado, configuracion
          FROM disenos_certificados 
          ORDER BY updated_at DESC 
          LIMIT 1
        `);
        row = latestRows[0];
      } catch (_) {
        const [latestRows] = await db.execute(`
          SELECT id, nombre, configuracion, fondo_certificado
          FROM disenos_certificados 
          ORDER BY updated_at DESC 
          LIMIT 1
        `);
        row = latestRows[0];
      }
    }

    if (!row) {
      return res.json(null); // No hay configuraciones guardadas
    }

    // Parsear JSON seguros
    const parseJsonSafe = (val) => {
      try {
        return typeof val === 'string' ? JSON.parse(val) : (val || {});
      } catch (err) {
        console.error('Error parsing configuracion activa:', err);
        return {};
      }
    };
    const camposJson = row.campos_json !== undefined ? parseJsonSafe(row.campos_json) : parseJsonSafe(row.configuracion);
    const fondoUrl = row.fondo_url || (row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null);

    const payload = {
      id: row.id,
      nombre: row.nombre,
      campos_json: camposJson,
      configuracion: camposJson,
      incluye_qr: row.incluye_qr !== undefined ? !!row.incluye_qr : true,
      fondoUrl,
      fondoCertificado: row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null
    };

    res.json(payload);
  } catch (error) {
    console.error('Error al obtener configuración activa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

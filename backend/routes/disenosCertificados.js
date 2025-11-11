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
  { name: 'logoIzquierdo', maxCount: 1 },
  { name: 'logoDerecho', maxCount: 1 },
  { name: 'fondoCertificado', maxCount: 1 }
]);

// GET - Obtener todas las configuraciones de diseño
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, configuracion, logo_izquierdo, logo_derecho, fondo_certificado, 
             created_at, updated_at
      FROM disenos_certificados 
      ORDER BY created_at DESC
    `;
    
    const [rows] = await db.execute(query);
    
    // Procesar las configuraciones para incluir URLs completas de imágenes
    const configuraciones = rows.map(row => {
      let configuracion;
      try {
        // Si ya es un objeto, usarlo directamente; si es string, parsearlo
        configuracion = typeof row.configuracion === 'string' 
          ? JSON.parse(row.configuracion) 
          : row.configuracion;
      } catch (error) {
        console.error('Error parsing configuracion for row:', row.id, error);
        // Configuración por defecto si hay error
        configuracion = {
          titulo: { x: 400, y: 200, fontSize: 32, color: '#000000' },
          nombreEstudiante: { x: 400, y: 280, fontSize: 24, color: '#000000' },
          descripcion: { x: 400, y: 350, fontSize: 16, color: '#000000' },
          fecha: { x: 400, y: 400, fontSize: 14, color: '#000000' },
          codigo: { x: 400, y: 450, fontSize: 12, color: '#000000' },
          logoIzquierdo: { x: 50, y: 50, width: 100, height: 100 },
          logoDerecho: { x: 650, y: 50, width: 100, height: 100 }
        };
      }
      
      return {
        id: row.id,
        nombre: row.nombre,
        configuracion: configuracion,
        logoIzquierdo: row.logo_izquierdo ? `/uploads/certificados/${row.logo_izquierdo}` : null,
        logoDerecho: row.logo_derecho ? `/uploads/certificados/${row.logo_derecho}` : null,
        fondoCertificado: row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null,
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
    
    const query = `
      SELECT id, nombre, configuracion, logo_izquierdo, logo_derecho, fondo_certificado,
             created_at, updated_at
      FROM disenos_certificados 
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    const row = rows[0];
    
    // Manejar el parsing de configuracion de forma segura
    let parsedConfiguracion;
    try {
      parsedConfiguracion = typeof row.configuracion === 'string' ? JSON.parse(row.configuracion) : row.configuracion;
    } catch (error) {
      console.error('Error al parsear configuracion:', error);
      parsedConfiguracion = {}; // Configuración por defecto
    }
    
    const configuracion = {
      id: row.id,
      nombre: row.nombre,
      configuracion: parsedConfiguracion,
      logoIzquierdo: row.logo_izquierdo ? `/uploads/certificados/${row.logo_izquierdo}` : null,
      logoDerecho: row.logo_derecho ? `/uploads/certificados/${row.logo_derecho}` : null,
      fondoCertificado: row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    
    res.json(configuracion);
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
    const { nombre, configuracion, logoIzquierdo, logoDerecho, fondoCertificado, activa } = req.body;
    
    if (!nombre || !configuracion) {
      return res.status(400).json({ error: 'Nombre y configuración son requeridos' });
    }
    
    // Extraer solo el nombre del archivo de las URLs
    const logoIzquierdoFilename = logoIzquierdo ? logoIzquierdo.replace('/uploads/certificados/', '') : null;
    const logoDerechoFilename = logoDerecho ? logoDerecho.replace('/uploads/certificados/', '') : null;
    const fondoCertificadoFilename = fondoCertificado ? fondoCertificado.replace('/uploads/certificados/', '') : null;
    
    const query = `
       INSERT INTO disenos_certificados 
       (nombre, configuracion, logo_izquierdo, logo_derecho, fondo_certificado, activa, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
     `;
     
     const [result] = await db.execute(query, [
       nombre,
       JSON.stringify(configuracion),
       logoIzquierdoFilename,
       logoDerechoFilename,
       fondoCertificadoFilename,
       activa || 0
     ]);
     
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
       const logoIzquierdo = req.files?.logoIzquierdo?.[0]?.filename || null;
       const logoDerecho = req.files?.logoDerecho?.[0]?.filename || null;
       const fondoCertificado = req.files?.fondoCertificado?.[0]?.filename || null;
       
       const query = `
         INSERT INTO disenos_certificados 
         (nombre, configuracion, logo_izquierdo, logo_derecho, fondo_certificado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       `;
      
      const [result] = await db.execute(query, [
        nombre,
        typeof configuracion === 'string' ? configuracion : JSON.stringify(configuracion),
        logoIzquierdo,
        logoDerecho,
        fondoCertificado
      ]);
      
      res.status(201).json({
        id: result.insertId,
        nombre,
        configuracion: typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion,
        logoIzquierdo: logoIzquierdo ? `/uploads/certificados/${logoIzquierdo}` : null,
        logoDerecho: logoDerecho ? `/uploads/certificados/${logoDerecho}` : null,
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
    const { nombre, configuracion, logoIzquierdo, logoDerecho, fondoCertificado, activa } = req.body;
    
    if (!nombre || !configuracion) {
      return res.status(400).json({ error: 'Nombre y configuración son requeridos' });
    }
    
    // Verificar si la configuración existe
    const checkQuery = 'SELECT * FROM disenos_certificados WHERE id = ?';
    const [existing] = await db.execute(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    // Extraer solo el nombre del archivo de las URLs
    const logoIzquierdoFilename = logoIzquierdo ? logoIzquierdo.replace('/uploads/certificados/', '') : null;
    const logoDerechoFilename = logoDerecho ? logoDerecho.replace('/uploads/certificados/', '') : null;
    const fondoCertificadoFilename = fondoCertificado ? fondoCertificado.replace('/uploads/certificados/', '') : null;
    
    const updateQuery = `
      UPDATE disenos_certificados 
      SET nombre = ?, configuracion = ?, logo_izquierdo = ?, logo_derecho = ?, fondo_certificado = ?, activa = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(updateQuery, [
      nombre,
      JSON.stringify(configuracion),
      logoIzquierdoFilename,
      logoDerechoFilename,
      fondoCertificadoFilename,
      activa || 0,
      id
    ]);
    
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
      const logoIzquierdo = req.files?.logoIzquierdo?.[0]?.filename || existing[0].logo_izquierdo;
      const logoDerecho = req.files?.logoDerecho?.[0]?.filename || existing[0].logo_derecho;
      const fondoCertificado = req.files?.fondoCertificado?.[0]?.filename || existing[0].fondo_certificado;
      
      // Si hay archivos nuevos, eliminar los antiguos
      if (req.files?.logoIzquierdo && existing[0].logo_izquierdo) {
        const oldPath = path.join(__dirname, '../uploads/certificados', existing[0].logo_izquierdo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      if (req.files?.logoDerecho && existing[0].logo_derecho) {
        const oldPath = path.join(__dirname, '../uploads/certificados', existing[0].logo_derecho);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      if (req.files?.fondoCertificado && existing[0].fondo_certificado) {
        const oldPath = path.join(__dirname, '../uploads/certificados', existing[0].fondo_certificado);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      const updateQuery = `
        UPDATE disenos_certificados 
        SET nombre = ?, configuracion = ?, logo_izquierdo = ?, logo_derecho = ?, 
            fondo_certificado = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await db.execute(updateQuery, [
        nombre,
        typeof configuracion === 'string' ? configuracion : JSON.stringify(configuracion),
        logoIzquierdo,
        logoDerecho,
        fondoCertificado,
        id
      ]);
      
      res.json({
        id: parseInt(id),
        nombre,
        configuracion: typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion,
        logoIzquierdo: logoIzquierdo ? `/uploads/certificados/${logoIzquierdo}` : null,
        logoDerecho: logoDerecho ? `/uploads/certificados/${logoDerecho}` : null,
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
    const filesToDelete = [config.logo_izquierdo, config.logo_derecho, config.fondo_certificado]
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

// GET - Obtener configuración activa (la más reciente o marcada como activa)
router.get('/activa/current', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, configuracion, logo_izquierdo, logo_derecho, fondo_certificado
      FROM disenos_certificados 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    
    const [rows] = await db.execute(query);
    
    if (rows.length === 0) {
      return res.json(null); // No hay configuraciones guardadas
    }
    
    const row = rows[0];
    
    // Verificar si configuracion ya es un objeto o necesita parsing
    let configuracionParsed;
    try {
      configuracionParsed = typeof row.configuracion === 'string' 
        ? JSON.parse(row.configuracion) 
        : row.configuracion;
    } catch (parseError) {
      console.error('Error parsing configuracion:', parseError);
      configuracionParsed = {};
    }
    
    const configuracion = {
      id: row.id,
      nombre: row.nombre,
      configuracion: configuracionParsed,
      logoIzquierdo: row.logo_izquierdo ? `/uploads/certificados/${row.logo_izquierdo}` : null,
      logoDerecho: row.logo_derecho ? `/uploads/certificados/${row.logo_derecho}` : null,
      fondoCertificado: row.fondo_certificado ? `/uploads/certificados/${row.fondo_certificado}` : null
    };
    
    res.json(configuracion);
  } catch (error) {
    console.error('Error al obtener configuración activa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
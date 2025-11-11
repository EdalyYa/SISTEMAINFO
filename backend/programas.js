const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'programas');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'programa-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: function (req, file, cb) {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

module.exports = (pool, auth) => {
  const router = express.Router();

  // Ruta pública para obtener programas activos (sin autenticación)
  router.get('/public', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM programas WHERE estado = ? ORDER BY id DESC', ['activo']);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching public programas:', error);
      res.status(500).json({ error: 'Error fetching programas' });
    }
  });

  // Middleware para proteger rutas administrativas
  router.use(auth.authenticateToken);

  // Obtener todos los programas con contadores de módulos y cursos
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.*, 
          (SELECT COUNT(*) FROM modulos m WHERE m.programa_id = p.id) AS modulos_count,
          (SELECT COUNT(*) FROM cursos c WHERE c.programa_id = p.id) AS cursos_count
        FROM programas p
        ORDER BY p.id DESC
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching programas:', error);
      res.status(500).json({ error: 'Error fetching programas' });
    }
  });

  // Crear nuevo programa
  router.post('/', async (req, res) => {
    try {
      const { nombre, descripcion, duracion, modalidad, precio, estado, imagen, color, icono } = req.body;
      
      // Validar campos requeridos
      if (!nombre || !descripcion || !duracion) {
        return res.status(400).json({ error: 'Nombre, descripción y duración son requeridos' });
      }

      const [result] = await pool.query(
        'INSERT INTO programas (nombre, descripcion, duracion, modalidad, precio, estado, imagen, color, icono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, duracion, modalidad || 'presencial', precio || null, estado || 'activo', imagen || null, color || '#3B82F6', icono || 'AcademicCapIcon']
      );

      res.status(201).json({ 
        id: result.insertId, 
        message: 'Programa creado exitosamente',
        programa: {
          id: result.insertId,
          nombre,
          descripcion,
          duracion,
          modalidad: modalidad || 'presencial',
          precio: precio || null,
          estado: estado || 'activo',
          imagen: imagen || null,
          color: color || '#3B82F6',
          icono: icono || 'AcademicCapIcon'
        }
      });
    } catch (error) {
      console.error('Error creating programa:', error);
      res.status(500).json({ error: 'Error al crear programa' });
    }
  });

  // Actualizar programa
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, duracion, modalidad, precio, estado, imagen, color, icono } = req.body;
      
      // Validar campos requeridos
      if (!nombre || !descripcion || !duracion) {
        return res.status(400).json({ error: 'Nombre, descripción y duración son requeridos' });
      }

      const [result] = await pool.query(
        'UPDATE programas SET nombre = ?, descripcion = ?, duracion = ?, modalidad = ?, precio = ?, estado = ?, imagen = ?, color = ?, icono = ? WHERE id = ?',
        [nombre, descripcion, duracion, modalidad || 'presencial', precio || null, estado || 'activo', imagen || null, color || '#3B82F6', icono || 'AcademicCapIcon', id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Programa no encontrado' });
      }

      res.json({ 
        message: 'Programa actualizado exitosamente',
        programa: {
          id: parseInt(id),
          nombre,
          descripcion,
          duracion,
          modalidad: modalidad || 'presencial',
          precio: precio || null,
          estado: estado || 'activo',
          imagen: imagen || null,
          color: color || '#3B82F6',
          icono: icono || 'AcademicCapIcon'
        }
      });
    } catch (error) {
      console.error('Error updating programa:', error);
      res.status(500).json({ error: 'Error al actualizar programa' });
    }
  });

  // Eliminar programa
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.query('DELETE FROM programas WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Programa no encontrado' });
      }

      res.json({ message: 'Programa eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting programa:', error);
      res.status(500).json({ error: 'Error al eliminar programa' });
    }
  });

  // Ruta para subir imagen
  router.post('/upload-image', upload.single('imagen'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      // Generar URL de la imagen
      const imageUrl = `/uploads/programas/${req.file.filename}`;
      
      res.json({ 
        message: 'Imagen subida exitosamente',
        imageUrl: imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Error al subir imagen' });
    }
  });

  // Obtener programa por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM programas WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Programa no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching programa:', error);
      res.status(500).json({ error: 'Error fetching programa' });
    }
  });

  return router;
};

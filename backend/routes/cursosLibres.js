const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

module.exports = (pool, auth) => {
  const router = express.Router();

  // Configuración de subida de imagen para cursos libres
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'cursos_libres');
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '').toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      const id = Date.now().toString(36);
      const safeBase = base.slice(0, 24);
      cb(null, `${id}_${safeBase}${ext}`);
    }
  });
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (/\.(png|jpg|jpeg|gif)$/i.test(file.originalname)) cb(null, true);
      else cb(new Error('Formato de imagen no permitido'));
    }
  });

  // Obtener todos los cursos libres (público)
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM cursos_libres 
        WHERE estado = 'activo' 
        ORDER BY categoria, nombre
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching cursos libres:', error);
      res.status(500).json({ error: 'Error fetching cursos libres' });
    }
  });

  // Obtener curso libre por ID (público)
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM cursos_libres WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Curso libre no encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching curso libre:', error);
      res.status(500).json({ error: 'Error fetching curso libre' });
    }
  });

  // Middleware para proteger rutas de administración
  router.use('/admin', auth.authenticateToken);

  // ADMIN: Subir imagen y devolver URL pública
  router.post('/admin/upload-image', upload.single('imagen'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió archivo' });
      }
      const publicUrl = `/uploads/cursos_libres/${req.file.filename}`;
      res.json({ url: publicUrl, filename: req.file.filename });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Error al subir la imagen' });
    }
  });

  // ADMIN: Obtener todos los cursos libres (incluyendo inactivos)
  router.get('/admin/all', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM cursos_libres 
        ORDER BY categoria, nombre
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching all cursos libres:', error);
      res.status(500).json({ error: 'Error fetching all cursos libres' });
    }
  });

  // ADMIN: Crear nuevo curso libre
  router.post('/admin', async (req, res) => {
    try {
      const {
        nombre,
        categoria,
        icono,
        color,
        descripcion,
        duracion,
        modalidad,
        nivel,
        instructor,
        precio,
        estado = 'activo',
        horario // texto para horarios (dias)
      } = req.body;

      // Permitir formulario simplificado: establecer valores por defecto si faltan
      if (!nombre) {
        return res.status(400).json({ error: 'Nombre es requerido' });
      }
      const _categoria = categoria || 'analisis';
      const _color = color || 'from-blue-500 to-blue-700';
      const _descripcion = descripcion || '';
      const _duracion = duracion || '';
      const _modalidad = (modalidad || 'virtual');
      const _nivel = nivel || 'basico';
      const _instructor = instructor || '';
      const _precio = precio || 0;
      const _estado = estado || 'activo';

      const iconoNombre = icono ? path.basename(String(icono)) : '📚';
      const iconoSafe = iconoNombre.slice(0, 50);
      const [result] = await pool.query(`
        INSERT INTO cursos_libres 
        (nombre, categoria, icono, color, descripcion, duracion, modalidad, nivel, instructor, precio, estado, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [nombre, _categoria, iconoSafe, _color, _descripcion, _duracion, _modalidad, _nivel, _instructor, _precio, _estado]);

      const courseId = result.insertId;

      // Crear horario vinculado (área CURSOS LIBRES) si viene en la petición
      if (horario && typeof horario === 'string') {
        const area = 'CURSOS LIBRES';
        const nombre_curso = nombre;
        const dias = horario;
        const grupo = `CL${courseId}`; // código de grupo automático
        const modalidadHorario = (_modalidad || 'virtual').toUpperCase(); // VIRTUAL/PRESENCIAL
        const instructorHorario = _instructor || '';

        await pool.query(`
          INSERT INTO horarios (area, nombre_curso, dias, grupo, modalidad, instructor, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [area, nombre_curso, dias, grupo, modalidadHorario === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL', instructorHorario, _estado]);
      }

      const [newCourse] = await pool.query('SELECT * FROM cursos_libres WHERE id = ?', [courseId]);
      res.status(201).json(newCourse[0]);
    } catch (error) {
      console.error('Error creating curso libre:', error);
      res.status(500).json({ error: 'Error creating curso libre' });
    }
  });

  // ADMIN: Actualizar curso libre
  router.put('/admin/:id', async (req, res) => {
    try {
      const {
        nombre,
        categoria,
        icono,
        color,
        descripcion,
        duracion,
        modalidad,
        nivel,
        instructor,
        precio,
        estado,
        horario
      } = req.body;

      // Obtener actuales para defaults
      const [existing] = await pool.query('SELECT * FROM cursos_libres WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Curso libre no encontrado' });
      }

      const _categoria = categoria || existing[0].categoria || 'analisis';
      const _color = color || existing[0].color || 'from-blue-500 to-blue-700';
      const _descripcion = descripcion ?? existing[0].descripcion ?? '';
      const _duracion = duracion ?? existing[0].duracion ?? '';
      const _modalidad = (modalidad || existing[0].modalidad || 'virtual');
      const _nivel = nivel || existing[0].nivel || 'basico';
      const _instructor = instructor ?? existing[0].instructor ?? '';
      const _precio = precio ?? existing[0].precio ?? 0;
      const _estado = estado || existing[0].estado || 'activo';
      const iconoNombre = (icono ? path.basename(String(icono)) : (existing[0].icono || '📚'));
      const iconoSafe = iconoNombre.slice(0, 50);

      const [result] = await pool.query(`
        UPDATE cursos_libres 
        SET nombre = ?, categoria = ?, icono = ?, color = ?, descripcion = ?, 
            duracion = ?, modalidad = ?, nivel = ?, instructor = ?, precio = ?, 
            estado = ?, fecha_actualizacion = NOW()
        WHERE id = ?
      `, [nombre, _categoria, iconoSafe, _color, _descripcion, _duracion, _modalidad, _nivel, _instructor, _precio, _estado, req.params.id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Curso libre no encontrado' });
      }

      // Upsert del horario vinculado
      if (horario && typeof horario === 'string') {
        const grupo = `CL${req.params.id}`;
        const area = 'CURSOS LIBRES';
        const nombre_curso = nombre || existing[0].nombre;
        const dias = horario;
        const modalidadHorario = (_modalidad || 'virtual').toUpperCase();
        const instructorHorario = _instructor || '';

        // Verificar si existe
        const [h] = await pool.query('SELECT id FROM horarios WHERE grupo = ?', [grupo]);
        if (h.length > 0) {
          await pool.query(`
            UPDATE horarios 
            SET area = ?, nombre_curso = ?, dias = ?, modalidad = ?, instructor = ?, estado = ?
            WHERE grupo = ?
          `, [area, nombre_curso, dias, modalidadHorario === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL', instructorHorario, _estado, grupo]);
        } else {
          await pool.query(`
            INSERT INTO horarios (area, nombre_curso, dias, grupo, modalidad, instructor, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [area, nombre_curso, dias, grupo, modalidadHorario === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL', instructorHorario, _estado]);
        }
      }

      const [updatedCourse] = await pool.query('SELECT * FROM cursos_libres WHERE id = ?', [req.params.id]);
      res.json(updatedCourse[0]);
    } catch (error) {
      console.error('Error updating curso libre:', error);
      res.status(500).json({ error: 'Error updating curso libre' });
    }
  });

  // ADMIN: Eliminar curso libre
  router.delete('/admin/:id', async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM cursos_libres WHERE id = ?', [req.params.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Curso libre no encontrado' });
      }

      res.json({ message: 'Curso libre eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting curso libre:', error);
      res.status(500).json({ error: 'Error deleting curso libre' });
    }
  });

  // ADMIN: Cambiar estado del curso libre (activar/desactivar)
  router.patch('/admin/:id/estado', async (req, res) => {
    try {
      const { estado } = req.body;
      
      if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ error: 'Estado debe ser "activo" o "inactivo"' });
      }

      const [result] = await pool.query(`
        UPDATE cursos_libres 
        SET estado = ?, fecha_actualizacion = NOW()
        WHERE id = ?
      `, [estado, req.params.id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Curso libre no encontrado' });
      }

      const [updatedCourse] = await pool.query('SELECT * FROM cursos_libres WHERE id = ?', [req.params.id]);
      res.json(updatedCourse[0]);
    } catch (error) {
      console.error('Error updating curso libre status:', error);
      res.status(500).json({ error: 'Error updating curso libre status' });
    }
  });

  // ADMIN: Obtener estadísticas de cursos libres
  router.get('/admin/stats', async (req, res) => {
    try {
      const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM cursos_libres');
      const [activosRows] = await pool.query('SELECT COUNT(*) as activos FROM cursos_libres WHERE estado = "activo"');
      const [categoriasRows] = await pool.query(`
        SELECT categoria, COUNT(*) as cantidad 
        FROM cursos_libres 
        WHERE estado = 'activo'
        GROUP BY categoria 
        ORDER BY cantidad DESC
      `);

      res.json({
        total: totalRows[0].total,
        activos: activosRows[0].activos,
        inactivos: totalRows[0].total - activosRows[0].activos,
        categorias: categoriasRows
      });
    } catch (error) {
      console.error('Error fetching cursos libres stats:', error);
      res.status(500).json({ error: 'Error fetching cursos libres stats' });
    }
  });

  return router;
};

const express = require('express');
const ApiError = require('./ApiError');

module.exports = (pool, { authenticateToken }) => {
  const router = express.Router();

  // Helper: sincronizar horarios para cursos normales (CN) y cursos libres (CL)
  const syncHorarios = async () => {
    // Cursos Libres -> CL{id}
    try {
      const [libres] = await pool.execute('SELECT id, nombre, modalidad, instructor, estado FROM cursos_libres');
      // Si la tabla no tiene columna "horario", no se realiza sincronización automática desde cursos_libres.
      // Los horarios para CL se crean/actualizan desde las rutas admin al recibir el campo "horario".
      // Esta sección queda como no-op para evitar errores en proveedores con esquemas anteriores.
    } catch (e) {
      console.warn('Sync cursos libres error:', e.message);
    }

    // Cursos normales -> CN{id}
    try {
      const [normales] = await pool.execute(`
        SELECT c.id, c.nombre, c.modalidad, c.instructor, c.horario, c.programa_id, p.nombre AS programa_nombre
        FROM cursos c
        LEFT JOIN programas p ON p.id = c.programa_id
      `);
      for (const c of normales) {
        if (c && typeof c.horario === 'string' && c.horario.trim().length > 0) {
          const grupo = `CN${c.id}`;
          const nombre_curso = c.nombre;
          const dias = c.horario;
          const modalidad = (c.modalidad || 'virtual').toUpperCase() === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL';
          const instructor = c.instructor || '';
          const estado = 'activo';
          const area = c.programa_nombre ? `AREA: ${c.programa_nombre}` : 'CURSOS INFONA';

          const [exists] = await pool.execute('SELECT id FROM horarios WHERE grupo = ?', [grupo]);
          if (exists.length > 0) {
            await pool.execute(
              'UPDATE horarios SET area = ?, nombre_curso = ?, dias = ?, modalidad = ?, instructor = ?, estado = ? WHERE grupo = ?',
              [area, nombre_curso, dias, modalidad, instructor, estado, grupo]
            );
          } else {
            await pool.execute(
              'INSERT INTO horarios (area, nombre_curso, dias, grupo, modalidad, instructor, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [area, nombre_curso, dias, grupo, modalidad, instructor, estado]
            );
          }
        }
      }
    } catch (e) {
      console.warn('Sync cursos normales error:', e.message);
    }
  };

  // GET /api/horarios - Lista pública plana de horarios activos (sin áreas)
  router.get('/', async (req, res, next) => {
    try {
      // Asegurar que los horarios de Cursos (CN) y Cursos Libres (CL) estén sincronizados
      // antes de exponerlos públicamente.
      await syncHorarios();

      const [rows] = await pool.execute(`
        SELECT id, area, nombre_curso, dias, grupo, modalidad, instructor, estado 
        FROM horarios 
        WHERE estado = 'activo' 
        ORDER BY nombre_curso, grupo
      `);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  // GET /api/horarios/admin - Obtener todos los horarios para administración
  router.get('/admin', authenticateToken, async (req, res, next) => {
  try {
    // Ejecutar sincronización antes de listar
    await syncHorarios();
    const [rows] = await pool.execute(`
      SELECT * FROM horarios 
      ORDER BY creado_en DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

  // GET /api/horarios/:id - Obtener un horario específico (público)
  router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM horarios WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      throw new ApiError(404, 'Horario no encontrado');
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

  // POST /api/horarios - Crear nuevo horario (admin)
  router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { area, nombre_curso, dias, grupo, modalidad, instructor } = req.body;
    
    // Validaciones (área ya no es obligatorio)
    if (!nombre_curso || !dias || !grupo) {
      throw new ApiError(400, 'Los campos nombre del curso, días y grupo son obligatorios');
    }
    
    // Verificar que no exista un horario con el mismo grupo
    const [existing] = await pool.execute(
      'SELECT id FROM horarios WHERE grupo = ? AND estado = "activo"', 
      [grupo]
    );
    
    if (existing.length > 0) {
      throw new ApiError(400, 'Ya existe un horario activo con ese código de grupo');
    }
    
    const [result] = await pool.execute(`
      INSERT INTO horarios (area, nombre_curso, dias, grupo, modalidad, instructor) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [area || '', nombre_curso, dias, grupo, modalidad || 'VIRTUAL', instructor]);
    
    // Obtener el horario creado
    const [newHorario] = await pool.execute('SELECT * FROM horarios WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      message: 'Horario creado exitosamente',
      horario: newHorario[0]
    });
  } catch (error) {
    next(error);
  }
});

  // PUT /api/horarios/:id - Actualizar horario (admin)
  router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { area, nombre_curso, dias, grupo, modalidad, instructor, estado } = req.body;
    
    // Verificar que el horario existe
    const [existing] = await pool.execute('SELECT * FROM horarios WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Horario no encontrado');
    }
    
    // Verificar que no exista otro horario con el mismo grupo (si se está cambiando)
    if (grupo && grupo !== existing[0].grupo) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM horarios WHERE grupo = ? AND id != ? AND estado = "activo"', 
        [grupo, id]
      );
      
      if (duplicate.length > 0) {
        throw new ApiError(400, 'Ya existe otro horario activo con ese código de grupo');
      }
    }
    
    const [result] = await pool.execute(`
      UPDATE horarios 
      SET area = ?, nombre_curso = ?, dias = ?, grupo = ?, modalidad = ?, instructor = ?, estado = ?
      WHERE id = ?
    `, [
      area || existing[0].area,
      nombre_curso || existing[0].nombre_curso,
      dias || existing[0].dias,
      grupo || existing[0].grupo,
      modalidad || existing[0].modalidad,
      instructor || existing[0].instructor,
      estado || existing[0].estado,
      id
    ]);
    
    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Horario no encontrado');
    }
    
    // Obtener el horario actualizado
    const [updatedHorario] = await pool.execute('SELECT * FROM horarios WHERE id = ?', [id]);
    
    res.json({
      message: 'Horario actualizado exitosamente',
      horario: updatedHorario[0]
    });
  } catch (error) {
    next(error);
  }
});

  // DELETE /api/horarios/:id - Eliminar horario (soft delete) (admin)
  router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE horarios SET estado = "inactivo" WHERE id = ?', 
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Horario no encontrado');
    }
    
    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

  // GET /api/horarios/areas/list - Obtener lista de áreas únicas (público)
  router.get('/areas/list', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT DISTINCT area FROM horarios 
      WHERE estado = 'activo' 
      ORDER BY area
    `);
    
    const areas = rows.map(row => row.area);
    res.json(areas);
  } catch (error) {
    next(error);
  }
});

  return router;
};

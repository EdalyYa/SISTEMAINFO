const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, param, validationResult } = require('express-validator'); // Importar express-validator
const ApiError = require('./ApiError'); // 1. Importar nuestra clase de error
const { getSupabase } = require('../services/supabase');

const STORAGE_PROVIDER = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();

// Configurar multer para subida de imágenes
const storage = STORAGE_PROVIDER === 'supabase'
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/modal');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'modal-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/; // Solo JPG/PNG
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG o PNG'));
    }
  }
});

async function uploadFileToSupabase(file) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
  const unique = `modal-${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
  const { error } = await supabase.storage.from('modal').upload(unique, file.buffer, {
    contentType: file.mimetype || 'image/jpeg',
    upsert: false
  });
  if (error) {
    console.error('Error uploading to Supabase:', error.message || error);
    return null;
  }
  const { data } = supabase.storage.from('modal').getPublicUrl(unique);
  return data?.publicUrl || null;
}

// Middleware de validación genérico
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rutas de administración (requieren autenticación)
// ... (otras rutas)

module.exports = (pool, { authenticateToken }) => {
  const router = express.Router();

  // Helper para convertir valores enviados desde el frontend a booleanos
  const toBoolean = (val, defaultValue = false) => {
    if (val === true || val === 'true' || val === 1 || val === '1') return true;
    if (val === false || val === 'false' || val === 0 || val === '0') return false;
    return defaultValue;
  };
  // Helper para fechas: aceptar solo 'YYYY-MM-DD'; cualquier otro valor se convierte a null
  const toDateOrNull = (val) => {
    const s = String(val || '');
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };
  // Helper para Fecha Inicio: si no viene válida, usar el día actual (YYYY-MM-DD)
  const defaultFechaInicio = (val) => {
    return toDateOrNull(val) || new Date().toISOString().slice(0, 10);
  };

// Rutas públicas
// Obtener modales activos para mostrar en el frontend
router.get('/', async (req, res, next) => {
  try {
    // Intentar con prioridad por mostrar_en_primer_modal si la columna existe
    const queryPrimary = `
      SELECT * FROM modal_promocional 
      WHERE activo = true 
      ORDER BY mostrar_en_primer_modal DESC, orden ASC, created_at DESC
    `;
    try {
      const [modales] = await pool.execute(queryPrimary);
      return res.json(modales);
    } catch (primaryErr) {
      console.error('Fallo consulta con prioridad, usando orden de respaldo:', primaryErr?.message || primaryErr);
      // Consulta de respaldo sin la columna, para compatibilidad con BD antiguas
      const queryFallback = `
        SELECT * FROM modal_promocional 
        WHERE activo = true 
        ORDER BY orden ASC, created_at DESC
      `;
      const [modales] = await pool.execute(queryFallback);
      return res.json(modales);
    }
  } catch (error) {
    next(error);
  }
});

// Obtener cronograma de un modal específico
router.get('/:id/cronograma', async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM cronograma_matriculas 
      WHERE modal_id = ? AND activo = true
      ORDER BY orden ASC, fecha_inicio ASC
    `;
    
    const [cronograma] = await pool.execute(query, [id]);
    res.json(cronograma);
  } catch (error) {
    next(error);
  }
});

// Rutas de administración (requieren autenticación)
// Obtener todos los modales para administración
router.get('/admin/all', authenticateToken, async (req, res, next) => {
  try {
    const query = `
      SELECT m.*, 
             COUNT(c.id) as total_cronograma
      FROM modal_promocional m
      LEFT JOIN cronograma_matriculas c ON m.id = c.modal_id AND c.activo = true
      GROUP BY m.id
      ORDER BY m.orden ASC, m.created_at DESC
    `;
    
    const [modales] = await pool.execute(query);
    res.json(modales);
  } catch (error) {
    next(error);
  }
});

// Crear nuevo modal
// Crear nuevo modal (imagen principal + múltiples imágenes opcionales)
router.post('/admin', authenticateToken, upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'imagenes', maxCount: 5 }
]), async (req, res, next) => {
  try {
    // Detectar columnas disponibles en la tabla para soportar BD antiguas
    const [cols] = await pool.execute("SHOW COLUMNS FROM modal_promocional");
    const colSet = new Set(cols.map(c => c.Field));

    const {
      titulo, subtitulo, descripcion, tipo, codigo_promocional,
      fecha_inicio, fecha_fin, valido_hasta, gradiente,
      activo, orden, url_accion, texto_boton_primario, texto_boton_secundario,
      video_tiktok_url, facebook_url, mostrar_en_primer_modal
    } = req.body;

    let imagen = null;
    let imagenesExtra = [];
    if (STORAGE_PROVIDER === 'supabase') {
      try {
        if (req.files && req.files.imagen && req.files.imagen[0]) {
          imagen = await uploadFileToSupabase(req.files.imagen[0]);
        }
        if (req.files && req.files.imagenes && req.files.imagenes.length) {
          const urls = [];
          for (const f of req.files.imagenes) {
            const u = await uploadFileToSupabase(f);
            if (u) urls.push(u);
          }
          imagenesExtra = urls;
        }
      } catch (upErr) {
        console.error('Supabase upload error (modal):', upErr);
      }
    } else {
      imagen = (req.files && req.files.imagen && req.files.imagen[0])
        ? `/uploads/modal/${req.files.imagen[0].filename}`
        : null;
      imagenesExtra = (req.files && req.files.imagenes)
        ? req.files.imagenes.map(f => `/uploads/modal/${f.filename}`)
        : [];
    }

    // Construir columnas y valores dinámicamente según existan en la BD
    const insertFields = [];
    const insertValues = [];

    const pushField = (name, value) => {
      if (colSet.has(name)) {
        insertFields.push(name);
        insertValues.push(value);
      }
    };

    // Helper: elegir un tipo soportado por la BD, con preferencia por el solicitado y los actuales
    const tipoColInfo = cols.find(c => c.Field === 'tipo');
    const parseEnumValues = (typeStr) => {
      if (!typeStr || typeof typeStr !== 'string') return [];
      const m = [...typeStr.matchAll(/'([^']+)'/g)].map(x => x[1]);
      return Array.isArray(m) ? m : [];
    };
    const enumVals = parseEnumValues(tipoColInfo?.Type);
    const preferOrder = [tipo, 'avisos', 'noticias', 'cronograma', 'flyer', 'facebook', 'video'];
    const tipoElegido = preferOrder.find(t => enumVals.includes(t)) || enumVals[0] || (tipo || 'cronograma');

    pushField('titulo', titulo);
    pushField('subtitulo', subtitulo || null);
    pushField('descripcion', descripcion || null);
    pushField('imagen', imagen);
    if (imagenesExtra.length > 0) {
      pushField('imagenes_extra', JSON.stringify(imagenesExtra));
    }
    pushField('video_tiktok_url', video_tiktok_url || null);
    pushField('facebook_url', facebook_url || null);
    pushField('tipo', tipoElegido);
    pushField('codigo_promocional', (codigo_promocional || null));
    pushField('fecha_inicio', defaultFechaInicio(fecha_inicio));
    pushField('fecha_fin', toDateOrNull(fecha_fin));
    pushField('valido_hasta', toDateOrNull(valido_hasta));
    pushField('gradiente', (gradiente || null));
    pushField('activo', toBoolean(activo));
    pushField('orden', (orden || 0));
    pushField('mostrar_en_primer_modal', toBoolean(mostrar_en_primer_modal));
    pushField('url_accion', (url_accion || null));
    pushField('texto_boton_primario', (texto_boton_primario || null));
    pushField('texto_boton_secundario', (texto_boton_secundario || null));

    const placeholders = insertFields.map(() => '?').join(', ');
    const query = `INSERT INTO modal_promocional (${insertFields.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.execute(query, insertValues);

    res.status(201).json({
      message: 'Modal creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar modal
// Actualizar modal (puede reemplazar imagen principal y agregar imágenes adicionales)
router.put('/admin/:id', authenticateToken, upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'imagenes', maxCount: 5 }
]), async (req, res, next) => {
  try {
    const { id } = req.params;
    // Detectar columnas disponibles en la tabla para soportar BD antiguas
    const [cols] = await pool.execute("SHOW COLUMNS FROM modal_promocional");
    const colSet = new Set(cols.map(c => c.Field));
    const {
      titulo, subtitulo, descripcion, tipo, codigo_promocional,
      fecha_inicio, fecha_fin, valido_hasta, gradiente,
      activo, orden, url_accion, texto_boton_primario, texto_boton_secundario,
      video_tiktok_url, facebook_url, mostrar_en_primer_modal
    } = req.body;

    let oldImagePath = null;
    let previousExtraImages = [];

    // Obtener registro actual para conocer imagen previa y extras (solo seleccionar columnas existentes)
    const selectFields = colSet.has('imagenes_extra') ? 'imagen, imagenes_extra' : 'imagen';
    const [currentModal] = await pool.execute(`SELECT ${selectFields} FROM modal_promocional WHERE id = ?`, [id]);
    if (currentModal.length > 0 && currentModal[0].imagen) {
      if (req.files && req.files.imagen && req.files.imagen[0]) {
        const relativeImgPath = String(currentModal[0].imagen).replace(/^[\\\/]/, '');
        oldImagePath = path.join(__dirname, '..', relativeImgPath);
      }
    }
    // Parsear imágenes extra previas si existe la columna
    if (colSet.has('imagenes_extra')) {
      try {
        previousExtraImages = currentModal.length > 0 && currentModal[0].imagenes_extra
          ? JSON.parse(currentModal[0].imagenes_extra || '[]')
          : [];
      } catch (e) {
        previousExtraImages = [];
      }
    } else {
      previousExtraImages = [];
    }

    // Construir SET dinámico solo con columnas existentes
    const setClauses = [];
    const queryParams = [];
    const pushSet = (name, value) => {
      if (colSet.has(name)) {
        setClauses.push(`${name} = ?`);
        queryParams.push(value);
      }
    };

    pushSet('titulo', titulo);
    pushSet('subtitulo', (subtitulo || null));
    pushSet('descripcion', (descripcion || null));
    // Elegir tipo soportado dinámicamente según ENUM actual
    const tipoColInfo = cols.find(c => c.Field === 'tipo');
    const parseEnumValues = (typeStr) => {
      if (!typeStr || typeof typeStr !== 'string') return [];
      const m = [...typeStr.matchAll(/'([^']+)'/g)].map(x => x[1]);
      return Array.isArray(m) ? m : [];
    };
    const enumVals = parseEnumValues(tipoColInfo?.Type);
    const preferOrder = [tipo, 'avisos', 'noticias', 'cronograma', 'flyer', 'facebook', 'video'];
    const tipoElegido = preferOrder.find(t => enumVals.includes(t)) || enumVals[0] || (tipo || 'cronograma');
    pushSet('tipo', tipoElegido);
    pushSet('codigo_promocional', (codigo_promocional || null));
    pushSet('fecha_inicio', defaultFechaInicio(fecha_inicio));
    pushSet('fecha_fin', toDateOrNull(fecha_fin));
    pushSet('valido_hasta', toDateOrNull(valido_hasta));
    pushSet('gradiente', (gradiente || null));
    pushSet('activo', toBoolean(activo));
    pushSet('orden', (orden || 0));
    pushSet('mostrar_en_primer_modal', toBoolean(mostrar_en_primer_modal));
    pushSet('url_accion', (url_accion || null));
    pushSet('texto_boton_primario', (texto_boton_primario || null));
    pushSet('texto_boton_secundario', (texto_boton_secundario || null));
    pushSet('video_tiktok_url', (video_tiktok_url || null));
    pushSet('facebook_url', (facebook_url || null));

    if (req.files && req.files.imagen && req.files.imagen[0] && colSet.has('imagen')) {
      if (STORAGE_PROVIDER === 'supabase') {
        const url = await uploadFileToSupabase(req.files.imagen[0]);
        setClauses.push('imagen = ?');
        queryParams.push(url || null);
      } else {
        setClauses.push('imagen = ?');
        queryParams.push(`/uploads/modal/${req.files.imagen[0].filename}`);
      }
    }
    // Agregar imágenes extra si se subieron nuevas
    if (colSet.has('imagenes_extra')) {
      let nuevasExtras = [];
      if (req.files && req.files.imagenes && req.files.imagenes.length) {
        if (STORAGE_PROVIDER === 'supabase') {
          const urls = [];
          for (const f of req.files.imagenes) {
            const u = await uploadFileToSupabase(f);
            if (u) urls.push(u);
          }
          nuevasExtras = urls;
        } else {
          nuevasExtras = req.files.imagenes.map(f => `/uploads/modal/${f.filename}`);
        }
      }
      if (nuevasExtras.length > 0) {
        const merged = Array.isArray(previousExtraImages) ? [...previousExtraImages, ...nuevasExtras] : nuevasExtras;
        setClauses.push('imagenes_extra = ?');
        queryParams.push(JSON.stringify(merged));
      }
    }

    const updateQuery = `UPDATE modal_promocional SET ${setClauses.join(', ')} WHERE id = ?`;
    queryParams.push(id);
    await pool.execute(updateQuery, queryParams);

    // Si la actualización fue exitosa y se subió una nueva imagen, borramos la antigua.
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      try {
        fs.unlinkSync(oldImagePath);
        console.log(`Imagen antigua eliminada: ${oldImagePath}`);
      } catch (unlinkError) {
        // Si falla la eliminación, solo lo registramos, no hacemos que la petición falle.
        console.error('Error al eliminar la imagen antigua:', unlinkError);
      }
    }

    res.json({ message: 'Modal actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
});

// Eliminar modal
router.delete('/admin/:id', authenticateToken, async (req, res, next) => { // Añadimos 'next'
  try {
    const { id } = req.params;
    
    // Primero, verificar si el modal existe para poder borrar su imagen si la tiene.
    const [modalResult] = await pool.execute('SELECT imagen FROM modal_promocional WHERE id = ?', [id]);
    if (modalResult.length === 0) {
      throw new ApiError(404, 'Modal no encontrado.'); // 2. Lanzar un error 404 si no existe
    }
    const oldImagePath = modalResult[0].imagen 
      ? path.join(__dirname, '..', String(modalResult[0].imagen).replace(/^[\\\/]/, '')) 
      : null;

    // Eliminar cronograma asociado primero
    await pool.execute('DELETE FROM cronograma_matriculas WHERE modal_id = ?', [id]);

    // Eliminar modal
    const [deleteResult] = await pool.execute('DELETE FROM modal_promocional WHERE id = ?', [id]);

    // 3. Borrar la imagen del disco si existía
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
      console.log(`Imagen asociada al modal eliminado fue borrada: ${oldImagePath}`);
    }

    res.status(200).json({ message: 'Modal y su cronograma asociado han sido eliminados exitosamente' });
  } catch (error) {
    next(error); // Pasamos el error a nuestro manejador global
  }
});

// Gestión de cronograma
// Obtener cronograma de un modal para administración
router.get('/admin/:id/cronograma', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM cronograma_matriculas 
      WHERE modal_id = ?
      ORDER BY orden ASC, fecha_inicio ASC
    `;
    
    const [cronograma] = await pool.execute(query, [id]);
    res.json(cronograma);
  } catch (error) {
    next(error);
  }
});

// Crear elemento de cronograma
router.post('/admin/:id/cronograma', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fase, descripcion, fecha_inicio, fecha_fin, estado, color, icono, orden } = req.body;

    const query = `
      INSERT INTO cronograma_matriculas 
      (modal_id, fase, descripcion, fecha_inicio, fecha_fin, estado, color, icono, orden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      id, fase, descripcion, fecha_inicio, fecha_fin, estado || 'pendiente',
      color || 'blue', icono || 'calendar', orden || 0
    ]);

    res.status(201).json({
      message: 'Elemento de cronograma creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar elemento de cronograma
router.put('/admin/cronograma/:cronogramaId', authenticateToken, async (req, res, next) => {
  try {
    const { cronogramaId } = req.params;
    const { fase, descripcion, fecha_inicio, fecha_fin, estado, color, icono, orden, activo } = req.body;

    const query = `
      UPDATE cronograma_matriculas SET
      fase = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, 
      estado = ?, color = ?, icono = ?, orden = ?, activo = ?
      WHERE id = ?
    `;

    await pool.execute(query, [
      fase, descripcion, fecha_inicio, fecha_fin, estado,
      color, icono, orden, activo === 'true' || activo === true, cronogramaId
    ]);

    res.json({ message: 'Elemento de cronograma actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
});

// Eliminar elemento de cronograma
router.delete('/admin/cronograma/:cronogramaId', authenticateToken, async (req, res, next) => {
  try {
    const { cronogramaId } = req.params;
    
    await pool.execute('DELETE FROM cronograma_matriculas WHERE id = ?', [cronogramaId]);

    res.json({ message: 'Elemento de cronograma eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

// Estadísticas para el dashboard
router.get('/admin/stats', authenticateToken, async (req, res, next) => {
  try {
    const [totalModales] = await pool.execute('SELECT COUNT(*) as total FROM modal_promocional');
    const [modalActivos] = await pool.execute('SELECT COUNT(*) as total FROM modal_promocional WHERE activo = true');
    const [modalVigentes] = await pool.execute(`
      SELECT COUNT(*) as total FROM modal_promocional 
      WHERE activo = true 
      AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
      AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
    `);
    const [totalCronograma] = await pool.execute('SELECT COUNT(*) as total FROM cronograma_matriculas WHERE activo = true');

    res.json({
      total_modales: totalModales[0].total,
      modales_activos: modalActivos[0].total,
      modales_vigentes: modalVigentes[0].total,
      elementos_cronograma: totalCronograma[0].total
    });
  } catch (error) {
    next(error);
  }
});

  return router;
};

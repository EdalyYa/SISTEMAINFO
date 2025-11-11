const express = require('express');
const router = express.Router();
const { query, execute } = require('./config/database');

// Función para extraer ID de YouTube de una URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// GET - Obtener todos los videos activos (para el frontend público)
router.get('/videos-informativos', async (req, res) => {
  try {
    const [rows] = await query(
      'SELECT * FROM videos_informativos WHERE activo = TRUE ORDER BY orden ASC, fecha_creacion DESC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener videos informativos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener todos los videos (para el panel admin)
router.get('/admin/videos-informativos', async (req, res) => {
  try {
    const [rows] = await query(
      'SELECT * FROM videos_informativos ORDER BY orden ASC, fecha_creacion DESC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener videos informativos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST - Crear nuevo video informativo
router.post('/admin/videos-informativos', async (req, res) => {
  try {
    const { titulo, descripcion, youtube_url, categoria = 'informativo', nombre_testimonio, activo = true, orden = 0 } = req.body;
    
    if (!titulo || !youtube_url) {
      return res.status(400).json({
        success: false,
        message: 'Título y URL de YouTube son requeridos'
      });
    }
    
    const youtube_id = extractYouTubeId(youtube_url);
    if (!youtube_id) {
      return res.status(400).json({
        success: false,
        message: 'URL de YouTube no válida'
      });
    }
    
    const [result] = await execute(
      'INSERT INTO videos_informativos (titulo, descripcion, youtube_url, youtube_id, categoria, nombre_testimonio, activo, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, youtube_url, youtube_id, categoria, nombre_testimonio, activo, orden]
    );
    
    res.json({
      success: true,
      message: 'Video informativo creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear video informativo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT - Actualizar video informativo
router.put('/admin/videos-informativos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, youtube_url, categoria, nombre_testimonio, activo, orden } = req.body;
    
    if (!titulo || !youtube_url) {
      return res.status(400).json({
        success: false,
        message: 'Título y URL de YouTube son requeridos'
      });
    }
    
    const youtube_id = extractYouTubeId(youtube_url);
    if (!youtube_id) {
      return res.status(400).json({
        success: false,
        message: 'URL de YouTube no válida'
      });
    }
    
    const [result] = await execute(
      'UPDATE videos_informativos SET titulo = ?, descripcion = ?, youtube_url = ?, youtube_id = ?, categoria = ?, nombre_testimonio = ?, activo = ?, orden = ? WHERE id = ?',
      [titulo, descripcion, youtube_url, youtube_id, categoria, nombre_testimonio, activo, orden, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video informativo no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Video informativo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar video informativo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar video informativo
router.delete('/admin/videos-informativos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await execute(
      'DELETE FROM videos_informativos WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video informativo no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Video informativo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar video informativo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;

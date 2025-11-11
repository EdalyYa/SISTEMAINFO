const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Ruta pública para obtener todas las cifras de logros activas
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, label, valor, orden 
      FROM cifras_logros 
      WHERE activo = true 
      ORDER BY orden ASC
    `;
    
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener cifras de logros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas administrativas (requieren autenticación)

// Obtener todas las cifras de logros (incluyendo inactivas)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const query = `
      SELECT * FROM cifras_logros 
      ORDER BY orden ASC
    `;
    
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener cifras de logros (admin):', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva cifra de logro
router.post('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { label, valor, orden, activo } = req.body;
    
    if (!label || !valor) {
      return res.status(400).json({ error: 'Label y valor son requeridos' });
    }
    
    const query = `
      INSERT INTO cifras_logros (label, valor, orden, activo) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      label, 
      valor, 
      orden || 0, 
      activo !== undefined ? activo : true
    ]);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Cifra de logro creada exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear cifra de logro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cifra de logro
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, valor, orden, activo } = req.body;
    
    if (!label || !valor) {
      return res.status(400).json({ error: 'Label y valor son requeridos' });
    }
    
    const query = `
      UPDATE cifras_logros 
      SET label = ?, valor = ?, orden = ?, activo = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [
      label, 
      valor, 
      orden || 0, 
      activo !== undefined ? activo : true,
      id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cifra de logro no encontrada' });
    }
    
    res.json({ message: 'Cifra de logro actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cifra de logro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar cifra de logro
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM cifras_logros WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cifra de logro no encontrada' });
    }
    
    res.json({ message: 'Cifra de logro eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cifra de logro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar estado activo/inactivo
router.patch('/admin/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE cifras_logros 
      SET activo = NOT activo 
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cifra de logro no encontrada' });
    }
    
    res.json({ message: 'Estado de cifra de logro actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar estado de cifra de logro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
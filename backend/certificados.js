const express = require('express');
const router = express.Router();

module.exports = (pool, { authenticateToken, authorizeRoles }) => {
  // GET /api/admin/certificados - list all certificados
  router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM certificados');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching certificados:', error);
      res.status(500).json({ error: 'Error fetching certificados' });
    }
  });

  // GET /api/admin/certificados/:id - get certificado by id
  router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const id = req.params.id;
    try {
      const [rows] = await pool.query('SELECT * FROM certificados WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Certificado no encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching certificado:', error);
      res.status(500).json({ error: 'Error fetching certificado' });
    }
  });

  // POST /api/admin/certificados - create new certificado
  router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { codigo, nombre, dni, curso, estado, fecha_emision } = req.body;
    if (!codigo || !nombre || !dni || !curso || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
      const [result] = await pool.query(
        'INSERT INTO certificados (codigo, nombre, dni, curso, estado, fecha_emision) VALUES (?, ?, ?, ?, ?, ?)',
        [codigo, nombre, dni, curso, estado, fecha_emision || null]
      );
      res.status(201).json({ message: 'Certificado creado', id: result.insertId });
    } catch (error) {
      console.error('Error creando certificado:', error);
      res.status(500).json({ error: 'Error creando certificado' });
    }
  });

  // PUT /api/admin/certificados/:id - update certificado
  router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const id = req.params.id;
    const { codigo, nombre, dni, curso, estado, fecha_emision } = req.body;
    try {
      const [result] = await pool.query(
        'UPDATE certificados SET codigo = ?, nombre = ?, dni = ?, curso = ?, estado = ?, fecha_emision = ? WHERE id = ?',
        [codigo, nombre, dni, curso, estado, fecha_emision || null, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Certificado no encontrado' });
      }
      res.json({ message: 'Certificado actualizado' });
    } catch (error) {
      console.error('Error actualizando certificado:', error);
      res.status(500).json({ error: 'Error actualizando certificado' });
    }
  });

  // DELETE /api/admin/certificados/:id - delete certificado
  router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const id = req.params.id;
    try {
      const [result] = await pool.query('DELETE FROM certificados WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Certificado no encontrado' });
      }
      res.json({ message: 'Certificado eliminado' });
    } catch (error) {
      console.error('Error eliminando certificado:', error);
      res.status(500).json({ error: 'Error eliminando certificado' });
    }
  });

  return router;
};

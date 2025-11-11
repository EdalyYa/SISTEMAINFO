const express = require('express');

module.exports = (pool, auth) => {
  const router = express.Router();

  // Middleware para proteger rutas
  router.use(auth.authenticateToken);

  // Obtener todos los usuarios
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  });

  return router;
};

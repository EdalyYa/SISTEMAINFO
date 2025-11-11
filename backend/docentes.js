const express = require('express');

module.exports = (pool, auth) => {
  const router = express.Router();

  // Middleware para proteger rutas
  router.use(auth.authenticateToken);

  // Obtener todos los docentes
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM docentes');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      res.status(500).json({ error: 'Error fetching docentes' });
    }
  });

  return router;
};

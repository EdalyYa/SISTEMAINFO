const express = require('express');

module.exports = (pool, auth) => {
  const router = express.Router();

  // Middleware para proteger rutas
  router.use(auth.authenticateToken);

  // Obtener todas las reclamaciones
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM reclamaciones');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching reclamaciones:', error);
      res.status(500).json({ error: 'Error fetching reclamaciones' });
    }
  });

  return router;
};

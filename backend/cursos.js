const express = require('express');

module.exports = (pool, auth) => {
  const router = express.Router();

  // Middleware para proteger rutas
  router.use(auth.authenticateToken);

  // Obtener todos los cursos
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM cursos');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      res.status(500).json({ error: 'Error fetching cursos' });
    }
  });

  return router;
};

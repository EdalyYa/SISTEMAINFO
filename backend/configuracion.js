const express = require('express');

module.exports = (pool, auth) => {
  const router = express.Router();

  // Middleware para proteger rutas
  router.use(auth.authenticateToken);

  // Asegurar tabla de configuración (id único=1, data JSON)
  async function ensureTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INT PRIMARY KEY,
        data JSON NULL,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  // Obtener configuración general (retorna objeto { id, data })
  router.get('/', async (req, res) => {
    try {
      await ensureTable();
      const [rows] = await pool.query('SELECT id, data FROM configuracion WHERE id = 1');
      if (rows.length === 0) {
        return res.json({ id: 1, data: {} });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching configuracion:', error);
      res.status(500).json({ error: 'Error fetching configuracion' });
    }
  });

  // Guardar/actualizar configuración general (upsert id=1)
  router.put('/', async (req, res) => {
    try {
      await ensureTable();
      const configData = req.body?.data ?? req.body;
      const jsonString = typeof configData === 'string' ? configData : JSON.stringify(configData);
      await pool.query(
        'INSERT INTO configuracion (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
        [jsonString]
      );
      const [rows] = await pool.query('SELECT id, data FROM configuracion WHERE id = 1');
      res.json(rows[0]);
    } catch (error) {
      console.error('Error updating configuracion:', error);
      res.status(500).json({ error: 'Error updating configuracion' });
    }
  });

  return router;
};

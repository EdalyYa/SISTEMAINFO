const mysql = require('mysql2/promise');

// Crear pool de conexiones MySQL
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'infouna',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para ejecutar consultas
const execute = async (query, params = []) => {
  try {
    const [rows, fields] = await pool.execute(query, params);
    return [rows, fields];
  } catch (error) {
    console.error('Error en consulta de base de datos:', error);
    throw error;
  }
};

// Función para obtener una conexión del pool
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error al obtener conexión:', error);
    throw error;
  }
};

// Función para cerrar el pool de conexiones
const closePool = async () => {
  try {
    await pool.end();
    console.log('Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error al cerrar pool:', error);
    throw error;
  }
};

// Exportar funciones
module.exports = {
  pool,
  execute,
  getConnection,
  closePool
};

// Manejar cierre graceful de la aplicación
process.on('SIGINT', async () => {
  console.log('Cerrando conexiones de base de datos...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando conexiones de base de datos...');
  await closePool();
  process.exit(0);
});
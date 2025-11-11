const mysql = require('mysql2/promise');

const {
  DB_HOST = '127.0.0.1',
  DB_PORT,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'infouna',
  DB_CONN_LIMIT
} = process.env;

const port = DB_PORT ? Number(DB_PORT) : undefined;
const connectionLimit = DB_CONN_LIMIT ? Number(DB_CONN_LIMIT) : 10;

const pool = mysql.createPool({
  host: DB_HOST,
  ...(port ? { port } : {}),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit,
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

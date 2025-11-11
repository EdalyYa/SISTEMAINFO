const mysql = require('mysql2/promise');

// Permitir modo sin base de datos para despliegues rápidos (Render sin proveedor de DB)
const DB_DISABLED = process.env.DB_DISABLE === 'true';

// Pool no-op: devuelve resultados vacíos y evita conexiones reales
const noopPool = {
  getConnection: async () => ({ release() {} }),
  execute: async () => [ [] ],
  query: async () => [ [] ],
  end: async () => {}
};

// Crear pool de conexiones leyendo variables de entorno (compatibles con Render)
const pool = DB_DISABLED
  ? noopPool
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'infouna',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
      queueLimit: 0,
      // Soporte opcional para SSL (si el proveedor lo requiere)
      ssl: process.env.DB_SSL === 'true'
        ? {
            // Permite configurar rechazo de certificados si el proveedor no firma CA pública
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
          }
        : undefined
    });

// Función para probar la conexión
async function testConnection() {
  try {
    if (DB_DISABLED) {
      console.log('ℹ️ Modo sin DB activo (DB_DISABLE=true). Se devolverán resultados vacíos.');
      return true;
    }
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
}

// Función para ejecutar queries con manejo de errores
async function execute(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return [results];
  } catch (error) {
    console.error('Error ejecutando query:', error.message);
    throw error;
  }
}

// Función para ejecutar queries simples
async function query(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params);
    return [results];
  } catch (error) {
    console.error('Error ejecutando query:', error.message);
    throw error;
  }
}

// Función para cerrar el pool de conexiones
async function closePool() {
  try {
    await pool.end();
    console.log('Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('Error cerrando pool de conexiones:', error.message);
  }
}

// Exportar el pool y las funciones
module.exports = {
  pool,
  execute,
  query,
  testConnection,
  closePool
};

// Probar conexión al inicializar
testConnection();

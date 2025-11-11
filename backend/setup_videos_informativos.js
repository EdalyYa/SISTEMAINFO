const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupVideoTestimonios() {
  try {
    // Configuración de la base de datos
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'infouna'
    });

    console.log('Conectado a la base de datos MySQL');

    // Leer y ejecutar el script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'videos_informativos_schema.sql'), 'utf8');
    
    // Dividir el script en declaraciones individuales
    const statements = sqlScript.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('Ejecutado:', statement.substring(0, 50) + '...');
      }
    }

    console.log('✅ Tabla videos_informativos creada exitosamente');
    console.log('✅ Datos de ejemplo insertados');

    await connection.end();
  } catch (error) {
    console.error('❌ Error al configurar videos_informativos:', error);
  }
}

setupVideoTestimonios();
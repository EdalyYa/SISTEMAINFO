// Script para crear o actualizar el usuario admin
// Ejecutar con: node backend/crear-usuario-admin.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function crearUsuarioAdmin() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'infouna',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const username = 'infoadmin';
    const password = 'infouna2025';
    const email = 'admin@infouna.edu.pe';
    const full_name = 'Administrador INFOUNA';
    const role = 'admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar estructura de la tabla
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);
    
    console.log('Columnas encontradas en la tabla users:', columnNames);

    // Determinar qué columnas usar
    const hasPasswordHash = columnNames.includes('password_hash');
    const hasPassword = columnNames.includes('password');
    const hasName = columnNames.includes('name');
    const hasFullName = columnNames.includes('full_name');

    // Preparar query de inserción/actualización
    if (!hasPasswordHash && hasPassword) {
      console.log('⚠️  La tabla usa "password" en lugar de "password_hash". Se recomienda ejecutar fix_users_table.sql');
    }

    const passwordColumn = hasPasswordHash ? 'password_hash' : 'password';
    const nameColumn = hasName ? 'name' : (hasFullName ? 'full_name' : 'username');

    // Buscar usuario existente
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      // Actualizar usuario existente
      const updateFields = [
        `${passwordColumn} = ?`,
        `email = ?`,
        `role = ?`,
        `${nameColumn} = ?`
      ].join(', ');

      const updateValues = [hashedPassword, email, role, full_name, username];
      
      await pool.query(
        `UPDATE users SET ${updateFields} WHERE username = ?`,
        updateValues
      );
      
      console.log('✅ Usuario admin actualizado exitosamente');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Contraseña: ${password}`);
    } else {
      // Crear nuevo usuario
      await pool.query(
        `INSERT INTO users (username, ${passwordColumn}, email, role, ${nameColumn}) VALUES (?, ?, ?, ?, ?)`,
        [username, hashedPassword, email, role, full_name]
      );
      
      console.log('✅ Usuario admin creado exitosamente');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Contraseña: ${password}`);
    }

    // Verificar login
    const [testUser] = await pool.query(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );
    
    if (testUser.length > 0) {
      const testPassword = testUser[0][passwordColumn];
      const isValid = await bcrypt.compare(password, testPassword);
      
      if (isValid) {
        console.log('✅ Verificación: La contraseña es válida');
      } else {
        console.log('❌ Error: La contraseña no coincide');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('   La tabla "users" no existe. Ejecuta primero schema_complete.sql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   La base de datos "infouna" no existe. Créala primero.');
    }
  } finally {
    await pool.end();
  }
}

crearUsuarioAdmin();


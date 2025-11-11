const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'infouna'
});

async function testLogin() {
  try {
    const [rows] = await pool.execute('SELECT username, password FROM users WHERE username = ?', ['infoadmin']);

    if (rows.length > 0) {
      console.log('User found:', rows[0].username);
      console.log('Password hash:', rows[0].password);

      const testPasswords = ['infouna2025', 'admin', 'password', '123456'];

      for (let pwd of testPasswords) {
        const isValid = await bcrypt.compare(pwd, rows[0].password);
        console.log(`Password '${pwd}' valid:`, isValid);
      }
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testLogin();
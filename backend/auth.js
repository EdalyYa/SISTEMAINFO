
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_here'; // Change to env variable in production

// Function to create or update admin user with given credentials
async function createOrUpdateAdminUser(pool) {
  const username = 'infoadmin';
  const password = 'infouna2025';
  const full_name = 'Administrador';
  const email = 'admin@infouna.edu.pe';
  const role = 'admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Buscar por username o email
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (rows.length === 0) {
      // Insertar si no existe
      try {
        await pool.query(
          'INSERT INTO users (username, password_hash, name, email, role) VALUES (?, ?, ?, ?, ?)',
          [username, hashedPassword, full_name, email, role]
        );
      } catch (err) {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          await pool.query(
            'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, full_name, email, role]
          );
        } else {
          throw err;
        }
      }
      console.log('Admin user created');
    } else {
      // Actualizar si ya existe por username o email
      try {
        await pool.query(
          'UPDATE users SET username = ?, password_hash = ?, name = ?, role = ? WHERE email = ?',
          [username, hashedPassword, full_name, role, email]
        );
      } catch (err) {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          await pool.query(
            'UPDATE users SET username = ?, password_hash = ?, full_name = ?, role = ? WHERE email = ?',
            [username, hashedPassword, full_name, role, email]
          );
        } else {
          throw err;
        }
      }
      console.log('Admin user updated');
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  }
}

module.exports = (pool) => {
  // Call the function immediately to ensure admin user exists
  createOrUpdateAdminUser(pool);

// Register new user (admin or user)
router.post('/register', async (req, res) => {
  const { username, password, full_name, email, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let result;
    try {
      [result] = await pool.query(
        'INSERT INTO users (username, password_hash, name, email, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, full_name, email, role]
      );
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        [result] = await pool.query(
          'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
          [username, hashedPassword, full_name, email, role]
        );
      } else {
        throw err;
      }
    }
    res.status(201).json({ message: 'User registered', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  const loginField = username || email;
  console.log('Login attempt for:', loginField);
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [loginField, loginField]);
    console.log('User rows found:', rows.length);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', match);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to verify token and role
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}

  // Debug endpoint to list all users (remove in production)
  router.get('/debug-users', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, username, email, COALESCE(name, full_name) AS full_name, role, password_hash FROM users');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  });

  // Debug endpoint to reset admin password (remove in production)
  router.post('/reset-admin-password', async (req, res) => {
    const newPassword = 'infouna2025';
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, 'infoadmin']);
      res.json({ message: 'Admin password reset to default.' });
    } catch (error) {
      console.error('Error resetting admin password:', error);
      res.status(500).json({ error: 'Error resetting password' });
    }
  });

  return { router, authenticateToken, authorizeRoles };
};

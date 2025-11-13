const crypto = require('crypto');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[security] JWT_SECRET no definido. Se generó uno temporal para este proceso. Define JWT_SECRET en el entorno.');
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
};


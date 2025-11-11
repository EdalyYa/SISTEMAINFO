const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_here';

// Simular un token que podría estar en localStorage
// En una situación real, obtendrías esto del navegador
console.log('=== Verificador de Token JWT ===');
console.log('JWT_SECRET usado:', JWT_SECRET);

// Crear un token de prueba
const testPayload = { id: 1, username: 'test', role: 'admin' };
const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });

console.log('\nToken de prueba generado:', testToken);

// Verificar el token de prueba
try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('\n✅ Token de prueba válido:', JSON.stringify(decoded, null, 2));
} catch (err) {
  console.log('\n❌ Token de prueba inválido:', err.message);
}

// Si tienes un token específico para verificar, puedes agregarlo aquí
const tokenToVerify = process.argv[2];
if (tokenToVerify) {
  console.log('\n=== Verificando token proporcionado ===');
  try {
    const decoded = jwt.verify(tokenToVerify, JWT_SECRET);
    console.log('✅ Token válido:', JSON.stringify(decoded, null, 2));
  } catch (err) {
    console.log('❌ Token inválido:', err.message);
    if (err.name === 'TokenExpiredError') {
      console.log('🕐 El token ha expirado');
    } else if (err.name === 'JsonWebTokenError') {
      console.log('🔑 Error en la firma del token o formato inválido');
    }
  }
} else {
  console.log('\n💡 Para verificar un token específico, ejecuta:');
  console.log('node verify-token.js "tu_token_aqui"');
}
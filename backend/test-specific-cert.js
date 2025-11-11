const mysql = require('mysql2/promise');
const PDFGeneratorService = require('./services/PDFGeneratorService');
const fs = require('fs');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'infouna'
});

async function testSpecificCertificate() {
  try {
    // Usar el código que aparece en tu imagen
    const codigo = 'CERT-1757808609317-I2ENOUYFU';
    
    console.log('=== PROBANDO CERTIFICADO ESPECÍFICO ===');
    console.log('Código:', codigo);
    
    // 1. Verificar que existe en la base de datos
    const [rows] = await pool.execute(
      'SELECT codigo_verificacion, nombre_completo, activo FROM certificados WHERE codigo_verificacion = ?',
      [codigo]
    );
    
    if (rows.length === 0) {
      console.log('❌ Certificado no encontrado en la base de datos');
      return;
    }
    
    console.log('✅ Certificado encontrado:', rows[0].nombre_completo);
    console.log('✅ Estado activo:', rows[0].activo);
    
    // 2. Probar la ruta pública directamente
    console.log('\n=== PROBANDO RUTA PÚBLICA ===');
    
    const response = await fetch(`http://localhost:4001/api/certificados-publicos/descargar/${codigo}`);
    console.log('Status de respuesta:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ PDF generado exitosamente');
      console.log('Tamaño del PDF:', buffer.byteLength, 'bytes');
      
      // Guardar el PDF para inspección
      fs.writeFileSync('test-public-direct.pdf', Buffer.from(buffer));
      console.log('✅ PDF guardado como test-public-direct.pdf');
      
      // Verificar si es un PDF válido
      const pdfHeader = Buffer.from(buffer).toString('ascii', 0, 4);
      console.log('Header del PDF:', pdfHeader);
      
      if (pdfHeader === '%PDF') {
        console.log('✅ Es un PDF válido');
      } else {
        console.log('❌ No es un PDF válido');
        console.log('Primeros 100 caracteres:', Buffer.from(buffer).toString('ascii', 0, 100));
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la respuesta:', errorText);
    }
    
    // 3. Probar la ruta de admin
    console.log('\n=== PROBANDO RUTA ADMIN ===');
    
    const adminResponse = await fetch(`http://localhost:4001/admin/certificados/pdf/${codigo}`);
    console.log('Status de respuesta admin:', adminResponse.status);
    
    if (adminResponse.ok) {
      const adminBuffer = await adminResponse.arrayBuffer();
      console.log('✅ PDF admin generado exitosamente');
      console.log('Tamaño del PDF admin:', adminBuffer.byteLength, 'bytes');
      
      // Guardar el PDF admin para comparación
      fs.writeFileSync('test-admin-direct.pdf', Buffer.from(adminBuffer));
      console.log('✅ PDF admin guardado como test-admin-direct.pdf');
      
      // Comparar tamaños
      if (buffer && adminBuffer.byteLength === buffer.byteLength) {
        console.log('✅ Los PDFs tienen el mismo tamaño');
      } else {
        console.log('❌ Los PDFs tienen tamaños diferentes');
        console.log('Público:', buffer ? buffer.byteLength : 'N/A', 'vs Admin:', adminBuffer.byteLength);
      }
    } else {
      const adminErrorText = await adminResponse.text();
      console.log('❌ Error en la respuesta admin:', adminErrorText);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testSpecificCertificate();
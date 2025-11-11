const mysql = require('mysql2/promise');
const PDFGeneratorService = require('./services/PDFGeneratorService');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'infouna'
});

async function testPDFGeneration() {
  try {
    console.log('=== INICIANDO PRUEBA DE GENERACIÓN PDF ===');
    
    // Buscar certificado con su diseño personalizado
    const query = `
      SELECT 
        c.dni,
        c.nombre_completo,
        c.tipo_certificado,
        c.nombre_evento,
        c.descripcion_evento,
        c.fecha_inicio,
        c.fecha_fin,
        c.horas_academicas,
        c.codigo_verificacion,
        c.plantilla_certificado,
        dc.configuracion,
        dc.logo_izquierdo,
        dc.logo_derecho,
        dc.fondo_certificado,
        CONCAT(
          'del ', DAY(c.fecha_inicio), 
          CASE 
            WHEN MONTH(c.fecha_inicio) = MONTH(c.fecha_fin) AND YEAR(c.fecha_inicio) = YEAR(c.fecha_fin)
            THEN CONCAT(' al ', DAY(c.fecha_fin), ' de ',
              CASE MONTH(c.fecha_inicio)
                WHEN 1 THEN 'enero'
                WHEN 2 THEN 'febrero'
                WHEN 3 THEN 'marzo'
                WHEN 4 THEN 'abril'
                WHEN 5 THEN 'mayo'
                WHEN 6 THEN 'junio'
                WHEN 7 THEN 'julio'
                WHEN 8 THEN 'agosto'
                WHEN 9 THEN 'septiembre'
                WHEN 10 THEN 'octubre'
                WHEN 11 THEN 'noviembre'
                WHEN 12 THEN 'diciembre'
              END, ' del año ', YEAR(c.fecha_inicio))
            ELSE CONCAT(' de ',
              CASE MONTH(c.fecha_inicio)
                WHEN 1 THEN 'enero'
                WHEN 2 THEN 'febrero'
                WHEN 3 THEN 'marzo'
                WHEN 4 THEN 'abril'
                WHEN 5 THEN 'mayo'
                WHEN 6 THEN 'junio'
                WHEN 7 THEN 'julio'
                WHEN 8 THEN 'agosto'
                WHEN 9 THEN 'septiembre'
                WHEN 10 THEN 'octubre'
                WHEN 11 THEN 'noviembre'
                WHEN 12 THEN 'diciembre'
              END, ' al ', DAY(c.fecha_fin), ' de ',
              CASE MONTH(c.fecha_fin)
                WHEN 1 THEN 'enero'
                WHEN 2 THEN 'febrero'
                WHEN 3 THEN 'marzo'
                WHEN 4 THEN 'abril'
                WHEN 5 THEN 'mayo'
                WHEN 6 THEN 'junio'
                WHEN 7 THEN 'julio'
                WHEN 8 THEN 'agosto'
                WHEN 9 THEN 'septiembre'
                WHEN 10 THEN 'octubre'
                WHEN 11 THEN 'noviembre'
                WHEN 12 THEN 'diciembre'
              END, ' del año ', YEAR(c.fecha_fin))
          END
        ) as periodo_evento
      FROM certificados c
      LEFT JOIN disenos_certificados dc ON CAST(SUBSTRING(c.plantilla_certificado, 8, LENGTH(c.plantilla_certificado) - 11) AS UNSIGNED) = dc.id
      WHERE c.codigo_verificacion = ? AND c.activo = 1
    `;
    
    const [certificados] = await pool.execute(query, ['CERT-1757738907146-SOMU06693']);
    
    if (certificados.length === 0) {
      console.log('❌ Certificado no encontrado');
      return;
    }
    
    const certificado = certificados[0];
    console.log('✅ Certificado encontrado:', certificado.nombre_completo);
    
    // Preparar configuración de plantilla
    const templateConfig = {
      configuracion: certificado.configuracion,
      logo_izquierdo: certificado.logo_izquierdo,
      logo_derecho: certificado.logo_derecho,
      fondo_certificado: certificado.fondo_certificado
    };
    
    console.log('📋 Template config preparado');
    console.log('- Fondo:', !!templateConfig.fondo_certificado);
    console.log('- Logo izq:', !!templateConfig.logo_izquierdo);
    console.log('- Logo der:', !!templateConfig.logo_derecho);
    console.log('- Configuración:', !!templateConfig.configuracion);
    
    // Usar servicio centralizado para generar PDF
    console.log('🔧 Iniciando generación con PDFGeneratorService...');
    const pdfGeneratorService = new PDFGeneratorService();
    const pdfBuffer = await pdfGeneratorService.generateCertificatePDF(certificado, templateConfig, true);
    
    console.log('✅ PDF generado exitosamente');
    console.log('📊 Tamaño del PDF:', pdfBuffer.length, 'bytes');
    
    // Guardar PDF para inspección
    const fs = require('fs');
    fs.writeFileSync('test-direct-pdf.pdf', pdfBuffer);
    console.log('💾 PDF guardado como test-direct-pdf.pdf');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testPDFGeneration();
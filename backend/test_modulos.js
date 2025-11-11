const mysql = require('mysql2/promise');

async function testModulos() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'instituto_informatica'
    });

    // Verificar programas existentes
    console.log('=== PROGRAMAS EXISTENTES ===');
    const [programas] = await pool.query('SELECT id, nombre, duracion FROM programas ORDER BY id');
    
    for (const programa of programas) {
      console.log(`Programa ID ${programa.id}: ${programa.nombre} - Duración: ${programa.duracion}`);
      
      // Verificar módulos de este programa
      const [modulos] = await pool.query('SELECT id, nombre, numero FROM modulos WHERE programa_id = ? ORDER BY id', [programa.id]);
      console.log(`  Módulos encontrados: ${modulos.length}`);
      modulos.forEach(modulo => {
        console.log(`    - ${modulo.nombre} (${modulo.numero})`);
      });
      
      if (modulos.length === 0) {
        console.log('  ⚠️  No hay módulos para este programa');
      }
      console.log('');
    }

    // Probar la lógica de extracción de duración
    console.log('=== PRUEBA DE EXTRACCIÓN DE DURACIÓN ===');
    const duracionesPrueba = [
      '12 meses', '6 meses', '18', '3 años', '24 meses', 
      'Técnico en Computación e Informática', '6 ciclos', '2 años'
    ];
    
    duracionesPrueba.forEach(duracion => {
      let duracionNumero = 0;
      
      const patrones = [
        /(\d+)\s*meses?/i,
        /(\d+)\s*ciclos?/i,
        /(\d+)\s*años?/i,
        /(\d+)\s*modulos?/i,
        /^(\d+)$/
      ];
      
      for (const patron of patrones) {
        const match = duracion.match(patron);
        if (match) {
          duracionNumero = parseInt(match[1]);
          if (patron.source.includes('años')) {
            duracionNumero = duracionNumero * 6;
          }
          break;
        }
      }
      
      console.log(`Duración: "${duracion}" → Número extraído: ${duracionNumero}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testModulos();
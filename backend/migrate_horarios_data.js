const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'infouna',
  connectionLimit: 10
};

// Datos estáticos de horarios del frontend
const horariosData = [
  {
    area: "OFIMATICA",
    cursos: [
      { id: 1, nombre: "SISTEMA OPERATIVO WINDOWS", dias: "LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]", grupo: "TC1", modalidad: "VIRTUAL" },
      { id: 2, nombre: "SISTEMA OPERATIVO WINDOWS", dias: "MAR-JUE [ 7:00 pm.-10:00 pm. ]", grupo: "TC2", modalidad: "VIRTUAL" },
      { id: 3, nombre: "SISTEMA OPERATIVO WINDOWS", dias: "SAB-DOM [ 7:00 pm.-10:00 pm. ]", grupo: "TC3", modalidad: "VIRTUAL" },
      { id: 9, nombre: "Microsoft Word", dias: "LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]", grupo: "MW1", modalidad: "VIRTUAL" },
      { id: 10, nombre: "Microsoft Word", dias: "MAR-JUE [ 7:00 pm.-10:00 pm. ]", grupo: "MW2", modalidad: "VIRTUAL" },
      { id: 26, nombre: "MICROSOFT POWER POINT Y CANVA", dias: "LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]", grupo: "MP1", modalidad: "VIRTUAL" },
    ],
  },
  {
    area: "CURSOS AUTOCAD",
    cursos: [
      { id: 42, nombre: "Autocad I", dias: "LUN-MIE-VIE [ 9:00 am.-11:00 am. ]", grupo: "PD1", modalidad: "VIRTUAL" },
      { id: 43, nombre: "Autocad I", dias: "MAR-JUE [ 1:00 pm.-4:00 pm. ]", grupo: "PD2", modalidad: "PRESENCIAL" },
    ],
  },
  {
    area: "CURSOS ESPECIALES",
    cursos: [
      { id: 54, nombre: "Revit Architecture", dias: "MAR-JUE [ 4:00 pm.-7:00 pm. ]", grupo: "J11", modalidad: "VIRTUAL" },
      { id: 55, nombre: "Excel Intermedio", dias: "SAB-DOM [ 7:00 pm.-10:00 pm. ]", grupo: "XI1", modalidad: "VIRTUAL" },
    ],
  },
  {
    area: "ESPECIALIDAD: MICROSOFT EXCEL",
    cursos: [
      { id: 88, nombre: "MICROSOFT EXCEL BÁSICO", dias: "LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]", grupo: "MEB", modalidad: "VIRTUAL" },
      { id: 89, nombre: "MICROSOFT EXCEL INTERMEDIO", dias: "SAB-DOM[7:00 PM - 10:00 PM]", grupo: "MEI", modalidad: "VIRTUAL" },
    ],
  },
  {
    area: "AREA: CIENCIA DE DATOS",
    cursos: [
      { id: 94, nombre: "PROGRAMACIÓN EN PYTHON", dias: "LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]", grupo: "PP1", modalidad: "VIRTUAL" },
      { id: 95, nombre: "INTELIGENCIA ESTADÍSTICA", dias: "SAB-DOM[7:00 PM - 10:00 PM]", grupo: "IE1", modalidad: "VIRTUAL" },
    ],
  },
];

async function migrateHorarios() {
  let connection;
  
  try {
    // Crear conexión a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos MySQL');

    // Limpiar tabla existente (opcional)
    console.log('🧹 Limpiando tabla de horarios...');
    await connection.execute('DELETE FROM horarios');
    console.log('✅ Tabla de horarios limpiada');

    // Insertar datos
    console.log('📥 Insertando datos de horarios...');
    
    let totalInserted = 0;
    
    for (const areaData of horariosData) {
      for (const curso of areaData.cursos) {
        const query = `
          INSERT INTO horarios (area, nombre_curso, dias, grupo, modalidad, instructor, estado)
          VALUES (?, ?, ?, ?, ?, ?, 'activo')
        `;
        
        const values = [
          areaData.area,
          curso.nombre,
          curso.dias,
          curso.grupo,
          curso.modalidad,
          null, // instructor será null por ahora
        ];
        
        await connection.execute(query, values);
        totalInserted++;
        
        console.log(`✅ Insertado: ${curso.nombre} - ${curso.grupo} (${areaData.area})`);
      }
    }
    
    console.log(`\n🎉 Migración completada exitosamente!`);
    console.log(`📊 Total de horarios insertados: ${totalInserted}`);
    
    // Mostrar resumen por área
    console.log('\n📋 Resumen por área:');
    const resumenQuery = `
      SELECT area, COUNT(*) as total_cursos 
      FROM horarios 
      GROUP BY area 
      ORDER BY area
    `;
    
    const [resumen] = await connection.execute(resumenQuery);
    resumen.forEach(row => {
      console.log(`   ${row.area}: ${row.total_cursos} cursos`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de datos de horarios...\n');
migrateHorarios();
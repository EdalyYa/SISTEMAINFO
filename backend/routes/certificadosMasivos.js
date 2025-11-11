const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
// Usar el pool real para transacciones y la función execute para queries simples
const { pool, execute } = require('../config/database');
const path = require('path');
// Usar fs síncrono para existsSync/mkdirSync y fs.promises para operaciones async
const fs = require('fs');
const fsp = fs.promises;
const multer = require('multer');
const XLSX = require('xlsx');

// Generador de código de verificación de 6 caracteres (A-Z, 0-9)
function generateVerificationCode6() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Configuración de multer para subida de archivos Excel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/certificados_masivos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'batch-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls') ||
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls, .csv)'), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

// Ruta para subir archivo Excel y registrar en batch_uploads
router.post('/upload', authenticateToken, adminAuth, upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Insertar registro en batch_uploads
    const [result] = await execute(
      'INSERT INTO batch_uploads (filename, original_name, processed, num_certificates) VALUES (?, ?, 0, 0)',
      [req.file.filename, req.file.originalname]
    );

    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      id: result.insertId,
      filename: req.file.filename,
      original_name: req.file.originalname
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({
      error: 'Error al subir archivo',
      details: error.message
    });
  }
});

// Ruta para obtener lista de archivos subidos no procesados
router.get('/archivos', authenticateToken, adminAuth, async (req, res) => {
  try {
    const [rows] = await execute(
      'SELECT id, filename, original_name, upload_date, processed, num_certificates, error_log FROM batch_uploads WHERE processed = 0 ORDER BY upload_date DESC'
    );

    res.json({
      success: true,
      archivos: rows
    });

  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({
      error: 'Error al obtener archivos',
      details: error.message
    });
  }
});

// Ruta para procesar un archivo Excel subido
router.post('/procesar/:id', authenticateToken, adminAuth, async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    const { id } = req.params;

    // Obtener información del archivo
    const [batchRows] = await connection.execute(
      'SELECT filename, original_name FROM batch_uploads WHERE id = ? AND processed = 0',
      [id]
    );

    if (batchRows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado o ya procesado' });
    }

    const batchFile = batchRows[0];
    const filePath = path.join(__dirname, '../../uploads/certificados_masivos', batchFile.filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    // Leer archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ error: 'El archivo Excel está vacío' });
    }

    // Utilidades de normalización
    const normalizeKey = (k) => String(k).toLowerCase().trim().replace(/\s+/g, '_');
    const parseDateFlexible = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        const s = val.trim();
        // ISO yyyy-mm-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const d = new Date(s);
          return isNaN(d.getTime()) ? null : d;
        }
        // dd/mm/yyyy (formato común en ES)
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
          const [dd, mm, yyyy] = s.split('/').map(Number);
          const d = new Date(yyyy, mm - 1, dd);
          return isNaN(d.getTime()) ? null : d;
        }
      }
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Normalizar y validar datos
    const certificados = [];
    const errores = [];

    for (let i = 0; i < jsonData.length; i++) {
      const fila = jsonData[i];
      const filaExcel = i + 2; // +2 porque fila 1 es encabezado

      try {
        // Mapear columnas (ignorando mayúsculas y espacios)
        const datoNormalizado = {};
        const columnasRequeridas = ['dni', 'apellido_paterno', 'apellido_materno', 'nombres', 'tipo_certificado', 'nombre_evento', 'fecha_inicio', 'fecha_fin', 'horas_academicas', 'correo_electronico'];

        Object.keys(fila).forEach(key => {
          const keyNormalizada = normalizeKey(key);
          if (columnasRequeridas.includes(keyNormalizada)) {
            datoNormalizado[keyNormalizada] = fila[key];
          }
        });

        // Validaciones
        if (!datoNormalizado.dni || !/^[0-9]{8}$/.test(String(datoNormalizado.dni))) {
          errores.push(`Fila ${filaExcel}: DNI inválido (debe tener 8 dígitos)`);
          continue;
        }

        if (!datoNormalizado.apellido_paterno || !datoNormalizado.apellido_materno || !datoNormalizado.nombres) {
          errores.push(`Fila ${filaExcel}: Nombres y apellidos requeridos`);
          continue;
        }

        const tiposValidos = ['asistente', 'ponente', 'estudiante'];
        const tipoOriginal = String(datoNormalizado.tipo_certificado).toLowerCase().trim();
        const tipoMap = { 'participante': 'asistente', 'alumno': 'estudiante' };
        const tipoNormalizado = tipoMap[tipoOriginal] || tipoOriginal;
        if (!tiposValidos.includes(tipoNormalizado)) {
          errores.push(`Fila ${filaExcel}: Tipo de certificado inválido. Use: ${tiposValidos.join(', ')}`);
          continue;
        }

        if (!datoNormalizado.nombre_evento) {
          errores.push(`Fila ${filaExcel}: Nombre del evento requerido`);
          continue;
        }

        const fechaInicio = parseDateFlexible(datoNormalizado.fecha_inicio);
        const fechaFin = parseDateFlexible(datoNormalizado.fecha_fin);
        if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
          errores.push(`Fila ${filaExcel}: Fechas inválidas`);
          continue;
        }

        const horas = parseInt(datoNormalizado.horas_academicas);
        if (isNaN(horas) || horas <= 0) {
          errores.push(`Fila ${filaExcel}: Horas académicas deben ser un número positivo`);
          continue;
        }

        // Agregar certificado válido
        certificados.push({
          dni: String(datoNormalizado.dni),
          apellido_paterno: datoNormalizado.apellido_paterno,
          apellido_materno: datoNormalizado.apellido_materno,
          nombres: datoNormalizado.nombres,
          tipo_certificado: tipoNormalizado,
          nombre_evento: datoNormalizado.nombre_evento,
          fecha_inicio: fechaInicio.toISOString().slice(0, 10),
          fecha_fin: fechaFin.toISOString().slice(0, 10),
          horas_academicas: horas,
          correo_electronico: datoNormalizado.correo_electronico || null
        });

      } catch (error) {
        errores.push(`Fila ${filaExcel}: Error al procesar fila - ${error.message}`);
      }
    }

    if (certificados.length === 0) {
      return res.status(400).json({
        error: 'No se encontraron certificados válidos para procesar',
        errores
      });
    }

    // Procesar certificados usando el endpoint existente
    await connection.beginTransaction();
    transactionStarted = true;

    const resultados = [];

    for (let i = 0; i < certificados.length; i++) {
      const certificado = certificados[i];

      try {
        // Verificar si ya existe un certificado activo para este DNI y evento
        const [existingCert] = await connection.execute(
          'SELECT id FROM certificados WHERE dni = ? AND nombre_evento = ? AND activo = 1',
          [certificado.dni, certificado.nombre_evento]
        );

        if (existingCert.length > 0) {
          resultados.push({
            indice: i,
            dni: certificado.dni,
            exito: false,
            error: 'Ya existe un certificado activo para este participante en este evento',
            codigo_verificacion: null
          });
          continue;
        }

        // Generar código de verificación único de 6 caracteres
        let codigoVerificacion = '';
        let isUnique = false;
        while (!isUnique) {
          codigoVerificacion = generateVerificationCode6();
          const [existing] = await connection.execute(
            'SELECT id FROM certificados WHERE codigo_verificacion = ?',
            [codigoVerificacion]
          );
          isUnique = existing.length === 0;
        }

        // Construir nombre completo
        const nombreCompleto = `${certificado.apellido_paterno} ${certificado.apellido_materno}, ${certificado.nombres}`;

        // Crear certificado en la base de datos
        const [result] = await connection.execute(
          `INSERT INTO certificados (
            dni, nombre_completo, tipo_certificado, nombre_evento,
            descripcion_evento, fecha_inicio, fecha_fin, horas_academicas,
            codigo_verificacion, plantilla_certificado, fecha_emision, activo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
          [
            certificado.dni,
            nombreCompleto,
            certificado.tipo_certificado,
            certificado.nombre_evento,
            '',
            certificado.fecha_inicio,
            certificado.fecha_fin,
            certificado.horas_academicas,
            codigoVerificacion,
            'seminario-desarrollo.svg'
          ]
        );

        resultados.push({
          indice: i,
          dni: certificado.dni,
          exito: true,
          error: null,
          codigo_verificacion: codigoVerificacion,
          nombre_completo: nombreCompleto
        });

      } catch (certificadoError) {
        console.error(`Error al procesar certificado ${i}:`, certificadoError);
        resultados.push({
          indice: i,
          dni: certificado.dni,
          exito: false,
          error: certificadoError.message || 'Error desconocido al procesar certificado',
          codigo_verificacion: null
        });
      }
    }

    await connection.commit();

    // Actualizar batch_uploads
    const exitosos = resultados.filter(r => r.exito).length;
    const errorLog = errores.length > 0 ? errores.join('; ') : null;

    await connection.execute(
      'UPDATE batch_uploads SET processed = 1, num_certificates = ?, error_log = ? WHERE id = ?',
      [exitosos, errorLog, id]
    );

    // Eliminar archivo procesado
    try {
      await fsp.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error al eliminar archivo procesado:', unlinkError);
    }

    res.json({
      success: true,
      message: 'Archivo procesado exitosamente',
      resumen: {
        total_filas: jsonData.length,
        certificados_validos: certificados.length,
        certificados_generados: exitosos,
        errores: errores.length
      },
      resultados,
      errores
    });

  } catch (error) {
    try {
      if (connection && transactionStarted) {
        await connection.rollback();
      }
    } catch (rollbackError) {
      console.error('Rollback failed or not started:', rollbackError);
    }
    console.error('Error al procesar archivo:', error);
    res.status(500).json({
      error: 'Error al procesar archivo',
      details: error.message
    });
  } finally {
    try {
      if (connection) connection.release();
    } catch (releaseError) {
      console.error('Error releasing DB connection:', releaseError);
    }
  }
});

// Ruta para eliminar un archivo subido (y su registro)
router.delete('/archivos/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Buscar el registro
    const [rows] = await execute(
      'SELECT filename FROM batch_uploads WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const filename = rows[0].filename;
    const filePath = path.join(__dirname, '../../uploads/certificados_masivos', filename);

    // Intentar borrar el archivo del sistema
    try {
      if (fs.existsSync(filePath)) {
        await fsp.unlink(filePath);
      }
    } catch (unlinkError) {
      console.error('Error eliminando archivo físico:', unlinkError);
      // Continuar para borrar el registro aunque falle el borrado físico
    }

    // Borrar el registro
    await execute('DELETE FROM batch_uploads WHERE id = ?', [id]);

    res.json({ success: true, message: 'Archivo y registro eliminados' });

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Ruta para generar certificados en lote desde datos de Excel
router.post('/generar-lote', authenticateToken, adminAuth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { certificados } = req.body; // Array de certificados a generar
    
    if (!certificados || !Array.isArray(certificados) || certificados.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de certificados',
        detalles: 'El body debe contener un array "certificados" con los datos de los certificados a generar'
      });
    }

    await connection.beginTransaction();
    
    const resultados = [];
    
    for (let i = 0; i < certificados.length; i++) {
      const certificado = certificados[i];
      
      try {
        // Validar datos requeridos
        const errores = [];
        if (!certificado.dni) errores.push('DNI requerido');
        if (!certificado.apellido_paterno) errores.push('Apellido paterno requerido');
        if (!certificado.apellido_materno) errores.push('Apellido materno requerido');
        if (!certificado.nombres) errores.push('Nombres requeridos');
        if (!certificado.tipo_certificado) errores.push('Tipo de certificado requerido');
        if (!certificado.nombre_evento) errores.push('Nombre del evento requerido');
        if (!certificado.fecha_inicio) errores.push('Fecha de inicio requerida');
        if (!certificado.fecha_fin) errores.push('Fecha de fin requerida');
        if (!certificado.horas_academicas) errores.push('Horas académicas requeridas');
        
        if (errores.length > 0) {
          resultados.push({
            indice: i,
            dni: certificado.dni,
            exito: false,
            error: `Datos incompletos: ${errores.join(', ')}`,
            codigo_verificacion: null
          });
          continue;
        }

        // Verificar si ya existe un certificado activo para este DNI y evento
        const [existingCert] = await connection.execute(
          'SELECT id FROM certificados WHERE dni = ? AND nombre_evento = ? AND activo = 1',
          [certificado.dni, certificado.nombre_evento]
        );

        if (existingCert.length > 0) {
          resultados.push({
            indice: i,
            dni: certificado.dni,
            exito: false,
            error: 'Ya existe un certificado activo para este participante en este evento',
            codigo_verificacion: null
          });
          continue;
        }

        // Generar código de verificación único
        const codigoVerificacion = Math.random().toString(36).substring(2, 15).toUpperCase();
        
        // Construir nombre completo
        const nombreCompleto = `${certificado.apellido_paterno} ${certificado.apellido_materno}, ${certificado.nombres}`;
        
        // Crear certificado en la base de datos
        const [result] = await connection.execute(
          `INSERT INTO certificados (
            dni, nombre_completo, tipo_certificado, nombre_evento, 
            descripcion_evento, fecha_inicio, fecha_fin, horas_academicas,
            codigo_verificacion, plantilla_certificado, fecha_emision, activo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
          [
            certificado.dni,
            nombreCompleto,
            certificado.tipo_certificado,
            certificado.nombre_evento,
            certificado.descripcion_evento || '',
            certificado.fecha_inicio,
            certificado.fecha_fin,
            certificado.horas_academicas,
            codigoVerificacion,
            'seminario-desarrollo.svg'
          ]
        );

        // Nota: Generación de PDF comentada temporalmente hasta que se resuelva el servicio PDFGeneratorService
        // let pdfPath = null;
        // if (certificado.diseno_id) {
        //   // Lógica de PDF aquí
        // }

        resultados.push({
          indice: i,
          dni: certificado.dni,
          exito: true,
          error: null,
          codigo_verificacion: codigoVerificacion,
          pdf_path: null,
          nombre_completo: nombreCompleto
        });

      } catch (certificadoError) {
        console.error(`Error al procesar certificado ${i}:`, certificadoError);
        resultados.push({
          indice: i,
          dni: certificado.dni,
          exito: false,
          error: certificadoError.message || 'Error desconocido al procesar certificado',
          codigo_verificacion: null
        });
      }
    }

    await connection.commit();
    
    // Resumen del proceso
    const exitosos = resultados.filter(r => r.exito).length;
    const fallidos = resultados.filter(r => !r.exito).length;
    
    res.json({
      exito: true,
      resumen: {
        total: certificados.length,
        exitosos,
        fallidos
      },
      resultados
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en generación masiva:', error);
    res.status(500).json({ 
      error: 'Error al procesar certificados en lote',
      detalles: error.message 
    });
  } finally {
    connection.release();
  }
});

// Ruta para obtener plantillas de certificados disponibles
router.get('/plantillas', authenticateToken, adminAuth, async (req, res) => {
  try {
    const [plantillas] = await pool.execute(`
      SELECT 
        id,
        nombre,
        descripcion,
        imagen_fondo,
        logo_path,
        configuracion,
        fecha_creacion,
        activo
      FROM disenos_certificados 
      WHERE activo = 1 
      ORDER BY fecha_creacion DESC
    `);

    res.json({
      exito: true,
      plantillas: plantillas.map(p => ({
        ...p,
        configuracion: p.configuracion ? JSON.parse(p.configuracion) : null
      }))
    });

  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({ 
      error: 'Error al obtener plantillas de certificados',
      detalles: error.message 
    });
  }
});

// Ruta para guardar una nueva plantilla de certificado
router.post('/plantillas', authenticateToken, adminAuth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nombre, descripcion, imagen_fondo, logo_path, configuracion } = req.body;
    
    // Validar datos requeridos
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la plantilla es requerido' });
    }
    
    if (!configuracion) {
      return res.status(400).json({ error: 'La configuración de la plantilla es requerida' });
    }

    await connection.beginTransaction();
    
    // Insertar nueva plantilla
    const [result] = await connection.execute(`
      INSERT INTO disenos_certificados 
      (nombre, descripcion, imagen_fondo, logo_path, configuracion, fecha_creacion, activo) 
      VALUES (?, ?, ?, ?, ?, NOW(), 1)
    `, [
      nombre,
      descripcion || '',
      imagen_fondo || '',
      logo_path || '',
      JSON.stringify(configuracion)
    ]);

    await connection.commit();
    
    res.json({
      exito: true,
      mensaje: 'Plantilla creada exitosamente',
      id: result.insertId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar plantilla:', error);
    res.status(500).json({ 
      error: 'Error al guardar plantilla de certificado',
      detalles: error.message 
    });
  } finally {
    connection.release();
  }
});

// Ruta para actualizar una plantilla existente
router.put('/plantillas/:id', authenticateToken, adminAuth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen_fondo, logo_path, configuracion } = req.body;
    
    await connection.beginTransaction();
    
    // Actualizar plantilla
    const [result] = await connection.execute(`
      UPDATE disenos_certificados 
      SET nombre = ?, descripcion = ?, imagen_fondo = ?, logo_path = ?, configuracion = ?
      WHERE id = ?
    `, [
      nombre,
      descripcion || '',
      imagen_fondo || '',
      logo_path || '',
      JSON.stringify(configuracion),
      id
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    await connection.commit();
    
    res.json({
      exito: true,
      mensaje: 'Plantilla actualizada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar plantilla:', error);
    res.status(500).json({ 
      error: 'Error al actualizar plantilla de certificado',
      detalles: error.message 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

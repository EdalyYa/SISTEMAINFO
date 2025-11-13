const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
let QRCode = null;
try {
  QRCode = require('qrcode');
} catch (e) {
  // Módulo opcional: si no está instalado, se usa el render manual
  QRCode = null;
}

class PDFGeneratorService {
  constructor() {
    this.defaultConfig = {
      size: 'A4',
      layout: 'landscape',
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    };
  }

  /**
   * Resuelve una ruta de activo que puede venir en distintos formatos
   * Soporta:
   *  - Rutas absolutas del backend: "/uploads/certificados/..."
   *  - Rutas relativas: "plantillas/certificado_A4.png"
   *  - Rutas ya relativas a uploads: "certificados/..."
   * Retorna una ruta absoluta en disco dentro del backend.
   */
  _resolveUploadPath(spec) {
    if (!spec || typeof spec !== 'string') return null;
    const s = String(spec);
    // Normalizar separadores para Windows/Linux
    const normalized = s.replace(/\\/g, '/');
    try {
      // Soporte para rutas absolutas en disco
      if (path.isAbsolute(normalized)) {
        return fs.existsSync(normalized) ? normalized : null;
      }
      // Soporte para data URLs (base64) para imágenes embebidas
      if (normalized.startsWith('data:')) {
        // Guardar temporalmente en disco para que pdfkit pueda leer
        const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const fileName = `inline-${Date.now()}.png`;
        const filePath = path.join(tmpDir, fileName);
        const base64 = normalized.split(',')[1];
        if (base64) {
          fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
          return filePath;
        }
        return null;
      }
    
      if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        // No soportamos cargar por HTTP en el servidor; se omite
        return null;
      }
      const candidates = [];
      const projectRoot = process.cwd ? process.cwd() : path.join(__dirname, '..');

      if (normalized.startsWith('/uploads/')) {
        const rel = normalized.replace(/^\//, '');
        candidates.push(path.join(__dirname, '..', rel));
        candidates.push(path.join(projectRoot, rel));
        candidates.push(path.join(projectRoot, 'backend', rel));
      } else if (normalized.startsWith('uploads/')) {
        candidates.push(path.join(__dirname, '..', normalized));
        candidates.push(path.join(projectRoot, normalized));
        candidates.push(path.join(projectRoot, 'backend', normalized));
      } else if (normalized.startsWith('certificados/')) {
        candidates.push(path.join(__dirname, '..', 'uploads', normalized));
        candidates.push(path.join(projectRoot, 'uploads', normalized));
        candidates.push(path.join(projectRoot, 'backend', 'uploads', normalized));
      } else {
        // Caso general: asumir que es relativo a uploads/certificados
        candidates.push(path.join(__dirname, '..', 'uploads', 'certificados', normalized));
        candidates.push(path.join(projectRoot, 'uploads', 'certificados', normalized));
        candidates.push(path.join(projectRoot, 'backend', 'uploads', 'certificados', normalized));
      }

      for (const candidate of candidates) {
        if (candidate && fs.existsSync(candidate)) {
          return candidate;
        }
      }
      return null;
    } catch (e) {
      console.error('❌ Error resolviendo ruta de upload:', e);
      return null;
    }
  }

  /**
   * Valida los datos del certificado antes de generar el PDF
   * @param {Object} certificateData - Datos del certificado
   * @returns {Object} - Resultado de validación
   */
  validateCertificateData(certificateData) {
    const errors = [];
    
    if (!certificateData.codigo_verificacion) {
      errors.push('Código de verificación requerido');
    }
    
    if (!certificateData.nombre_completo) {
      errors.push('Nombre completo requerido');
    }
    
    if (!certificateData.nombre_evento) {
      errors.push('Nombre del evento requerido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera un PDF del certificado con la configuración especificada
   * @param {Object} certificateData - Datos del certificado
   * @param {Object} templateConfig - Configuración de la plantilla
   * @param {boolean} includeFooter - Si incluir código de verificación en el pie
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  async generateCertificatePDF(certificateData, templateConfig = {}, includeFooter = true) {
    // Validar datos del certificado
    const validation = this.validateCertificateData(certificateData);
    if (!validation.isValid) {
      throw new Error(`Datos del certificado inválidos: ${validation.errors.join(', ')}`);
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfBuffers = [];
        
        // Crear documento PDF
        const doc = new PDFDocument(this.defaultConfig);
        
        // Capturar el PDF en memoria
        doc.on('data', (chunk) => {
          pdfBuffers.push(chunk);
        });
        
        doc.on('end', () => {
          resolve(Buffer.concat(pdfBuffers));
        });
        
        doc.on('error', (error) => {
          reject(error);
        });
        
        // Generar contenido del PDF usando la lógica correcta
        this._renderPDFContent(doc, certificateData, templateConfig, includeFooter);
        
        // Finalizar el documento
        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera una vista previa del PDF sin almacenarlo
   * @param {Object} certificateData - Datos del certificado
   * @param {Object} templateConfig - Configuración de la plantilla
   * @returns {Promise<Buffer>} - Buffer del PDF de vista previa
   */
  async generatePreview(certificateData, templateConfig = {}) {
    // Vista previa sin marca de agua
    return this.generateCertificatePDF(certificateData, templateConfig, true);
  }

  /**
   * Renderiza el contenido del PDF usando la configuración de plantilla
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} certificateData - Datos del certificado
   * @param {Object} templateConfig - Configuración de la plantilla
   * @param {boolean} includeFooter - Si incluir el pie de página
   * @private
   */
  _renderPDFContent(doc, certificateData, templateConfig, includeFooter) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Parsear configuración de elementos
    let configuracion = {};
    if (templateConfig.configuracion) {
      try {
        if (typeof templateConfig.configuracion === 'object') {
          configuracion = templateConfig.configuracion;
        } else {
          configuracion = JSON.parse(templateConfig.configuracion);
        }
      } catch (error) {
        console.error('Error parsing template configuration:', error);
        configuracion = {};
      }
    }

    console.log('🎨 Configuración parseada:', {
      tieneElementos: !!(configuracion.elementos && Array.isArray(configuracion.elementos)),
      cantidadElementos: configuracion.elementos ? configuracion.elementos.length : 0,
      tieneFondo: !!templateConfig.fondo_certificado,
      tieneLogos: !!(templateConfig.logo_izquierdo || templateConfig.logo_derecho)
    });

    // Renderizar fondo personalizado
    this._renderBackground(doc, templateConfig, pageWidth, pageHeight);
    
    // Renderizar logos
    if (configuracion?.usarLogos === true) {
      this._renderLogos(doc, templateConfig, configuracion, pageWidth);
    }
    
    // Renderizar elementos usando la lógica correcta (configuracion)
    const hasConfigElements = configuracion && Object.keys(configuracion).length > 0;
    if (hasConfigElements) {
      this._renderElements(doc, certificateData, configuracion);
    } else {
      // Fallback: si no hay configuración definida, renderizar elementos básicos para que
      // la vista previa no quede sólo con el fondo.
      this._renderBasicElements(doc, certificateData, configuracion);
    }
    
    // Renderizar marca de agua sólo si se solicita explícitamente
    const showPreviewWatermark = !!templateConfig.showPreviewWatermark;
    if (showPreviewWatermark) {
      this._renderPreviewWatermark(doc, pageWidth, pageHeight);
    }
    
    // Renderizar pie de página con código de verificación
    if (includeFooter) {
      this._renderFooter(doc, certificateData, pageWidth, pageHeight);
    }
  }

  /**
   * Renderiza el fondo del certificado
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} templateConfig - Configuración de la plantilla
   * @param {number} pageWidth - Ancho de la página
   * @param {number} pageHeight - Alto de la página
   * @private
   */
  _renderBackground(doc, templateConfig, pageWidth, pageHeight) {
    if (templateConfig.fondo_certificado) {
      try {
        let fondoPath = this._resolveUploadPath(templateConfig.fondo_certificado);
        if (!fondoPath || !fs.existsSync(fondoPath)) {
          // Fallback robusto: intentar el fondo por defecto
          const defaultSpecs = [
            'plantillas/certificado_A4.png',
            'certificados/plantillas/certificado_A4.png',
            '/uploads/certificados/plantillas/certificado_A4.png'
          ];
        
          for (const spec of defaultSpecs) {
            const candidate = this._resolveUploadPath(spec);
            if (candidate && fs.existsSync(candidate)) {
              fondoPath = candidate;
              break;
            }
          }
        }

        if (fondoPath && fs.existsSync(fondoPath)) {
          doc.image(fondoPath, 0, 0, { width: pageWidth, height: pageHeight });
          console.log('✅ Fondo renderizado');
        } else {
          console.log('❌ No se pudo renderizar fondo. Verifique rutas y archivos.');
        }
      } catch (error) {
        console.error('❌ Error renderizando fondo:', error);
      }
    }
  }

  /**
   * Renderiza los logos del certificado usando la configuración correcta
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} templateConfig - Configuración de la plantilla
   * @param {Object} configuracion - Configuración de elementos
   * @param {number} pageWidth - Ancho de la página
   * @private
   */
  _renderLogos(doc, templateConfig, configuracion, pageWidth) {
    // Logo izquierdo usando configuración
    if (templateConfig.logo_izquierdo && configuracion.logoIzquierdo) {
      try {
        let logoPath = this._resolveUploadPath(templateConfig.logo_izquierdo);
        if (!logoPath || !fs.existsSync(logoPath)) {
          const fallbacks = [
            'plantillas/logo_izquierdo.png',
            'certificados/plantillas/logo_izquierdo.png',
            '/uploads/certificados/plantillas/logo_izquierdo.png'
          ];
          for (const spec of fallbacks) {
            const candidate = this._resolveUploadPath(spec);
            if (candidate && fs.existsSync(candidate)) { logoPath = candidate; break; }
          }
        }
        if (logoPath && fs.existsSync(logoPath)) {
          const logoConfig = configuracion.logoIzquierdo;
          doc.image(logoPath, logoConfig.x || 50, logoConfig.y || 50, {
            width: logoConfig.width || 80,
            height: logoConfig.height || 80
          });
          console.log('✅ Logo izquierdo renderizado con configuración');
        }
      } catch (error) {
        console.error('❌ Error renderizando logo izquierdo:', error);
      }
    }

    // Logo derecho usando configuración
    if (templateConfig.logo_derecho && configuracion.logoDerecho) {
      try {
        let logoPath = this._resolveUploadPath(templateConfig.logo_derecho);
        if (!logoPath || !fs.existsSync(logoPath)) {
          const fallbacks = [
            'plantillas/logo_derecho.png',
            'certificados/plantillas/logo_derecho.png',
            '/uploads/certificados/plantillas/logo_derecho.png'
          ];
          for (const spec of fallbacks) {
            const candidate = this._resolveUploadPath(spec);
            if (candidate && fs.existsSync(candidate)) { logoPath = candidate; break; }
          }
        }
        if (logoPath && fs.existsSync(logoPath)) {
          const logoConfig = configuracion.logoDerecho;
          doc.image(logoPath, logoConfig.x || (pageWidth - 130), logoConfig.y || 50, {
            width: logoConfig.width || 80,
            height: logoConfig.height || 80
          });
          console.log('✅ Logo derecho renderizado con configuración');
        }
      } catch (error) {
        console.error('❌ Error renderizando logo derecho:', error);
      }
    }
  }

  /**
   * Renderiza los elementos del certificado usando la estructura correcta
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} certificateData - Datos del certificado
   * @param {Object} configuracion - Configuración de elementos
   * @private
   */
  _renderElements(doc, certificateData, configuracion) {
    console.log('🎨 Renderizando elementos con configuración:', Object.keys(configuracion));
    
    // Renderizar nombre del instituto
    if (configuracion.nombreInstituto && configuracion.nombreInstituto.visible !== false) {
      const config = configuracion.nombreInstituto;
      doc.fontSize(config.fontSize || 18)
         .fillColor(config.color || '#000000')
         .font(config.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
         .text('INSTITUTO DE INFORMÁTICA UNA-PUNO', config.x || 400, config.y || 120, {
           width: 400,
           align: 'center'
         });
      console.log('✅ Nombre del instituto renderizado');
    }

    // Renderizar título del certificado
    if (configuracion.titulo && configuracion.titulo.visible !== false) {
      const config = configuracion.titulo;
      doc.fontSize(config.fontSize || 32)
         .fillColor(config.color || '#000000')
         .font(config.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
         .text('CERTIFICADO', config.x || 400, config.y || 150, {
           width: 400,
           align: 'center'
         });
      console.log('✅ Título renderizado');
    }

    // Renderizar "Otorgado a"
    if (configuracion.otorgado && configuracion.otorgado.visible !== false) {
      const config = configuracion.otorgado;
      doc.fontSize(config.fontSize || 14)
         .fillColor(config.color || '#000000')
         .font('Helvetica')
         .text('Otorgado a:', config.x || 400, config.y || 200, {
           width: config.width || 400,
           align: config.align || 'center'
         });
      console.log('✅ Otorgado a renderizado');
    }

    // Renderizar nombre del estudiante
    if (configuracion.nombreEstudiante && configuracion.nombreEstudiante.visible !== false) {
      const config = configuracion.nombreEstudiante;
      doc.fontSize(config.fontSize || 24)
         .fillColor(config.color || '#000000')
         .font(config.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
         .text(certificateData.nombre_completo, config.x || 400, config.y || 280, {
           width: config.width || 400,
           align: config.align || 'center'
         });
      console.log('✅ Nombre del estudiante renderizado');
    }

    // Renderizar descripción del evento
    if (configuracion.descripcion && configuracion.descripcion.visible !== false) {
      const config = configuracion.descripcion;
      doc.fontSize(config.fontSize || 14)
         .fillColor(config.color || '#000000')
         .font('Helvetica')
         .text(`Por haber participado en: ${certificateData.nombre_evento}`, config.x || 400, config.y || 320, {
           width: config.width || 500,
           align: config.align || 'center'
         });
      console.log('✅ Descripción renderizada');
    }

    // Renderizar rol/participación (e.g., Asistente)
    if (configuracion.rolParticipacion && configuracion.rolParticipacion.visible !== false) {
      const config = configuracion.rolParticipacion;
      const rol = certificateData.rol || (String(certificateData.tipo_certificado || '').toLowerCase().includes('asis') ? 'Asistente' : 'Participante');
      doc.fontSize(config.fontSize || 14)
         .fillColor(config.color || '#000000')
         .font(config.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
         .text(rol, config.x || 400, config.y || 340, {
           width: config.width || 300,
           align: config.align || 'center'
         });
      console.log('✅ Rol de participación renderizado');
    }

    // Renderizar detalle del evento (nombre del programa/capacitación)
    if (configuracion.eventoDetalle && configuracion.eventoDetalle.visible !== false) {
      const config = configuracion.eventoDetalle;
      const texto = certificateData.nombre_evento || '';
      doc.fontSize(config.fontSize || 14)
         .fillColor(config.color || '#000000')
         .font('Helvetica-Bold')
         .text(texto, config.x || 200, config.y || 360, {
           width: config.width || 650,
           align: config.align || 'left'
         });
      console.log('✅ Detalle de evento renderizado');
    }

    // Renderizar periodo y horas (realizados del ... con una duración de ... horas)
    if (configuracion.periodoHoras && configuracion.periodoHoras.visible !== false) {
      const config = configuracion.periodoHoras;
      const inicio = new Date(certificateData.fecha_inicio);
      const fin = new Date(certificateData.fecha_fin);
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

      let rango = '';
      if (
        inicio.getMonth() === fin.getMonth() &&
        inicio.getFullYear() === fin.getFullYear()
      ) {
        rango = `realizados del ${inicio.getDate()} al ${fin.getDate()} de ${meses[fin.getMonth()]} del ${fin.getFullYear()}`;
      } else {
        rango = `realizados del ${inicio.getDate()} de ${meses[inicio.getMonth()]} al ${fin.getDate()} de ${meses[fin.getMonth()]} del ${fin.getFullYear()}`;
      }

      const horas = certificateData.horas_academicas
        ? `, con una duración de ${certificateData.horas_academicas} horas.`
        : '';
      const texto = `${rango}${horas}`;

      doc.fontSize(config.fontSize || 14)
         .fillColor(config.color || '#000000')
         .font('Helvetica')
         .text(texto, config.x || 200, config.y || 380, {
           width: config.width || 650,
           align: config.align || 'left'
         });
      console.log('✅ Periodo y horas renderizados');
    }

    // Renderizar fecha (Puno, DD de Mes del AAAA)
    if (configuracion.fecha && configuracion.fecha.visible !== false) {
      const config = configuracion.fecha;
      const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      const fechaBase = certificateData.fecha_emision
        ? new Date(certificateData.fecha_emision)
        : (certificateData.fecha_fin ? new Date(certificateData.fecha_fin) : new Date());
      const fechaTexto = `${fechaBase.getDate()} de ${meses[fechaBase.getMonth()]} del ${fechaBase.getFullYear()}`;

      doc.fontSize(config.fontSize || 14)
         .fillColor(config.color || '#000000')
         .font('Helvetica')
         .text(`Puno, ${fechaTexto}`, config.x || 400, config.y || 450, {
           width: config.width || 400,
           align: config.align || 'center'
         });
      console.log('✅ Fecha renderizada');
    }

    // Renderizar código de verificación (si está en la configuración)
    if (configuracion.codigo && configuracion.codigo.visible !== false) {
      const config = configuracion.codigo;
      doc.fontSize(config.fontSize || 12)
         .fillColor(config.color || '#666666')
         .font('Helvetica')
         .text(`Código: ${certificateData.codigo_verificacion}`, config.x || 400, config.y || 500, {
           width: config.width || 400,
           align: config.align || 'center'
         });
      console.log('✅ Código de verificación renderizado');
    }

    // Renderizar QR code
    if (configuracion.qr && configuracion.qr.visible !== false) {
      this._renderQRCode(doc, certificateData, configuracion);
    }

    console.log('✅ Todos los elementos renderizados correctamente');
  }

  /**
   * Renderiza el código QR del certificado
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} certificateData - Datos del certificado
   * @param {Object} configuracion - Configuración de elementos
   * @private
   */
  _renderQRCode(doc, certificateData, configuracion) {
    if (configuracion.qr) {
      try {
        const qrConfig = configuracion.qr;
        const qrX = qrConfig.x || 650;
        const qrY = qrConfig.y || 450;
        const qrSize = qrConfig.width || 100;

        // Contenido del QR: URL pública de validación con DNI + código
        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:4001';
        const dni = certificateData.dni || '';
        const code = certificateData.codigo_verificacion || '';
        const qrUrl = `${baseUrl}/api/certificados-publicos/validar?dni=${encodeURIComponent(dni)}&codigo=${encodeURIComponent(code)}`;

        // Si está disponible el módulo QRCode, generar imagen real
        if (QRCode) {
          return QRCode.toBuffer(qrUrl, { width: qrSize, margin: 0 }, (err, buffer) => {
            if (err) {
              console.error('❌ Error generando QR real, usando fallback:', err);
              this._renderFallbackQR(doc, code, qrX, qrY, qrSize);
            } else {
              doc.image(buffer, qrX, qrY, { width: qrSize, height: qrSize });
              doc.fontSize(7)
                 .fillColor('#1e40af')
                 .font('Helvetica-Bold')
                 .text('VERIFICAR CERTIFICADO', qrX - 10, qrY + qrSize + 5, {
                   width: qrSize + 20,
                   align: 'center'
                 });
              console.log('✅ Código QR real renderizado');
            }
          });
        }

        // Fallback sin dependencia externa
        this._renderFallbackQR(doc, code, qrX, qrY, qrSize);
        doc.fontSize(7)
           .fillColor('#1e40af')
           .font('Helvetica-Bold')
           .text('VERIFICAR CERTIFICADO', qrX - 10, qrY + qrSize + 5, {
             width: qrSize + 20,
             align: 'center'
           });
        console.log('✅ Código QR fallback renderizado');
      } catch (error) {
        console.error('❌ Error renderizando QR:', error);
      }
    }
  }

  /**
   * Renderiza un QR fallback manual si la librería no está disponible
   */
  _renderFallbackQR(doc, code, qrX, qrY, qrSize) {
    const cellSize = qrSize / 25;
    doc.save();
    doc.rect(qrX, qrY, qrSize, qrSize)
       .fill('#ffffff')
       .stroke('#000000')
       .lineWidth(1);

    const positions = [[0, 0], [18, 0], [0, 18]];
    positions.forEach(([px, py]) => {
      doc.rect(qrX + px * cellSize, qrY + py * cellSize, 7 * cellSize, 7 * cellSize)
         .fill('#000000');
      doc.rect(qrX + (px + 1) * cellSize, qrY + (py + 1) * cellSize, 5 * cellSize, 5 * cellSize)
         .fill('#ffffff');
      doc.rect(qrX + (px + 2) * cellSize, qrY + (py + 2) * cellSize, 3 * cellSize, 3 * cellSize)
         .fill('#000000');
    });

    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((i < 9 && j < 9) || (i < 9 && j > 15) || (i > 15 && j < 9)) {
          continue;
        }
        const charIndex = (i + j) % code.length;
        const charCode = code.charCodeAt(charIndex);
        if ((charCode + i * j) % 3 === 0) {
          doc.rect(qrX + i * cellSize, qrY + j * cellSize, cellSize, cellSize).fill('#000000');
        }
      }
    }
    doc.restore();
  }

  /**
   * Renderiza elementos básicos como fallback
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} certificateData - Datos del certificado
   * @param {Object} configuracion - Configuración de elementos
   * @private
   */
  _renderBasicElements(doc, certificateData, configuracion) {
    // Título básico
    doc.fontSize(32)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('CERTIFICADO', 400, 150, {
         width: 400,
         align: 'center'
       });

    // Nombre del estudiante
    doc.fontSize(24)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(certificateData.nombre_completo, 400, 280, {
         width: 400,
         align: 'center'
       });

    // Descripción del evento
    doc.fontSize(14)
       .fillColor('#000000')
       .font('Helvetica')
       .text(`Por haber participado en: ${certificateData.nombre_evento}`, 400, 320, {
         width: 500,
         align: 'center'
       });

    // Fecha
    if (certificateData.periodo_evento) {
      doc.fontSize(14)
         .fillColor('#000000')
         .font('Helvetica')
         .text(`Puno, ${certificateData.periodo_evento}`, 400, 450, {
           width: 400,
           align: 'center'
         });
    }

    console.log('✅ Elementos básicos renderizados como fallback');
  }

  /**
   * Renderiza marca de agua para vista previa
   * @param {PDFDocument} doc - Documento PDF
   * @param {number} pageWidth - Ancho de la página
   * @param {number} pageHeight - Alto de la página
   * @private
   */
  _renderPreviewWatermark(doc, pageWidth, pageHeight) {
    doc.save();
    doc.fontSize(48)
       .fillColor('#ff0000')
       .opacity(0.3)
       .font('Helvetica-Bold')
       .text('VISTA PREVIA', pageWidth / 2 - 150, pageHeight / 2 - 24, {
         width: 300,
         align: 'center'
       });
    doc.restore();
  }

  /**
   * Renderiza el pie de página con código de verificación
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} certificateData - Datos del certificado
   * @param {number} pageWidth - Ancho de la página
   * @param {number} pageHeight - Alto de la página
   * @private
   */
  _renderFooter(doc, certificateData, pageWidth, pageHeight) {
    doc.fontSize(8)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Código de verificación: ${certificateData.codigo_verificacion}`, 50, pageHeight - 30, {
         width: pageWidth - 100,
         align: 'center'
       });
  }
}

module.exports = PDFGeneratorService;

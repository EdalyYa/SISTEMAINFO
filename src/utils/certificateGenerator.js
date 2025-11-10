import jsPDF from 'jspdf';

/**
 * Generador de certificados en PDF
 * Toma una plantilla de imagen y superpone el nombre del estudiante
 */
class CertificateGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Genera un certificado en PDF
   * @param {Object} options - Opciones para generar el certificado
   * @param {string} options.templateUrl - URL de la plantilla de imagen
   * @param {string} options.studentName - Nombre completo del estudiante
   * @param {string} options.courseName - Nombre del curso
   * @param {string} options.completionDate - Fecha de finalización
   * @param {number} options.hours - Horas académicas
   * @param {Object} options.textPosition - Posición del texto {x, y}
   * @param {Object} options.textStyle - Estilo del texto {fontSize, fontFamily, color}
   * @returns {Promise<Blob>} - PDF generado como Blob
   */
  async generateCertificate(options) {
    const {
      templateUrl,
      studentName,
      courseName,
      completionDate,
      hours,
      textPosition = { x: 400, y: 300 },
      textStyle = {
        fontSize: 36,
        fontFamily: 'Arial',
        color: '#1e3a8a',
        fontWeight: 'bold'
      }
    } = options;

    try {
      // Cargar la imagen de la plantilla
      const templateImage = await this.loadImage(templateUrl);
      
      // Configurar el canvas con las dimensiones de la plantilla
      this.canvas.width = templateImage.width;
      this.canvas.height = templateImage.height;
      
      // Dibujar la plantilla en el canvas
      this.ctx.drawImage(templateImage, 0, 0);
      
      // Configurar el estilo del texto
      this.ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamily}`;
      this.ctx.fillStyle = textStyle.color;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Añadir sombra al texto para mejor legibilidad
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      
      // Dibujar el nombre del estudiante
      this.ctx.fillText(studentName, textPosition.x, textPosition.y);
      
      // Convertir canvas a imagen
      const canvasDataUrl = this.canvas.toDataURL('image/jpeg', 0.95);
      
      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [this.canvas.width, this.canvas.height]
      });
      
      // Añadir la imagen al PDF
      pdf.addImage(
        canvasDataUrl,
        'JPEG',
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      
      // Añadir metadatos al PDF
      pdf.setProperties({
        title: `Certificado - ${studentName}`,
        subject: courseName,
        author: 'Universidad Nacional del Altiplano - FIE',
        creator: 'Sistema de Certificados FIE-UNA',
        producer: 'Sistema de Certificados FIE-UNA'
      });
      
      return pdf.output('blob');
      
    } catch (error) {
      console.error('Error generando certificado:', error);
      throw new Error('No se pudo generar el certificado: ' + error.message);
    }
  }

  /**
   * Carga una imagen desde una URL
   * @param {string} url - URL de la imagen
   * @returns {Promise<HTMLImageElement>} - Imagen cargada
   */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Para evitar problemas de CORS
      
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error(`No se pudo cargar la imagen: ${url}`));
      
      img.src = url;
    });
  }

  /**
   * Descarga un certificado PDF
   * @param {Blob} pdfBlob - PDF como Blob
   * @param {string} filename - Nombre del archivo
   */
  downloadPDF(pdfBlob, filename) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera y descarga un certificado
   * @param {Object} certificateData - Datos del certificado
   * @returns {Promise<void>}
   */
  async generateAndDownload(certificateData) {
    try {
      const {
        studentName,
        dni,
        courseName,
        completionDate,
        templateUrl
      } = certificateData;

      // Generar el PDF
      const pdfBlob = await this.generateCertificate({
        templateUrl,
        studentName,
        courseName,
        completionDate,
        textPosition: this.calculateTextPosition(templateUrl),
        textStyle: this.getTextStyle(templateUrl)
      });

      // Crear nombre del archivo
      const filename = `certificado-${dni}-${Date.now()}.pdf`;
      
      // Descargar el PDF
      this.downloadPDF(pdfBlob, filename);
      
      return { success: true, filename };
      
    } catch (error) {
      console.error('Error en generateAndDownload:', error);
      throw error;
    }
  }

  /**
   * Calcula la posición del texto basada en la plantilla
   * @param {string} templateUrl - URL de la plantilla
   * @returns {Object} - Posición {x, y}
   */
  calculateTextPosition(templateUrl) {
    // Posiciones predefinidas para diferentes plantillas
    const positions = {
      'seminario-desarrollo.jpg': { x: 665, y: 425 },
      'default': { x: 400, y: 300 }
    };

    const templateName = templateUrl.split('/').pop();
    return positions[templateName] || positions.default;
  }

  /**
   * Obtiene el estilo de texto para una plantilla específica
   * @param {string} templateUrl - URL de la plantilla
   * @returns {Object} - Estilo del texto
   */
  getTextStyle(templateUrl) {
    const styles = {
      'seminario-desarrollo.jpg': {
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#1e3a8a',
        fontWeight: 'bold'
      },
      'default': {
        fontSize: 36,
        fontFamily: 'Arial',
        color: '#1e3a8a',
        fontWeight: 'bold'
      }
    };

    const templateName = templateUrl.split('/').pop();
    return styles[templateName] || styles.default;
  }

  /**
   * Previsualiza un certificado en un canvas
   * @param {Object} options - Opciones del certificado
   * @param {HTMLCanvasElement} targetCanvas - Canvas donde mostrar la previsualización
   * @returns {Promise<void>}
   */
  async previewCertificate(options, targetCanvas) {
    const {
      templateUrl,
      studentName,
      textPosition = { x: 400, y: 300 },
      textStyle = {
        fontSize: 36,
        fontFamily: 'Arial',
        color: '#1e3a8a',
        fontWeight: 'bold'
      }
    } = options;

    try {
      const templateImage = await this.loadImage(templateUrl);
      const ctx = targetCanvas.getContext('2d');
      
      // Ajustar el canvas al tamaño de la plantilla
      targetCanvas.width = templateImage.width;
      targetCanvas.height = templateImage.height;
      
      // Dibujar la plantilla
      ctx.drawImage(templateImage, 0, 0);
      
      // Configurar y dibujar el texto
      ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamily}`;
      ctx.fillStyle = textStyle.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Sombra para el texto
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(studentName, textPosition.x, textPosition.y);
      
    } catch (error) {
      console.error('Error en previsualización:', error);
      throw error;
    }
  }
}

// Instancia singleton del generador
const certificateGenerator = new CertificateGenerator();

export default certificateGenerator;

// Funciones de utilidad exportadas
export const generateCertificate = (options) => certificateGenerator.generateCertificate(options);
export const generateAndDownload = (certificateData) => certificateGenerator.generateAndDownload(certificateData);
export const previewCertificate = (options, canvas) => certificateGenerator.previewCertificate(options, canvas);
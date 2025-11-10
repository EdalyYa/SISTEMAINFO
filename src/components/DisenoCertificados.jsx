import React, { useState, useEffect } from 'react';
import { API_BASE } from '@/config/api';
import { 
  Palette, 
  Upload, 
  Save, 
  Eye, 
  RotateCcw,
  Image as ImageIcon,
  Settings,
  Download,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const DisenoCertificados = ({ onClose, datosEstudiante, onCertificadoGuardado }) => {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [configuracionActual, setConfiguracionActual] = useState({
    nombre: '',
    configuracion: {
      logoIzquierdo: { x: 50, y: 50, width: 100, height: 100 },
      logoDerecho: { x: 650, y: 50, width: 100, height: 100 },
      nombreInstituto: { x: 400, y: 120, fontSize: 18, color: '#000000', fontFamily: 'serif', fontWeight: 'normal', fontStyle: 'normal' },
      titulo: { x: 400, y: 200, fontSize: 32, color: '#000000', fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'normal' },
      otorgado: { x: 400, y: 250, fontSize: 16, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal' },
      nombreEstudiante: { x: 400, y: 280, fontSize: 24, color: '#000000', fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'normal' },
      descripcion: { x: 400, y: 350, fontSize: 16, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal' },
      fecha: { x: 400, y: 450, fontSize: 14, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal' },
      codigo: { x: 400, y: 500, fontSize: 12, color: '#666666', fontFamily: 'monospace', fontWeight: 'normal', fontStyle: 'normal' },
      firmaIzquierda: { x: 200, y: 550, width: 150, height: 80 },
      firmaDerecha: { x: 550, y: 550, width: 150, height: 80 },
      qr: { x: 650, y: 450, width: 80, height: 80 }
    },
    logoIzquierdo: null,
    logoDerecho: null,
    fondoCertificado: null,
    activa: false
  });
  const [certificadoEjemplo, setCertificadoEjemplo] = useState(null);
  const [datosActuales, setDatosActuales] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    cargarConfiguraciones();
    cargarConfiguracionPorDefecto();
    if (datosEstudiante) {
      // Si se reciben datos del estudiante, usarlos en lugar del ejemplo
      setDatosActuales(datosEstudiante);
    } else {
      cargarCertificadoEjemplo();
    }
  }, [datosEstudiante]);

  // Efecto separado para cuando cambian los datos del estudiante
  useEffect(() => {
    if (datosEstudiante) {
      setDatosActuales(datosEstudiante);
    }
  }, [datosEstudiante]);

  const cargarConfiguraciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/admin/certificados/disenos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConfiguraciones(data);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    }
  };

  const cargarConfiguracionPorDefecto = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/admin/certificados/disenos/activa/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfiguracionActual(data);
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración por defecto:', error);
    }
  };

  const cargarCertificadoEjemplo = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/certificados?limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.certificados && data.certificados.length > 0) {
          setCertificadoEjemplo(data.certificados[0]);
        }
      }
    } catch (error) {
      console.error('Error al cargar certificado ejemplo:', error);
    }
  };

  const handleFileUpload = async (file, tipo) => {
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF)');
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    console.log('Subiendo archivo:', file.name, 'Tipo:', tipo);
    
    // Crear previsualización inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
      setConfiguracionActual(prev => ({
        ...prev,
        [`${tipo}Preview`]: e.target.result
      }));
    };
    reader.readAsDataURL(file);
    
    const formData = new FormData();
    formData.append('imagen', file);

    const token = localStorage.getItem('token');
    console.log('Token disponible:', !!token);

    try {
      setLoading(true);
      const response = await fetch('/admin/certificados/disenos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload exitoso:', data);
        setConfiguracionActual(prev => ({
          ...prev,
          [tipo]: data.url
        }));
        alert('Imagen subida exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error del servidor:', errorData);
        alert(errorData.error || `Error al subir la imagen (${response.status})`);
        // Limpiar previsualización en caso de error
        setConfiguracionActual(prev => ({
          ...prev,
          [`${tipo}Preview`]: null
        }));
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Error de conexión al subir la imagen');
      // Limpiar previsualización en caso de error
      setConfiguracionActual(prev => ({
        ...prev,
        [`${tipo}Preview`]: null
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // Generar automáticamente el nombre si no existe y hay datos del estudiante
    if (!configuracionActual.nombre.trim() && datosEstudiante) {
      const nombreAutomatico = `CERT-${datosEstudiante.dni}-${Date.now().toString().slice(-6)}`;
      setConfiguracionActual(prev => ({
        ...prev,
        nombre: nombreAutomatico
      }));
    } else if (!configuracionActual.nombre.trim()) {
      alert('Por favor ingresa un nombre para la configuración');
      return;
    }

    try {
      setLoading(true);
      const method = configuracionActual.id ? 'PUT' : 'POST';
      const url = configuracionActual.id 
        ? `/admin/certificados/disenos/update-with-urls/${configuracionActual.id}`
        : '/admin/certificados/disenos/save-with-urls';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: configuracionActual.nombre,
          configuracion: configuracionActual.configuracion,
          logoIzquierdo: configuracionActual.logoIzquierdo,
          logoDerecho: configuracionActual.logoDerecho,
          fondoCertificado: configuracionActual.fondoCertificado,
          activa: configuracionActual.activa
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Configuración guardada exitosamente');
        
        if (!configuracionActual.id) {
          setConfiguracionActual(prev => ({ 
            ...prev, 
            id: data.id,
            // Limpiar previsualizaciones después de guardar exitosamente
            logoIzquierdoPreview: null,
            logoDerechoPreview: null,
            fondoCertificadoPreview: null
          }));
        } else {
          // Si es una actualización, también limpiar previsualizaciones
          setConfiguracionActual(prev => ({
            ...prev,
            logoIzquierdoPreview: null,
            logoDerechoPreview: null,
            fondoCertificadoPreview: null
          }));
        }
        
        cargarConfiguraciones();
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const resetearConfiguracion = () => {
    setConfiguracionActual({
      nombre: '',
      configuracion: {
        logoIzquierdo: { x: 50, y: 50, width: 100, height: 100 },
        logoDerecho: { x: 650, y: 50, width: 100, height: 100 },
        nombreInstituto: { x: 400, y: 120, fontSize: 18, color: '#000000', fontFamily: 'serif', fontWeight: 'normal', fontStyle: 'normal' },
        titulo: { x: 400, y: 200, fontSize: 32, color: '#000000', fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'normal' },
        otorgado: { x: 400, y: 250, fontSize: 16, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal' },
        nombreEstudiante: { x: 400, y: 280, fontSize: 24, color: '#000000', fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'normal' },
        descripcion: { x: 400, y: 350, fontSize: 16, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal' },
        fecha: { x: 400, y: 450, fontSize: 14, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal' },
        codigo: { x: 400, y: 500, fontSize: 12, color: '#666666', fontFamily: 'monospace', fontWeight: 'normal', fontStyle: 'normal' },
        firmaIzquierda: { x: 200, y: 550, width: 150, height: 80 },
        firmaDerecha: { x: 550, y: 550, width: 150, height: 80 },
        qr: { x: 650, y: 450, width: 80, height: 80 }
      },
      logoIzquierdo: null,
      logoDerecho: null,
      fondoCertificado: null,
      // Limpiar también las previsualizaciones
      logoIzquierdoPreview: null,
      logoDerechoPreview: null,
      fondoCertificadoPreview: null,
      activa: false
    });
    setSelectedElement(null);
  };

  const handleDragStart = (e, elemento) => {
    setDraggedElement(elemento);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setConfiguracionActual(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [draggedElement]: {
          ...prev.configuracion[draggedElement],
          x: Math.max(0, Math.min(x, rect.width - 100)),
          y: Math.max(0, Math.min(y, rect.height - 50))
        }
      }
    }));

    setDraggedElement(null);
  };

  const updateElementProperty = (elementKey, property, value) => {
    setConfiguracionActual(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [elementKey]: {
          ...prev.configuracion[elementKey],
          [property]: value
        }
      }
    }));
  };

  const handleElementClick = (elementKey) => {
    setSelectedElement(elementKey);
  };

  const cargarConfiguracion = (config) => {
    setConfiguracionActual({
      ...config,
      // Limpiar previsualizaciones para mostrar las imágenes guardadas
      logoIzquierdoPreview: null,
      logoDerechoPreview: null,
      fondoCertificadoPreview: null
    });
    setSelectedElement(null);
  };

  const activarConfiguracion = async (id) => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
      const response = await fetch(`/admin/certificados/disenos/${id}/activar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Configuración activada exitosamente');
        
        // Cargar la configuración activada en el editor
        const configToActivate = configuraciones.find(config => config.id === id);
        if (configToActivate) {
          setConfiguracionActual({
            ...configToActivate,
            // Limpiar previsualizaciones para mostrar las imágenes guardadas
            logoIzquierdoPreview: null,
            logoDerechoPreview: null,
            fondoCertificadoPreview: null
          });
          setSelectedElement(null);
        }
        
        cargarConfiguraciones();
        cargarConfiguracionPorDefecto();
      } else {
        alert('Error al activar la configuración');
      }
    } catch (error) {
      console.error('Error al activar configuración:', error);
      alert('Error al activar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const eliminarConfiguracion = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      return;
    }

    try {
        setLoading(true);
        const token = localStorage.getItem('token');
      const response = await fetch(`/admin/certificados/disenos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Configuración eliminada exitosamente');
        cargarConfiguraciones();
      } else {
        alert('Error al eliminar la configuración');
      }
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      alert('Error al eliminar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const generarPDFPrevisualizacion = async () => {
    try {
      setLoading(true);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });

      // Fondo
      if (configuracionActual.fondoCertificado) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = configuracionActual.fondoCertificado;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          pdf.addImage(img, 'JPEG', 0, 0, 800, 600);
        } catch (error) {
          console.warn('No se pudo cargar la imagen de fondo:', error);
        }
      }

      // Logos
      if (configuracionActual.logoIzquierdo) {
        try {
          const logoIzq = new Image();
          logoIzq.crossOrigin = 'anonymous';
          logoIzq.src = configuracionActual.logoIzquierdo;
          await new Promise((resolve, reject) => {
            logoIzq.onload = resolve;
            logoIzq.onerror = reject;
          });
          const config = configuracionActual.configuracion.logoIzquierdo;
          pdf.addImage(logoIzq, 'PNG', config.x, config.y, config.width, config.height);
        } catch (error) {
          console.warn('No se pudo cargar el logo izquierdo:', error);
        }
      }

      if (configuracionActual.logoDerecho) {
        try {
          const logoDer = new Image();
          logoDer.crossOrigin = 'anonymous';
          logoDer.src = configuracionActual.logoDerecho;
          await new Promise((resolve, reject) => {
            logoDer.onload = resolve;
            logoDer.onerror = reject;
          });
          const config = configuracionActual.configuracion.logoDerecho;
          pdf.addImage(logoDer, 'PNG', config.x, config.y, config.width, config.height);
        } catch (error) {
          console.warn('No se pudo cargar el logo derecho:', error);
        }
      }

      // Textos
      // Usar datosActuales si están disponibles, sino usar certificadoEjemplo
      const datosParaCertificado = datosActuales || certificadoEjemplo;
      
      const elementos = [
        { key: 'nombreInstituto', text: 'INSTITUTO DE INFORMÁTICA UNA-PUNO' },
        { key: 'titulo', text: 'CERTIFICADO' },
        { key: 'otorgado', text: 'Otorgado a:' },
        { key: 'nombreEstudiante', text: datosParaCertificado?.nombre_completo || '[NOMBRE DEL ESTUDIANTE]' },
        { key: 'descripcion', text: datosParaCertificado ? `Por haber participado en "${datosParaCertificado.nombre_evento}" realizado del ${datosParaCertificado.fecha_inicio ? new Date(datosParaCertificado.fecha_inicio).toLocaleDateString('es-ES') : '[FECHA INICIO]'} al ${datosParaCertificado.fecha_fin ? new Date(datosParaCertificado.fecha_fin).toLocaleDateString('es-ES') : '[FECHA FIN]'}.` : 'Por haber participado como Asistente en la capacitación de "Desarrollo de Aplicaciones Web con React y Node.js" realizada del 01 al 15 de Diciembre del 2024.' },
        { key: 'fecha', text: datosParaCertificado?.fecha_emision ? new Date(datosParaCertificado.fecha_emision).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { key: 'codigo', text: `Código: ${datosParaCertificado?.codigo_verificacion || 'CERT-2024-001'}` }
      ];

      elementos.forEach(elemento => {
        const config = configuracionActual.configuracion[elemento.key];
        pdf.setFontSize(config.fontSize);
        pdf.setTextColor(config.color);
        
        if (elemento.key === 'descripcion') {
          const lines = pdf.splitTextToSize(elemento.text, 400);
          pdf.text(lines, config.x, config.y, { align: 'center' });
        } else {
          pdf.text(elemento.text, config.x, config.y, { align: 'center' });
        }
      });

      // Firmas
      const firmaIzq = configuracionActual.configuracion.firmaIzquierda;
      pdf.line(firmaIzq.x, firmaIzq.y + firmaIzq.height - 20, firmaIzq.x + firmaIzq.width, firmaIzq.y + firmaIzq.height - 20);
      pdf.setFontSize(10);
      pdf.text('Director', firmaIzq.x + firmaIzq.width / 2, firmaIzq.y + firmaIzq.height - 5, { align: 'center' });

      const firmaDer = configuracionActual.configuracion.firmaDerecha;
      pdf.line(firmaDer.x, firmaDer.y + firmaDer.height - 20, firmaDer.x + firmaDer.width, firmaDer.y + firmaDer.height - 20);
      pdf.text('Coordinador', firmaDer.x + firmaDer.width / 2, firmaDer.y + firmaDer.height - 5, { align: 'center' });

      // QR placeholder
      const qrConfig = configuracionActual.configuracion.qr;
      pdf.rect(qrConfig.x, qrConfig.y, qrConfig.width, qrConfig.height);
      pdf.setFontSize(8);
      pdf.text('QR Code', qrConfig.x + qrConfig.width / 2, qrConfig.y + qrConfig.height / 2, { align: 'center' });

      pdf.save(`certificado-preview-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF de previsualización');
    } finally {
      setLoading(false);
    }
  };

  const guardarCertificado = async () => {
    if (!datosEstudiante) {
      alert('No hay datos del estudiante para generar el certificado');
      return;
    }

    // Generar automáticamente el nombre basado en el DNI si no existe
    if (!configuracionActual.nombre || configuracionActual.nombre.trim() === '') {
      const nombreAutomatico = `CERT-${datosEstudiante.dni}-${Date.now().toString().slice(-6)}`;
      setConfiguracionActual(prev => ({
        ...prev,
        nombre: nombreAutomatico
      }));
    }

    // Si no tiene ID, guardar primero el diseño
    if (!configuracionActual.id) {
      await handleSaveConfiguration();
      // Esperar un momento para que se complete el guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      setLoading(true);
      
      // Generar código único para el certificado
      const codigoVerificacion = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const certificadoData = {
        datosEstudiante: {
          dni: datosEstudiante.dni,
          nombreCompleto: datosEstudiante.nombre_completo,
          tipoDocumento: datosEstudiante.tipoDocumento || 'DNI',
          nombreEvento: datosEstudiante.nombre_evento,
          fechaInicio: datosEstudiante.fecha_inicio,
          fechaFin: datosEstudiante.fecha_fin,
          horasAcademicas: datosEstudiante.horas_academicas,
          modalidad: datosEstudiante.modalidad,
          observaciones: datosEstudiante.observaciones
        },
        disenoId: configuracionActual.id,
        codigoVerificacion: codigoVerificacion
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/admin/certificados/guardar-con-diseno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(certificadoData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Descargar automáticamente el PDF
        await handleDownloadPDF(result.certificado.codigo_verificacion);
        
        alert(`Certificado guardado y descargado exitosamente. Código: ${result.certificado.codigo_verificacion}`);
        
        // Llamar callback si existe
        if (onCertificadoGuardado) {
          onCertificadoGuardado(result.certificado);
        }
        
        // Cerrar modal
        if (onClose) {
          onClose();
        }
      } else {
        alert(result.message || 'Error al guardar el certificado');
      }
    } catch (error) {
      console.error('Error al guardar certificado:', error);
      alert('Error al guardar el certificado');
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar PDF automáticamente
  const handleDownloadPDF = async (codigoVerificacion) => {
    try {
      const response = await fetch(`/admin/certificados/pdf/${codigoVerificacion}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `certificado-${codigoVerificacion}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <Palette className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Diseño de Certificados</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo */}
          <div className="w-1/3 p-6 border-r overflow-y-auto">
            <div className="space-y-6">
              {/* Información del Estudiante */}
              {datosEstudiante && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Datos del Estudiante
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-green-700">DNI:</label>
                      <div className="bg-white px-3 py-2 border border-green-300 rounded text-sm text-gray-800">
                        {datosEstudiante.dni}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Nombre Completo:</label>
                      <div className="bg-white px-3 py-2 border border-green-300 rounded text-sm text-gray-800">
                        {datosEstudiante.nombre_completo}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Evento:</label>
                      <div className="bg-white px-3 py-2 border border-green-300 rounded text-sm text-gray-800">
                        {datosEstudiante.nombre_evento}
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Los datos se usarán automáticamente en el certificado
                    </p>
                  </div>
                </div>
              )}

              {/* Nombre de configuración - Oculto, se genera automáticamente */}
              <div style={{ display: 'none' }}>
                <input
                  type="text"
                  value={configuracionActual.nombre}
                  onChange={(e) => setConfiguracionActual(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sección de imágenes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={20} />
                  Imágenes
                </h3>
                
                {/* Logo izquierdo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo izquierdo
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'logoIzquierdo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {(configuracionActual.logoIzquierdoPreview || configuracionActual.logoIzquierdo) && (
                    <div className="mt-2 relative">
                      <img 
                        src={configuracionActual.logoIzquierdoPreview || configuracionActual.logoIzquierdo} 
                        alt="Logo izquierdo" 
                        className="w-16 h-16 object-contain border rounded shadow-sm"
                      />
                      {configuracionActual.logoIzquierdoPreview && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                          Nuevo
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Logo derecho */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo derecho
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'logoDerecho')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {(configuracionActual.logoDerechoPreview || configuracionActual.logoDerecho) && (
                    <div className="mt-2 relative">
                      <img 
                        src={configuracionActual.logoDerechoPreview || configuracionActual.logoDerecho} 
                        alt="Logo derecho" 
                        className="w-16 h-16 object-contain border rounded shadow-sm"
                      />
                      {configuracionActual.logoDerechoPreview && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                          Nuevo
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fondo del certificado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fondo del certificado
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'fondoCertificado')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {(configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado) && (
                    <div className="mt-2 relative">
                      <img 
                        src={configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado} 
                        alt="Fondo" 
                        className="w-full h-20 object-cover border rounded shadow-sm"
                      />
                      {configuracionActual.fondoCertificadoPreview && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                          Nuevo
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos soportados: JPG, PNG, GIF (máx. 5MB)
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                {/* Solo mostrar el botón Guardar si hay datos del estudiante */}
                {datosEstudiante ? (
                  <button
                    onClick={guardarCertificado}
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Guardando y Descargando...' : 'Guardar'}
                  </button>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>Selecciona un estudiante para generar el certificado</p>
                  </div>
                )}
              </div>

              {/* Panel de propiedades del elemento seleccionado */}
              {selectedElement && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={20} />
                    Propiedades: {selectedElement.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    {/* Posición */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
                        <input
                          type="number"
                          value={Math.round(configuracionActual.configuracion[selectedElement]?.x || 0)}
                          onChange={(e) => updateElementProperty(selectedElement, 'x', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
                        <input
                          type="number"
                          value={Math.round(configuracionActual.configuracion[selectedElement]?.y || 0)}
                          onChange={(e) => updateElementProperty(selectedElement, 'y', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Propiedades de texto */}
                    {!['logoIzquierdo', 'logoDerecho', 'firmaIzquierda', 'firmaDerecha', 'qr'].includes(selectedElement) && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
                          <input
                            type="range"
                            min="8"
                            max="48"
                            value={configuracionActual.configuracion[selectedElement]?.fontSize || 16}
                            onChange={(e) => updateElementProperty(selectedElement, 'fontSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 text-center mt-1">
                            {configuracionActual.configuracion[selectedElement]?.fontSize || 16}px
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Familia de fuente</label>
                          <select
                            value={configuracionActual.configuracion[selectedElement]?.fontFamily || 'sans-serif'}
                            onChange={(e) => updateElementProperty(selectedElement, 'fontFamily', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="serif">Serif (Times)</option>
                            <option value="sans-serif">Sans-serif (Arial)</option>
                            <option value="monospace">Monospace (Courier)</option>
                            <option value="cursive">Cursiva</option>
                            <option value="fantasy">Fantasía</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Peso</label>
                            <select
                              value={configuracionActual.configuracion[selectedElement]?.fontWeight || 'normal'}
                              onChange={(e) => updateElementProperty(selectedElement, 'fontWeight', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Negrita</option>
                              <option value="lighter">Ligera</option>
                              <option value="bolder">Más negrita</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Estilo</label>
                            <select
                              value={configuracionActual.configuracion[selectedElement]?.fontStyle || 'normal'}
                              onChange={(e) => updateElementProperty(selectedElement, 'fontStyle', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="normal">Normal</option>
                              <option value="italic">Cursiva</option>
                              <option value="oblique">Oblicua</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                          <input
                            type="color"
                            value={configuracionActual.configuracion[selectedElement]?.color || '#000000'}
                            onChange={(e) => updateElementProperty(selectedElement, 'color', e.target.value)}
                            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Propiedades de imágenes */}
                    {['logoIzquierdo', 'logoDerecho'].includes(selectedElement) && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ancho</label>
                            <input
                              type="number"
                              value={configuracionActual.configuracion[selectedElement]?.width || 100}
                              onChange={(e) => updateElementProperty(selectedElement, 'width', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Alto</label>
                            <input
                              type="number"
                              value={configuracionActual.configuracion[selectedElement]?.height || 100}
                              onChange={(e) => updateElementProperty(selectedElement, 'height', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Lista de configuraciones guardadas */}
              {configuraciones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuraciones Guardadas</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {configuraciones.map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{config.nombre}</p>
                          {config.activa && (
                            <span className="text-xs text-green-600 font-medium">Activa</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => cargarConfiguracion(config)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => activarConfiguracion(config.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Activar
                          </button>
                          <button
                            onClick={() => eliminarConfiguracion(config.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área de diseño */}
          <div className="flex-1 p-6">
            <div className="h-full">
              {previsualizacion ? (
                <div className="flex flex-col items-center h-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Vista Previa del Certificado</h2>
                    <p className="text-gray-600 text-center">Así se verá el certificado final</p>
                  </div>
                  <div 
                    className="relative bg-white border-2 border-gray-300 shadow-lg overflow-hidden"
                    style={{ width: '800px', height: '600px', transform: 'scale(0.8)', transformOrigin: 'top center' }}
                  >
                    {/* Fondo */}
                    {configuracionActual.fondoCertificado && (
                      <img
                        src={configuracionActual.fondoCertificado}
                        alt="Fondo"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ zIndex: 0 }}
                      />
                    )}

                    {/* Logos */}
                    {configuracionActual.logoIzquierdo && (
                      <img
                        src={configuracionActual.logoIzquierdo}
                        alt="Logo izquierdo"
                        className="absolute"
                        style={{
                          left: configuracionActual.configuracion.logoIzquierdo.x,
                          top: configuracionActual.configuracion.logoIzquierdo.y,
                          width: configuracionActual.configuracion.logoIzquierdo.width,
                          height: configuracionActual.configuracion.logoIzquierdo.height,
                          zIndex: 1
                        }}
                      />
                    )}

                    {configuracionActual.logoDerecho && (
                      <img
                        src={configuracionActual.logoDerecho}
                        alt="Logo derecho"
                        className="absolute"
                        style={{
                          left: configuracionActual.configuracion.logoDerecho.x,
                          top: configuracionActual.configuracion.logoDerecho.y,
                          width: configuracionActual.configuracion.logoDerecho.width,
                          height: configuracionActual.configuracion.logoDerecho.height,
                          zIndex: 1
                        }}
                      />
                    )}

                    {/* Textos */}
                    <div
                      className="absolute text-center"
                      style={{
                        left: configuracionActual.configuracion.nombreInstituto.x,
                        top: configuracionActual.configuracion.nombreInstituto.y,
                        fontSize: configuracionActual.configuracion.nombreInstituto.fontSize,
                        color: configuracionActual.configuracion.nombreInstituto.color,
                        fontFamily: configuracionActual.configuracion.nombreInstituto.fontFamily,
                        fontWeight: configuracionActual.configuracion.nombreInstituto.fontWeight,
                        fontStyle: configuracionActual.configuracion.nombreInstituto.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      INSTITUTO DE INFORMÁTICA UNA-PUNO
                    </div>

                    <div
                      className="absolute text-center"
                      style={{
                        left: configuracionActual.configuracion.titulo.x,
                        top: configuracionActual.configuracion.titulo.y,
                        fontSize: configuracionActual.configuracion.titulo.fontSize,
                        color: configuracionActual.configuracion.titulo.color,
                        fontFamily: configuracionActual.configuracion.titulo.fontFamily,
                        fontWeight: configuracionActual.configuracion.titulo.fontWeight,
                        fontStyle: configuracionActual.configuracion.titulo.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      CERTIFICADO
                    </div>

                    <div
                      className="absolute text-center"
                      style={{
                        left: configuracionActual.configuracion.otorgado.x,
                        top: configuracionActual.configuracion.otorgado.y,
                        fontSize: configuracionActual.configuracion.otorgado.fontSize,
                        color: configuracionActual.configuracion.otorgado.color,
                        fontFamily: configuracionActual.configuracion.otorgado.fontFamily,
                        fontWeight: configuracionActual.configuracion.otorgado.fontWeight,
                        fontStyle: configuracionActual.configuracion.otorgado.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      Otorgado a:
                    </div>

                    <div
                      className="absolute text-center"
                      style={{
                        left: configuracionActual.configuracion.nombreEstudiante.x,
                        top: configuracionActual.configuracion.nombreEstudiante.y,
                        fontSize: configuracionActual.configuracion.nombreEstudiante.fontSize,
                        color: configuracionActual.configuracion.nombreEstudiante.color,
                        fontFamily: configuracionActual.configuracion.nombreEstudiante.fontFamily,
                        fontWeight: configuracionActual.configuracion.nombreEstudiante.fontWeight,
                        fontStyle: configuracionActual.configuracion.nombreEstudiante.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      {(datosActuales || certificadoEjemplo)?.nombre_completo || '[NOMBRE DEL ESTUDIANTE]'}
                    </div>

                    <div
                      className="absolute text-center max-w-lg"
                      style={{
                        left: configuracionActual.configuracion.descripcion.x,
                        top: configuracionActual.configuracion.descripcion.y,
                        fontSize: configuracionActual.configuracion.descripcion.fontSize,
                        color: configuracionActual.configuracion.descripcion.color,
                        fontFamily: configuracionActual.configuracion.descripcion.fontFamily,
                        fontWeight: configuracionActual.configuracion.descripcion.fontWeight,
                        fontStyle: configuracionActual.configuracion.descripcion.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      {(datosActuales || certificadoEjemplo) ? `Por haber participado en "${(datosActuales || certificadoEjemplo).nombre_evento}" realizado del ${(datosActuales || certificadoEjemplo).fecha_inicio ? new Date((datosActuales || certificadoEjemplo).fecha_inicio).toLocaleDateString('es-ES') : '[FECHA INICIO]'} al ${(datosActuales || certificadoEjemplo).fecha_fin ? new Date((datosActuales || certificadoEjemplo).fecha_fin).toLocaleDateString('es-ES') : '[FECHA FIN]'}.` : 'Por haber participado como Asistente en la capacitación de "Desarrollo de Aplicaciones Web con React y Node.js" realizada del 01 al 15 de Diciembre del 2024.'}
                    </div>

                    <div
                      className="absolute text-center"
                      style={{
                        left: configuracionActual.configuracion.fecha.x,
                        top: configuracionActual.configuracion.fecha.y,
                        fontSize: configuracionActual.configuracion.fecha.fontSize,
                        color: configuracionActual.configuracion.fecha.color,
                        fontFamily: configuracionActual.configuracion.fecha.fontFamily,
                        fontWeight: configuracionActual.configuracion.fecha.fontWeight,
                        fontStyle: configuracionActual.configuracion.fecha.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      {(datosActuales || certificadoEjemplo)?.fecha_emision ? new Date((datosActuales || certificadoEjemplo).fecha_emision).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    <div
                      className="absolute text-center"
                      style={{
                        left: configuracionActual.configuracion.codigo.x,
                        top: configuracionActual.configuracion.codigo.y,
                        fontSize: configuracionActual.configuracion.codigo.fontSize,
                        color: configuracionActual.configuracion.codigo.color,
                        fontFamily: configuracionActual.configuracion.codigo.fontFamily,
                        fontWeight: configuracionActual.configuracion.codigo.fontWeight,
                        fontStyle: configuracionActual.configuracion.codigo.fontStyle,
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}
                    >
                      Código: {certificadoEjemplo?.codigo_verificacion || 'CERT-2024-001'}
                    </div>

                    {/* Firmas */}
                    <div
                      className="absolute flex flex-col items-center justify-end"
                      style={{
                        left: configuracionActual.configuracion.firmaIzquierda.x,
                        top: configuracionActual.configuracion.firmaIzquierda.y,
                        width: configuracionActual.configuracion.firmaIzquierda.width,
                        height: configuracionActual.configuracion.firmaIzquierda.height,
                        zIndex: 1
                      }}
                    >
                      <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                      <div className="text-xs text-center font-medium">Director</div>
                    </div>

                    <div
                      className="absolute flex flex-col items-center justify-end"
                      style={{
                        left: configuracionActual.configuracion.firmaDerecha.x,
                        top: configuracionActual.configuracion.firmaDerecha.y,
                        width: configuracionActual.configuracion.firmaDerecha.width,
                        height: configuracionActual.configuracion.firmaDerecha.height,
                        zIndex: 1
                      }}
                    >
                      <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                      <div className="text-xs text-center font-medium">Coordinador</div>
                    </div>

                    {/* QR Code */}
                    <div
                      className="absolute flex items-center justify-center bg-gray-100 border"
                      style={{
                        left: configuracionActual.configuracion.qr.x,
                        top: configuracionActual.configuracion.qr.y,
                        width: configuracionActual.configuracion.qr.width,
                        height: configuracionActual.configuracion.qr.height,
                        zIndex: 1
                      }}
                    >
                      <div className="text-xs text-gray-600 text-center">
                        QR<br/>Code
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="h-full border-2 border-dashed border-gray-300 rounded-lg relative bg-gray-50 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Fondo */}
                  {(configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado) && (
                    <img
                      src={configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado}
                      alt="Fondo"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  
                  <div className="absolute inset-4">
                    <div className="bg-white bg-opacity-90 rounded-lg p-3 mb-4 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Editor Visual</h3>
                      <p className="text-sm text-gray-500">Arrastra los elementos para posicionarlos en el certificado</p>
                    </div>
                  </div>

                  {/* Grid de fondo */}
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Elementos arrastrables */}
                  <div className="relative">
                    {/* Logos */}
                    {(configuracionActual.logoIzquierdoPreview || configuracionActual.logoIzquierdo) && (
                      <div
                        className={`absolute border-2 transition-all cursor-move ${
                          selectedElement === 'logoIzquierdo' ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{
                          left: configuracionActual.configuracion.logoIzquierdo.x,
                          top: configuracionActual.configuracion.logoIzquierdo.y,
                          width: configuracionActual.configuracion.logoIzquierdo.width,
                          height: configuracionActual.configuracion.logoIzquierdo.height
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'logoIzquierdo')}
                        onClick={() => handleElementClick('logoIzquierdo')}
                      >
                        <img
                          src={configuracionActual.logoIzquierdoPreview || configuracionActual.logoIzquierdo}
                          alt="Logo izquierdo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {(configuracionActual.logoDerechoPreview || configuracionActual.logoDerecho) && (
                      <div
                        className={`absolute border-2 transition-all cursor-move ${
                          selectedElement === 'logoDerecho' ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{
                          left: configuracionActual.configuracion.logoDerecho.x,
                          top: configuracionActual.configuracion.logoDerecho.y,
                          width: configuracionActual.configuracion.logoDerecho.width,
                          height: configuracionActual.configuracion.logoDerecho.height
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'logoDerecho')}
                        onClick={() => handleElementClick('logoDerecho')}
                      >
                        <img
                          src={configuracionActual.logoDerechoPreview || configuracionActual.logoDerecho}
                          alt="Logo derecho"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Textos */}
                    {Object.entries({
                      nombreInstituto: 'INSTITUTO DE INFORMÁTICA UNA-PUNO',
                      titulo: 'CERTIFICADO',
                      otorgado: 'Otorgado a:',
                      nombreEstudiante: '[NOMBRE DEL ESTUDIANTE]',
                      descripcion: 'Por haber participado como Asistente en la capacitación...',
                      fecha: 'Puno, 15 de Diciembre del 2024',
                      codigo: 'Código: CERT-2024-001'
                    }).map(([key, text]) => (
                      <div
                        key={key}
                        className={`absolute text-center cursor-move border-2 transition-all px-2 py-1 ${
                          selectedElement === key ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{
                          left: configuracionActual.configuracion[key].x,
                          top: configuracionActual.configuracion[key].y,
                          fontSize: configuracionActual.configuracion[key].fontSize,
                          color: configuracionActual.configuracion[key].color,
                          fontFamily: configuracionActual.configuracion[key].fontFamily,
                          fontWeight: configuracionActual.configuracion[key].fontWeight,
                          fontStyle: configuracionActual.configuracion[key].fontStyle,
                          transform: 'translateX(-50%)'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, key)}
                        onClick={() => handleElementClick(key)}
                      >
                        {text}
                      </div>
                    ))}

                    {/* Firmas */}
                    <div
                      className={`absolute flex flex-col items-center justify-end cursor-move border-2 transition-all ${
                        selectedElement === 'firmaIzquierda' ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        left: configuracionActual.configuracion.firmaIzquierda.x,
                        top: configuracionActual.configuracion.firmaIzquierda.y,
                        width: configuracionActual.configuracion.firmaIzquierda.width,
                        height: configuracionActual.configuracion.firmaIzquierda.height
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'firmaIzquierda')}
                      onClick={() => handleElementClick('firmaIzquierda')}
                    >
                      <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                      <div className="text-xs text-center font-medium">Director</div>
                    </div>

                    <div
                      className={`absolute flex flex-col items-center justify-end cursor-move border-2 transition-all ${
                        selectedElement === 'firmaDerecha' ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        left: configuracionActual.configuracion.firmaDerecha.x,
                        top: configuracionActual.configuracion.firmaDerecha.y,
                        width: configuracionActual.configuracion.firmaDerecha.width,
                        height: configuracionActual.configuracion.firmaDerecha.height
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'firmaDerecha')}
                      onClick={() => handleElementClick('firmaDerecha')}
                    >
                      <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                      <div className="text-xs text-center font-medium">Coordinador</div>
                    </div>

                    {/* QR Code */}
                    <div
                      className={`absolute flex items-center justify-center bg-gray-100 border cursor-move border-2 transition-all ${
                        selectedElement === 'qr' ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        left: configuracionActual.configuracion.qr.x,
                        top: configuracionActual.configuracion.qr.y,
                        width: configuracionActual.configuracion.qr.width,
                        height: configuracionActual.configuracion.qr.height
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'qr')}
                      onClick={() => handleElementClick('qr')}
                    >
                      <div className="text-xs text-gray-600 text-center">
                        QR<br/>Code
                      </div>
                    </div>
                  </div>

                  {/* Indicadores de ayuda */}
                  <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 text-xs text-gray-600 shadow-lg">
                    <div className="font-medium text-gray-800 mb-2">Controles:</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Arrastra para mover</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <span>Click para seleccionar y editar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Vista Previa para ver resultado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DisenoCertificados;

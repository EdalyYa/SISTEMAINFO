import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Eye, 
  Download,
  User,
  Search,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { API_HOST, ASSET_BASE, API_BASE } from '../config/api';

const SelectorDisenosCertificados = ({ onClose, onCertificateGenerated }) => {
  const [disenos, setDisenos] = useState([]);
  const [selectedDiseno, setSelectedDiseno] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [searchDni, setSearchDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Seleccionar diseño, 2: Seleccionar estudiante, 3: Generar certificado

  useEffect(() => {
    cargarDisenos();
  }, []);

  const cargarDisenos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/certificados/disenos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisenos(data);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
    }
  };

  const buscarEstudiantes = async () => {
    if (searchDni.length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/certificados/buscar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dni: searchDni })
      });
      
      const data = await response.json();
      if (data.success) {
        setEstudiantes(data.certificados);
      } else {
        alert(data.message);
        setEstudiantes([]);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      alert('Error al buscar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const generarCertificadoConDiseno = async () => {
    if (!selectedDiseno || !selectedEstudiante) {
      alert('Debe seleccionar un diseño y un estudiante');
      return;
    }

    try {
      setLoading(true);
      
      // Crear un nuevo PDF en formato horizontal
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });
      
      // Configurar fondo si existe
      if (selectedDiseno.fondoCertificado) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = selectedDiseno.fondoCertificado.startsWith('/')
            ? selectedDiseno.fondoCertificado
            : `/${selectedDiseno.fondoCertificado}`;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          pdf.addImage(img, 'JPEG', 0, 0, 800, 600);
        } catch (error) {
          console.warn('No se pudo cargar la imagen de fondo:', error);
        }
      }
      
      // Agregar elementos de texto usando EXCLUSIVAMENTE la configuración del diseño guardada en DB
      console.log('Diseño seleccionado:', selectedDiseno);
      console.log('Configuración del diseño (raw):', selectedDiseno.configuracion);
      let mergedConfig = {};
      try {
        if (typeof selectedDiseno.configuracion === 'string') {
          mergedConfig = JSON.parse(selectedDiseno.configuracion);
        } else if (typeof selectedDiseno.configuracion === 'object' && selectedDiseno.configuracion !== null) {
          mergedConfig = selectedDiseno.configuracion;
        }
      } catch (e) {
        console.warn('No se pudo parsear configuracion del diseño:', e);
        mergedConfig = {};
      }
      
      // Nombre del instituto (solo si definido y visible)
      if (mergedConfig.nombreInstituto?.visible) {
        pdf.setFontSize(mergedConfig.nombreInstituto.fontSize || 18);
        pdf.setTextColor(mergedConfig.nombreInstituto.color || '#000000');
        pdf.text('INSTITUTO DE INFORMÁTICA UNA-PUNO', mergedConfig.nombreInstituto.x, mergedConfig.nombreInstituto.y, { align: 'center' });
      }
       
      // Título (solo si definido y visible)
      if (mergedConfig.titulo?.visible) {
        pdf.setFontSize(mergedConfig.titulo.fontSize || 32);
        pdf.setTextColor(mergedConfig.titulo.color || '#000000');
        pdf.text('CERTIFICADO', mergedConfig.titulo.x, mergedConfig.titulo.y, { align: 'center' });
      }
       
      // Otorgado (solo si definido y visible)
      if (mergedConfig.otorgado?.visible) {
        pdf.setFontSize(mergedConfig.otorgado.fontSize || 16);
        pdf.setTextColor(mergedConfig.otorgado.color || '#000000');
        pdf.text('Otorgado a:', mergedConfig.otorgado.x, mergedConfig.otorgado.y, { align: 'center' });
      }
       
      // Nombre del estudiante (datos reales, solo si definido y visible)
      if (mergedConfig.nombreEstudiante?.visible) {
        pdf.setFontSize(mergedConfig.nombreEstudiante.fontSize || 24);
        pdf.setTextColor(mergedConfig.nombreEstudiante.color || '#000000');
        pdf.text(selectedEstudiante.nombre_completo, mergedConfig.nombreEstudiante.x, mergedConfig.nombreEstudiante.y, { align: 'center' });
      }
       
      // Descripción (datos reales, solo si definida y visible)
      if (mergedConfig.descripcion?.visible) {
        pdf.setFontSize(mergedConfig.descripcion.fontSize || 16);
        pdf.setTextColor(mergedConfig.descripcion.color || '#000000');
        const descripcion = `Por haber participado en "${selectedEstudiante.nombre_evento}" realizado ${selectedEstudiante.periodo_evento}.`;
        const lines = pdf.splitTextToSize(descripcion, 400);
        pdf.text(lines, mergedConfig.descripcion.x, mergedConfig.descripcion.y, { align: 'center' });
      }
       
      // Fecha (datos reales, solo si definida y visible)
      if (mergedConfig.fecha?.visible) {
        pdf.setFontSize(mergedConfig.fecha.fontSize || 14);
        pdf.setTextColor(mergedConfig.fecha.color || '#000000');
        const fecha = new Date(selectedEstudiante.fecha_emision).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        pdf.text(`Puno, ${fecha}`, mergedConfig.fecha.x, mergedConfig.fecha.y, { align: 'center' });
      }
       
      // Código (datos reales, solo si definido y visible)
      if (mergedConfig.codigo?.visible) {
        pdf.setFontSize(mergedConfig.codigo.fontSize || 12);
        pdf.setTextColor(mergedConfig.codigo.color || '#666666');
        pdf.text(`Código: ${selectedEstudiante.codigo_verificacion}`, mergedConfig.codigo.x, mergedConfig.codigo.y, { align: 'center' });
      }
      
      // Logos eliminados
      
      // Líneas y textos de firma (solo si existen en configuración)
      if (mergedConfig.firmaIzquierda && mergedConfig.firmaDerecha) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(1);
        pdf.line(
          mergedConfig.firmaIzquierda.x,
          mergedConfig.firmaIzquierda.y + mergedConfig.firmaIzquierda.height - 20,
          mergedConfig.firmaIzquierda.x + mergedConfig.firmaIzquierda.width,
          mergedConfig.firmaIzquierda.y + mergedConfig.firmaIzquierda.height - 20
        );
        pdf.line(
          mergedConfig.firmaDerecha.x,
          mergedConfig.firmaDerecha.y + mergedConfig.firmaDerecha.height - 20,
          mergedConfig.firmaDerecha.x + mergedConfig.firmaDerecha.width,
          mergedConfig.firmaDerecha.y + mergedConfig.firmaDerecha.height - 20
        );
        
        pdf.setFontSize(10);
        pdf.setTextColor('#000000');
        pdf.text(
          'Director',
          mergedConfig.firmaIzquierda.x + mergedConfig.firmaIzquierda.width / 2,
          mergedConfig.firmaIzquierda.y + mergedConfig.firmaIzquierda.height - 5,
          { align: 'center' }
        );
        pdf.text(
          'Coordinador',
          mergedConfig.firmaDerecha.x + mergedConfig.firmaDerecha.width / 2,
          mergedConfig.firmaDerecha.y + mergedConfig.firmaDerecha.height - 5,
          { align: 'center' }
        );
      }
      
      // Descargar el PDF
      const nombreArchivo = `certificado-${selectedEstudiante.nombre_completo.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdf.save(nombreArchivo);
      
      // Actualizar el estado del certificado en la base de datos
      await actualizarEstadoCertificado(selectedEstudiante.id);
      
      alert('Certificado generado y descargado exitosamente');
      
      if (onCertificateGenerated) {
        onCertificateGenerated({
          estudiante: selectedEstudiante,
          diseno: selectedDiseno,
          archivo: nombreArchivo
        });
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error generando certificado:', error);
      alert('Error al generar el certificado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoCertificado = async (certificadoId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_HOST}/admin/certificados/${certificadoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          estado: 'Generado',
          fecha_generacion: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating certificate status:', error);
    }
  };

  const generarVistaPrevia = async (diseno) => {
    try {
      setLoading(true);
      
      // Crear un nuevo PDF en formato horizontal
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });
      
      // Configurar fondo si existe
      if (diseno.fondoCertificado) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `${ASSET_BASE}${diseno.fondoCertificado}`;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          pdf.addImage(img, 'JPEG', 0, 0, 800, 600);
        } catch (error) {
          console.warn('No se pudo cargar la imagen de fondo:', error);
        }
      }
      
      // Usar estrictamente la configuración guardada en DB (parsear si viene como string)
      let mergedConfig = {};
      try {
        if (typeof diseno.configuracion === 'string') {
          mergedConfig = JSON.parse(diseno.configuracion);
        } else if (typeof diseno.configuracion === 'object' && diseno.configuracion !== null) {
          mergedConfig = diseno.configuracion;
        }
      } catch (e) {
        console.warn('No se pudo parsear configuracion (preview):', e);
        mergedConfig = {};
      }
      
      // Agregar elementos de texto (solo definidos y visibles)
      if (mergedConfig.nombreInstituto?.visible) {
        pdf.setFontSize(mergedConfig.nombreInstituto.fontSize || 18);
        pdf.setTextColor(mergedConfig.nombreInstituto.color || '#000000');
        pdf.text('INSTITUTO DE INFORMÁTICA UNA-PUNO', mergedConfig.nombreInstituto.x, mergedConfig.nombreInstituto.y, { align: 'center' });
      }
      
      if (mergedConfig.titulo?.visible) {
        pdf.setFontSize(mergedConfig.titulo.fontSize || 32);
        pdf.setTextColor(mergedConfig.titulo.color || '#000000');
        pdf.text('CERTIFICADO', mergedConfig.titulo.x, mergedConfig.titulo.y, { align: 'center' });
      }
      
      if (mergedConfig.otorgado?.visible) {
        pdf.setFontSize(mergedConfig.otorgado.fontSize || 16);
        pdf.setTextColor(mergedConfig.otorgado.color || '#000000');
        pdf.text('Otorgado a:', mergedConfig.otorgado.x, mergedConfig.otorgado.y, { align: 'center' });
      }
      
      if (mergedConfig.nombreEstudiante?.visible) {
        pdf.setFontSize(mergedConfig.nombreEstudiante.fontSize || 24);
        pdf.setTextColor(mergedConfig.nombreEstudiante.color || '#000000');
        pdf.text('[NOMBRE DEL ESTUDIANTE]', mergedConfig.nombreEstudiante.x, mergedConfig.nombreEstudiante.y, { align: 'center' });
      }
      
      if (mergedConfig.descripcion?.visible) {
        pdf.setFontSize(mergedConfig.descripcion.fontSize || 16);
        pdf.setTextColor(mergedConfig.descripcion.color || '#000000');
        const descripcion = 'Por haber participado como Asistente en la capacitación de "Desarrollo de Aplicaciones Web con React y Node.js" realizada del 01 al 15 de Diciembre del 2024.';
        const lines = pdf.splitTextToSize(descripcion, 400);
        pdf.text(lines, mergedConfig.descripcion.x, mergedConfig.descripcion.y, { align: 'center' });
      }
      
      if (mergedConfig.fecha?.visible) {
        pdf.setFontSize(mergedConfig.fecha.fontSize || 14);
        pdf.setTextColor(mergedConfig.fecha.color || '#000000');
        pdf.text('Puno, 15 de Diciembre del 2024', mergedConfig.fecha.x, mergedConfig.fecha.y, { align: 'center' });
      }
      
      if (mergedConfig.codigo?.visible) {
        pdf.setFontSize(mergedConfig.codigo.fontSize || 12);
        pdf.setTextColor(mergedConfig.codigo.color || '#666666');
        pdf.text('Código: PREVIEW-001', mergedConfig.codigo.x, mergedConfig.codigo.y, { align: 'center' });
      }
      
      // Logos eliminados
      
      // Líneas y texto de firmas (solo si existen en configuración)
      if (mergedConfig.firmaIzquierda && mergedConfig.firmaDerecha) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(1);
        pdf.line(
          mergedConfig.firmaIzquierda.x,
          mergedConfig.firmaIzquierda.y + mergedConfig.firmaIzquierda.height - 20,
          mergedConfig.firmaIzquierda.x + mergedConfig.firmaIzquierda.width,
          mergedConfig.firmaIzquierda.y + mergedConfig.firmaIzquierda.height - 20
        );
        pdf.line(
          mergedConfig.firmaDerecha.x,
          mergedConfig.firmaDerecha.y + mergedConfig.firmaDerecha.height - 20,
          mergedConfig.firmaDerecha.x + mergedConfig.firmaDerecha.width,
          mergedConfig.firmaDerecha.y + mergedConfig.firmaDerecha.height - 20
        );

        // Texto de firmas
        pdf.setFontSize(10);
        pdf.setTextColor('#000000');
        pdf.text(
          'Director',
          mergedConfig.firmaIzquierda.x + mergedConfig.firmaIzquierda.width / 2,
          mergedConfig.firmaIzquierda.y + mergedConfig.firmaIzquierda.height - 5,
          { align: 'center' }
        );
        pdf.text(
          'Coordinador',
          mergedConfig.firmaDerecha.x + mergedConfig.firmaDerecha.width / 2,
          mergedConfig.firmaDerecha.y + mergedConfig.firmaDerecha.height - 5,
          { align: 'center' }
        );
      }
      
      // Descargar el PDF de vista previa
      const nombreArchivo = `vista-previa-${diseno.nombre.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdf.save(nombreArchivo);
      
      alert('Vista previa del diseño generada y descargada exitosamente');
      
    } catch (error) {
      console.error('Error generando vista previa:', error);
      alert('Error al generar la vista previa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Palette className="text-purple-600" />
        Paso 1: Seleccionar Diseño de Certificado
      </h3>
      
      {disenos.length === 0 ? (
        <div className="text-center py-8">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No hay diseños guardados</p>
          <p className="text-sm text-gray-400">Crea un diseño primero en el módulo de Diseño de Certificados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disenos.map((diseno) => (
            <motion.div
              key={diseno.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedDiseno?.id === diseno.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setSelectedDiseno(diseno)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{diseno.nombre}</h4>
                {selectedDiseno?.id === diseno.id && (
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                )}
              </div>
              
              {/* Vista previa del certificado */}
              <div className="mb-3">
                <div className="relative bg-white border rounded-lg overflow-hidden" style={{aspectRatio: '4/3'}}>
                  {/* Fondo del certificado */}
                  {diseno.fondoCertificado ? (
                <img
                  src={`${ASSET_BASE}${diseno.fondoCertificado}`}
                  alt="Fondo del certificado"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                  ) : null}
                  {/* Fondo por defecto (siempre presente como fallback) */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"
                    style={{display: diseno.fondoCertificado ? 'none' : 'block'}}
                  ></div>
                  
                  {/* Contenido del certificado en miniatura */}
                  <div className="absolute inset-0 p-2 text-xs">
                    {/* Logos eliminados en miniaturas */}
                    
                    {/* Texto del certificado */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="text-[6px] font-bold mb-1">INSTITUTO DE INFORMÁTICA</div>
                      <div className="text-[8px] font-bold mb-1">CERTIFICADO</div>
                      <div className="text-[5px] mb-1">Otorgado a:</div>
                      <div className="text-[6px] font-semibold mb-1">[NOMBRE DEL ESTUDIANTE]</div>
                      <div className="text-[4px] text-center px-2">Por haber participado en el evento...</div>
                    </div>
                  </div>
                  
                  {/* Overlay para indicar selección */}
                  {selectedDiseno?.id === diseno.id && (
                    <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-purple-600 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Creado: {new Date(diseno.created_at).toLocaleDateString('es-ES')}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generarVistaPrevia(diseno);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  Vista Previa
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <button
          onClick={() => selectedDiseno && setStep(2)}
          disabled={!selectedDiseno}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="text-blue-600" />
        Paso 2: Seleccionar Estudiante
      </h3>
      
      <div className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Ingrese DNI del estudiante (8 dígitos)"
            value={searchDni}
            onChange={(e) => setSearchDni(e.target.value)}
            maxLength={8}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={buscarEstudiantes}
            disabled={loading || searchDni.length !== 8}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Search size={18} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>
      
      {estudiantes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Certificados encontrados:</h4>
          {estudiantes.map((estudiante) => (
            <motion.div
              key={estudiante.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedEstudiante?.id === estudiante.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedEstudiante(estudiante)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{estudiante.nombre_completo}</h5>
                  <p className="text-sm text-gray-600">DNI: {estudiante.dni}</p>
                  <p className="text-sm text-gray-600">{estudiante.nombre_evento}</p>
                  <p className="text-xs text-gray-500">{estudiante.periodo_evento}</p>
                </div>
                {selectedEstudiante?.id === estudiante.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(1)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={() => selectedEstudiante && setStep(3)}
          disabled={!selectedEstudiante}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="text-green-600" />
        Paso 3: Generar Certificado
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Resumen de la generación:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Diseño seleccionado:</h5>
            <div className="bg-white rounded border p-3">
              <p className="font-medium">{selectedDiseno?.nombre}</p>
              {selectedDiseno?.fondoCertificado && (
                <img
                  src={`${ASSET_BASE}${selectedDiseno.fondoCertificado}`}
                  alt="Vista previa"
                  className="w-full h-16 object-cover rounded mt-2"
                />
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Estudiante seleccionado:</h5>
            <div className="bg-white rounded border p-3">
              <p className="font-medium">{selectedEstudiante?.nombre_completo}</p>
              <p className="text-sm text-gray-600">DNI: {selectedEstudiante?.dni}</p>
              <p className="text-sm text-gray-600">{selectedEstudiante?.nombre_evento}</p>
              <p className="text-xs text-gray-500">Código: {selectedEstudiante?.codigo_verificacion}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={generarCertificadoConDiseno}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Download size={18} />
          {loading ? 'Generando...' : 'Generar y Descargar Certificado'}
        </button>
      </div>
    </div>
  );

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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generar Certificado con Diseño</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Indicador de pasos */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Contenido del paso actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SelectorDisenosCertificados;

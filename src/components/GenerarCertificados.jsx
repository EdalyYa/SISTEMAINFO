import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Download,
  Eye,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const GenerarCertificados = ({ onClose }) => {
  const [disenosGuardados, setDisenosGuardados] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [disenoSeleccionado, setDisenoSeleccionado] = useState(null);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previsualizacion, setPrevisualizacion] = useState(false);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');

  useEffect(() => {
    cargarDisenosGuardados();
    cargarEstudiantes();
  }, []);

  const cargarDisenosGuardados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/admin/certificados/disenos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo los diseños activos
        const disenosActivos = data.filter(diseno => diseno.activa);
        setDisenosGuardados(disenosActivos);
      }
    } catch (error) {
      console.error('Error loading saved designs:', error);
    }
  };

  const cargarEstudiantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/admin/certificados', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Extraer estudiantes únicos
        const estudiantesUnicos = data.reduce((acc, cert) => {
          if (!acc.find(est => est.dni === cert.dni)) {
            acc.push({
              dni: cert.dni,
              nombre_completo: cert.nombre_completo,
              nombre_evento: cert.nombre_evento,
              fecha_inicio: cert.fecha_inicio,
              fecha_fin: cert.fecha_fin
            });
          }
          return acc;
        }, []);
        setEstudiantes(estudiantesUnicos);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const generarCertificado = async () => {
    if (!disenoSeleccionado || !estudianteSeleccionado) {
      alert('Debe seleccionar un diseño y un estudiante');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Crear el certificado en la base de datos
      const certificadoData = {
        dni: estudianteSeleccionado.dni,
        nombre_completo: estudianteSeleccionado.nombre_completo,
        nombre_evento: estudianteSeleccionado.nombre_evento,
        fecha_inicio: estudianteSeleccionado.fecha_inicio,
        fecha_fin: estudianteSeleccionado.fecha_fin,
        diseno_id: disenoSeleccionado.id,
        activo: 1
      };

      const response = await fetch('http://localhost:4001/admin/certificados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(certificadoData)
      });

      if (response.ok) {
        alert('Certificado generado exitosamente');
        // Limpiar selecciones
        setDisenoSeleccionado(null);
        setEstudianteSeleccionado(null);
        setPrevisualizacion(false);
      } else {
        alert('Error al generar el certificado');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error al generar el certificado');
    } finally {
      setLoading(false);
    }
  };

  const estudiantesFiltrados = estudiantes.filter(estudiante =>
    estudiante.nombre_completo.toLowerCase().includes(busquedaEstudiante.toLowerCase()) ||
    estudiante.dni.includes(busquedaEstudiante)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="text-purple-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Generar Certificados</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo - Selección */}
          <div className="w-1/3 p-6 border-r overflow-y-auto">
            {/* Selección de Diseño */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Seleccionar Diseño Guardado
              </h3>
              <div className="space-y-3">
                {disenosGuardados.length > 0 ? (
                  disenosGuardados.map((diseno) => (
                    <div
                      key={diseno.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        disenoSeleccionado?.id === diseno.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setDisenoSeleccionado(diseno)}
                    >
                      <h4 className="font-medium text-gray-800">{diseno.nombre}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-300 rounded border" title="Fondo"></div>
                          <div className="w-3 h-3 bg-blue-300 rounded border" title="Logos"></div>
                          <div className="w-3 h-3 bg-green-300 rounded border" title="Texto"></div>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Activo
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Creado: {new Date(diseno.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay diseños activos</p>
                    <p className="text-xs">Crea y activa un diseño en "Diseño de Certificados"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selección de Estudiante */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Seleccionar Estudiante
              </h3>
              
              {/* Búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={busquedaEstudiante}
                  onChange={(e) => setBusquedaEstudiante(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {estudiantesFiltrados.map((estudiante) => (
                  <div
                    key={estudiante.dni}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      estudianteSeleccionado?.dni === estudiante.dni
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setEstudianteSeleccionado(estudiante)}
                  >
                    <h4 className="font-medium text-gray-800">{estudiante.nombre_completo}</h4>
                    <p className="text-sm text-gray-500">DNI: {estudiante.dni}</p>
                    <p className="text-sm text-gray-500">{estudiante.nombre_evento}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho - Vista previa y acciones */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Botones de acción */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setPrevisualizacion(!previsualizacion)}
                disabled={!disenoSeleccionado || !estudianteSeleccionado}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Eye size={16} />
                {previsualizacion ? 'Ocultar Vista Previa' : 'Vista Previa'}
              </button>
              
              <button
                onClick={generarCertificado}
                disabled={!disenoSeleccionado || !estudianteSeleccionado || loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={16} />
                {loading ? 'Generando...' : 'Generar Certificado'}
              </button>
            </div>

            {/* Vista previa */}
            {previsualizacion && disenoSeleccionado && estudianteSeleccionado && (
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 text-center">Vista Previa del Certificado</h3>
                  <p className="text-gray-600 text-center">
                    Diseño: {disenoSeleccionado.nombre} | Estudiante: {estudianteSeleccionado.nombre_completo}
                  </p>
                </div>
                
                <div 
                  className="relative bg-white border shadow-2xl"
                  style={{ width: '800px', height: '600px' }}
                >
                  {/* Fondo del certificado */}
                  {disenoSeleccionado.fondoCertificado && (
                    <img
                      src={`http://localhost:4001${disenoSeleccionado.fondoCertificado}`}
                      alt="Fondo"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  
                  {/* Elementos del certificado con datos reales */}
                  {disenoSeleccionado.configuracion && (
                    <>
                      {/* Logo izquierdo */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          left: disenoSeleccionado.configuracion.logoIzquierdo.x,
                          top: disenoSeleccionado.configuracion.logoIzquierdo.y,
                          width: disenoSeleccionado.configuracion.logoIzquierdo.width,
                          height: disenoSeleccionado.configuracion.logoIzquierdo.height,
                          zIndex: 1
                        }}
                      >
                        {disenoSeleccionado.logoIzquierdo ? (
                          <img
                            src={disenoSeleccionado.logoIzquierdo.startsWith('/') ? disenoSeleccionado.logoIzquierdo : `/${disenoSeleccionado.logoIzquierdo}`}
                            alt="Logo izquierdo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            Logo Izq.
                          </div>
                        )}
                      </div>

                      {/* Logo derecho */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          left: disenoSeleccionado.configuracion.logoDerecho.x,
                          top: disenoSeleccionado.configuracion.logoDerecho.y,
                          width: disenoSeleccionado.configuracion.logoDerecho.width,
                          height: disenoSeleccionado.configuracion.logoDerecho.height,
                          zIndex: 1
                        }}
                      >
                        {disenoSeleccionado.logoDerecho ? (
                          <img
                            src={disenoSeleccionado.logoDerecho.startsWith('/') ? disenoSeleccionado.logoDerecho : `/${disenoSeleccionado.logoDerecho}`}
                            alt="Logo derecho"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            Logo Der.
                          </div>
                        )}
                      </div>

                      {/* Nombre del Instituto */}
                      <div
                        className="absolute font-semibold text-center"
                        style={{
                          left: disenoSeleccionado.configuracion.nombreInstituto.x,
                          top: disenoSeleccionado.configuracion.nombreInstituto.y,
                          fontSize: disenoSeleccionado.configuracion.nombreInstituto.fontSize,
                          color: disenoSeleccionado.configuracion.nombreInstituto.color,
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }}
                      >
                        INSTITUTO DE INFORMÁTICA UNA-PUNO
                      </div>

                      {/* Título */}
                      <div
                        className="absolute font-bold text-center"
                        style={{
                          left: disenoSeleccionado.configuracion.titulo.x,
                          top: disenoSeleccionado.configuracion.titulo.y,
                          fontSize: disenoSeleccionado.configuracion.titulo.fontSize,
                          color: disenoSeleccionado.configuracion.titulo.color,
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }}
                      >
                        CERTIFICADO
                      </div>

                      {/* Texto Otorgado */}
                      <div
                        className="absolute text-center"
                        style={{
                          left: disenoSeleccionado.configuracion.otorgado.x,
                          top: disenoSeleccionado.configuracion.otorgado.y,
                          fontSize: disenoSeleccionado.configuracion.otorgado.fontSize,
                          color: disenoSeleccionado.configuracion.otorgado.color,
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }}
                      >
                        Otorgado a:
                      </div>

                      {/* Nombre del estudiante - REAL */}
                      <div
                        className="absolute font-semibold text-center"
                        style={{
                          left: disenoSeleccionado.configuracion.nombreEstudiante.x,
                          top: disenoSeleccionado.configuracion.nombreEstudiante.y,
                          fontSize: disenoSeleccionado.configuracion.nombreEstudiante.fontSize,
                          color: disenoSeleccionado.configuracion.nombreEstudiante.color,
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }}
                      >
                        {estudianteSeleccionado.nombre_completo}
                      </div>

                      {/* Descripción */}
                      <div
                        className="absolute text-center max-w-lg"
                        style={{
                          left: disenoSeleccionado.configuracion.descripcion.x,
                          top: disenoSeleccionado.configuracion.descripcion.y,
                          fontSize: disenoSeleccionado.configuracion.descripcion.fontSize,
                          color: disenoSeleccionado.configuracion.descripcion.color,
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }}
                      >
                        Por haber participado en "{estudianteSeleccionado.nombre_evento}" realizado del {new Date(estudianteSeleccionado.fecha_inicio).toLocaleDateString('es-ES')} al {new Date(estudianteSeleccionado.fecha_fin).toLocaleDateString('es-ES')}.
                      </div>

                      {/* Fecha */}
                      <div
                        className="absolute text-center"
                        style={{
                          left: disenoSeleccionado.configuracion.fecha.x,
                          top: disenoSeleccionado.configuracion.fecha.y,
                          fontSize: disenoSeleccionado.configuracion.fecha.fontSize,
                          color: disenoSeleccionado.configuracion.fecha.color,
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }}
                      >
                        Puno, {new Date().toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay selecciones */}
            {(!disenoSeleccionado || !estudianteSeleccionado) && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    {!disenoSeleccionado && !estudianteSeleccionado
                      ? 'Selecciona un diseño y un estudiante para comenzar'
                      : !disenoSeleccionado
                      ? 'Selecciona un diseño'
                      : 'Selecciona un estudiante'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GenerarCertificados;

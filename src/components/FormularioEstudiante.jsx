import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Calendar, 
  BookOpen,
  ArrowRight,
  X,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';

const FormularioEstudiante = ({ onClose, onContinuar }) => {
  const [datosEstudiante, setDatosEstudiante] = useState({
    dni: '',
    nombre_completo: '',
    nombre_evento: '',
    fecha_inicio: '',
    fecha_fin: '',
    horas_academicas: '',
    modalidad: 'Presencial',
    observaciones: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datosEstudiante.dni.trim()) {
      nuevosErrores.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(datosEstudiante.dni)) {
      nuevosErrores.dni = 'El DNI debe tener 8 dígitos';
    }

    if (!datosEstudiante.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = 'El nombre completo es obligatorio';
    }

    if (!datosEstudiante.nombre_evento.trim()) {
      nuevosErrores.nombre_evento = 'El nombre del evento/curso es obligatorio';
    }

    if (!datosEstudiante.fecha_inicio) {
      nuevosErrores.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    if (!datosEstudiante.fecha_fin) {
      nuevosErrores.fecha_fin = 'La fecha de fin es obligatoria';
    }

    if (datosEstudiante.fecha_inicio && datosEstudiante.fecha_fin) {
      if (new Date(datosEstudiante.fecha_inicio) > new Date(datosEstudiante.fecha_fin)) {
        nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!datosEstudiante.horas_academicas.trim()) {
      nuevosErrores.horas_academicas = 'Las horas académicas son obligatorias';
    } else if (isNaN(datosEstudiante.horas_academicas) || parseInt(datosEstudiante.horas_academicas) <= 0) {
      nuevosErrores.horas_academicas = 'Las horas académicas deben ser un número positivo';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (campo, valor) => {
    setDatosEstudiante(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[campo]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };

  const handleContinuar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simular una pequeña pausa para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Pasar los datos al componente padre para continuar al diseñador
      onContinuar(datosEstudiante);
    } catch (error) {
      console.error('Error al procesar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <User className="text-white" size={24} />
            <div>
              <h2 className="text-2xl font-bold">Crear Nuevo Certificado</h2>
              <p className="text-purple-100">Paso 1: Información del Estudiante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                DNI del Estudiante *
              </label>
              <input
                type="text"
                value={datosEstudiante.dni}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                placeholder="Ej: 12345678"
                maxLength={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errores.dni ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.dni && (
                <p className="text-red-500 text-sm mt-1">{errores.dni}</p>
              )}
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={datosEstudiante.nombre_completo}
                onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                placeholder="Ej: Juan Carlos Pérez López"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errores.nombre_completo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.nombre_completo && (
                <p className="text-red-500 text-sm mt-1">{errores.nombre_completo}</p>
              )}
            </div>

            {/* Nombre del Evento/Curso */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="inline mr-2" />
                Nombre del Evento/Curso *
              </label>
              <input
                type="text"
                value={datosEstudiante.nombre_evento}
                onChange={(e) => handleInputChange('nombre_evento', e.target.value)}
                placeholder="Ej: Curso de Programación Web con React"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errores.nombre_evento ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.nombre_evento && (
                <p className="text-red-500 text-sm mt-1">{errores.nombre_evento}</p>
              )}
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={datosEstudiante.fecha_inicio}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errores.fecha_inicio ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.fecha_inicio && (
                <p className="text-red-500 text-sm mt-1">{errores.fecha_inicio}</p>
              )}
            </div>

            {/* Fecha de Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Fecha de Fin *
              </label>
              <input
                type="date"
                value={datosEstudiante.fecha_fin}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errores.fecha_fin ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.fecha_fin && (
                <p className="text-red-500 text-sm mt-1">{errores.fecha_fin}</p>
              )}
            </div>

            {/* Horas Académicas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Horas Académicas *
              </label>
              <input
                type="number"
                value={datosEstudiante.horas_academicas}
                onChange={(e) => handleInputChange('horas_academicas', e.target.value)}
                placeholder="Ej: 40"
                min="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errores.horas_academicas ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.horas_academicas && (
                <p className="text-red-500 text-sm mt-1">{errores.horas_academicas}</p>
              )}
            </div>

            {/* Modalidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="inline mr-2" />
                Modalidad
              </label>
              <select
                value={datosEstudiante.modalidad}
                onChange={(e) => handleInputChange('modalidad', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Semipresencial">Semipresencial</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Observaciones (Opcional)
              </label>
              <textarea
                value={datosEstudiante.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Información adicional sobre el certificado..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleContinuar}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Procesando...
                </>
              ) : (
                <>
                  Continuar al Diseño
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FormularioEstudiante;
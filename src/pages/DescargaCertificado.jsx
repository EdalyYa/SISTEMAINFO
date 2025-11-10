import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import { 
  Download, 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Award,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecommendationsModal from '../components/RecommendationsModal';

const DescargaCertificado = () => {
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [certificado, setCertificado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);
  const [showRecModal, setShowRecModal] = useState(true);

  const HORARIO_LABEL = 'Lun–Vie 09:00–15:00';
  const estaDentroHorario = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Domingo, 1=Lunes, ... 6=Sábado
    const hour = now.getHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 15;
  };
  const fueraHorario = !estaDentroHorario();

  const handleCloseModal = () => {
    setShowRecModal(false);
  };

  const buscarCertificado = async () => {
    if (!estaDentroHorario()) {
      setError(`Sistema disponible en horario de atención: ${HORARIO_LABEL}`);
      return;
    }
    if (!codigoVerificacion.trim()) {
      setError('Por favor ingrese un código de verificación');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCertificado(null);

      const response = await fetch(`${API_BASE}/certificados-publicos/verificar/${codigoVerificacion}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Certificado no encontrado. Verifique el código ingresado.');
        } else {
          setError('Error al buscar el certificado. Por favor intente nuevamente.');
        }
        return;
      }
      
      const data = await response.json();

      // Mapear campos del backend público al modelo usado en la vista
      const certificadoEncontrado = {
        id: data.id,
        codigo_verificacion: data.codigo_verificacion,
        nombre_completo: data.nombre,
        dni: data.dni,
        nombre_evento: data.evento,
        tipo_certificado: data.tipo,
        horas_academicas: data.horas || null,
        fecha_emision: data.fecha_emision,
        descripcion_evento: data.descripcion_evento || null
      };

      setCertificado(certificadoEncontrado);
    } catch (error) {
      console.error('Error buscando certificado:', error);
      setError('Error de conexión. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const descargarCertificado = async () => {
    if (!certificado) return;

    try {
      if (!estaDentroHorario()) {
        setError(`Descarga no disponible fuera de horario (${HORARIO_LABEL})`);
        return;
      }
      setDescargando(true);
      
      // Agregar timestamp para evitar cache del navegador
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE}/certificados-publicos/descargar/${certificado.codigo_verificacion}?download=1&v=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `certificado-${(certificado.nombre_completo || 'estudiante').replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Error al descargar el certificado');
      }
    } catch (error) {
      console.error('Error descargando certificado:', error);
      setError('Error de conexión al descargar');
    } finally {
      setDescargando(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarCertificado();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-2">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={28} />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Descarga de Certificados</h1>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px]">Servicio en línea</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${fueraHorario ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {fueraHorario ? 'Fuera de horario' : 'En horario'}
              </span>
            </div>
            <span className="ml-auto text-[12px] text-gray-600">Instituto de Informática UNA-PUNO</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Banner notorio de estado del servicio */}
        <div className={`mb-3 rounded-lg border-l-4 p-3 flex items-start gap-3 ${
          fueraHorario 
            ? 'bg-red-50 border-red-500 text-red-800' 
            : 'bg-green-50 border-green-600 text-green-800'
        }`}>
          <Shield className={fueraHorario ? 'text-red-600' : 'text-green-600'} size={20} />
          <div>
            <p className="font-semibold text-base">
              {fueraHorario
                ? 'Servicio de certificados fuera de horario'
                : 'Servicio de certificados activo'}
            </p>
            <p className="text-sm">
              {fueraHorario
                ? `No es posible validar ni descargar fuera del horario. Horario: ${HORARIO_LABEL}.`
                : `Puedes validar y descargar certificados dentro del horario: ${HORARIO_LABEL}.`}
            </p>
          </div>
        </div>
        {/* Formulario de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-3"
        >
          <div className="text-center mb-4">
            <Shield className="mx-auto text-blue-600 mb-2" size={36} />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Verificar y Descargar Certificado</h2>
            <p className="text-gray-600 text-sm">
              Ingrese su código de verificación para buscar y descargar su certificado
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificación
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={codigoVerificacion}
                  onChange={(e) => setCodigoVerificacion(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: CERT-1234567890-ABC"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-sm"
                  disabled={loading || fueraHorario}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={buscarCertificado}
                  disabled={loading || fueraHorario}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <Search size={18} />
                  {loading ? 'Buscando...' : 'Buscar'}
                </motion.button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 text-red-700 text-sm"
              >
                <AlertCircle size={20} />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
        {/* Accesos rápidos y tips compactos */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <a href="/tramites" className="px-3 py-1.5 text-xs bg-white rounded-full border border-gray-200 hover:bg-gray-50">Trámites</a>
          <a href="/horarios" className="px-3 py-1.5 text-xs bg-white rounded-full border border-gray-200 hover:bg-gray-50">Horarios</a>
          <a href="/matricula" className="px-3 py-1.5 text-xs bg-white rounded-full border border-gray-200 hover:bg-gray-50">Matricúlate</a>
          <a href="/reclamaciones" className="px-3 py-1.5 text-xs bg-white rounded-full border border-gray-200 hover:bg-gray-50">Ayuda y Reclamos</a>
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white/70 rounded-lg p-2 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Formato del código</h3>
            <p className="text-[11px] leading-snug text-gray-600">Ej: <span className="font-mono">CERT-1234567890-ABC</span></p>
          </div>
          <div className="bg-white/70 rounded-lg p-2 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Mayúsculas y sin tildes</h3>
            <p className="text-[11px] leading-snug text-gray-600">Escribe tal cual aparece en tu certificado.</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Privacidad</h3>
            <p className="text-[11px] leading-snug text-gray-600">Usamos tus datos solo para validar y descargar.</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Soporte</h3>
            <p className="text-[11px] leading-snug text-gray-600">¿Dudas? Escríbenos por WhatsApp o visita Trámites.</p>
          </div>
        </div>

        {/* Información del certificado */}
        {certificado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-4 mt-3"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <h3 className="text-base font-bold text-gray-900">Certificado Encontrado</h3>
                <p className="text-gray-600 text-sm">Información verificada correctamente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                    <p className="text-base font-semibold text-gray-900">{certificado.nombre_completo}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Evento</p>
                    <p className="text-base font-semibold text-gray-900">{certificado.nombre_evento}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Certificado</p>
                    <p className="text-lg font-semibold text-gray-900">{certificado.tipo_certificado}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Emisión</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(certificado.fecha_emision)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Código de Verificación</p>
                    <p className="text-base font-mono font-semibold text-gray-900">{certificado.codigo_verificacion}</p>
                  </div>
                </div>

                {certificado.horas_academicas && (
                  <div className="flex items-start gap-3">
                    <FileText className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Horas Académicas</p>
                      <p className="text-base font-semibold text-gray-900">{certificado.horas_academicas} horas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Descripción del evento (colapsable) */}
            {certificado.descripcion_evento && (
              <details className="mb-3">
                <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900">Descripción del Evento</summary>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm mt-2">{certificado.descripcion_evento}</p>
              </details>
            )}

            {/* Botón de descarga */}
            <div className="flex items-center justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={descargarCertificado}
                disabled={descargando || fueraHorario}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                {descargando ? 'Descargando...' : 'Descargar PDF'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Modal de recomendaciones */}
        <RecommendationsModal
          isOpen={showRecModal}
          onClose={handleCloseModal}
          horarioLabel={HORARIO_LABEL}
        />
      </div>
    </div>
  );
};

export default DescargaCertificado;

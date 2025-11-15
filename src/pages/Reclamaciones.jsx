import React, { useState, useEffect } from 'react';
import { FaMicrochip } from 'react-icons/fa';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Send, 
  Upload,
  Eye,
  Download,
  MessageSquare
} from 'lucide-react';

function Reclamaciones() {
  const [vistaActual, setVistaActual] = useState('menu'); // menu, nueva, seguimiento, consultar
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Estado para nueva reclamación
  const [nuevaReclamacion, setNuevaReclamacion] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    tipoReclamacion: '',
    programa: '',
    descripcion: '',
    evidencias: []
  });
  
  // Estado para seguimiento
  const [codigoSeguimiento, setCodigoSeguimiento] = useState('');
  const [reclamacionEncontrada, setReclamacionEncontrada] = useState(null);
  
  // Estado para consultar reclamaciones
  const [filtroConsulta, setFiltroConsulta] = useState({
    documento: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  });
  const [reclamacionesConsulta, setReclamacionesConsulta] = useState([]);
  
  const [errores, setErrores] = useState({});
  
  // Opciones para los selects
  const tiposReclamacion = [
    'Calidad del servicio educativo',
    'Problemas con certificados',
    'Inconvenientes con matrícula',
    'Problemas con docentes',
    'Infraestructura y equipamiento',
    'Atención al cliente',
    'Facturación y pagos',
    'Otros'
  ];
  
  const programasDisponibles = [
    'Administración de Empresas',
    'Contabilidad',
    'Marketing Digital',
    'Recursos Humanos',
    'Logística',
    'Computación e Informática',
    'Diseño Gráfico',
    'Otros'
  ];
  
  // Funciones de validación
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!nuevaReclamacion.numeroDocumento || nuevaReclamacion.numeroDocumento.length < 8) {
      nuevosErrores.numeroDocumento = 'Número de documento inválido';
    }
    
    if (!nuevaReclamacion.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios';
    }
    
    if (!nuevaReclamacion.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nuevaReclamacion.email || !emailRegex.test(nuevaReclamacion.email)) {
      nuevosErrores.email = 'Email inválido';
    }
    
    if (!nuevaReclamacion.telefono || nuevaReclamacion.telefono.length < 9) {
      nuevosErrores.telefono = 'Teléfono inválido';
    }
    
    if (!nuevaReclamacion.tipoReclamacion) {
      nuevosErrores.tipoReclamacion = 'Seleccione el tipo de reclamación';
    }
    
    if (!nuevaReclamacion.descripcion.trim() || nuevaReclamacion.descripcion.length < 20) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (campo, valor) => {
    setNuevaReclamacion(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };
  
  // Enviar nueva reclamación
  const enviarReclamacion = async () => {
    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor, corrija los errores en el formulario' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular envío a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const codigoGenerado = 'REC-' + Date.now().toString().slice(-8);
      
      setMensaje({ 
        tipo: 'success', 
        texto: `Reclamación enviada exitosamente. Código de seguimiento: ${codigoGenerado}` 
      });
      
      // Limpiar formulario
      setNuevaReclamacion({
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        tipoReclamacion: '',
        programa: '',
        descripcion: '',
        evidencias: []
      });
      
      setTimeout(() => {
        setVistaActual('menu');
        setMensaje({ tipo: '', texto: '' });
      }, 3000);
      
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al enviar la reclamación. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar reclamación por código
  const buscarReclamacion = async () => {
    if (!codigoSeguimiento.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un código de seguimiento válido' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular búsqueda en API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos simulados
      const reclamacionSimulada = {
        codigo: codigoSeguimiento,
        fecha: '2024-01-15',
        tipo: 'Calidad del servicio educativo',
        programa: 'Administración de Empresas',
        estado: 'En proceso',
        descripcion: 'Problema con la calidad de las clases virtuales...',
        respuesta: 'Hemos recibido su reclamación y estamos evaluando el caso. Le responderemos en un plazo máximo de 5 días hábiles.',
        fechaRespuesta: '2024-01-17',
        responsable: 'Área de Calidad Académica'
      };
      
      setReclamacionEncontrada(reclamacionSimulada);
      setMensaje({ tipo: '', texto: '' });
      
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'No se encontró la reclamación con ese código' });
      setReclamacionEncontrada(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Consultar reclamaciones por documento
  const consultarReclamaciones = async () => {
    if (!filtroConsulta.documento.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un número de documento' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular consulta en API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos simulados
      const reclamacionesSimuladas = [
        {
          id: 1,
          codigo: 'REC-20240115',
          fecha: '2024-01-15',
          tipo: 'Calidad del servicio educativo',
          estado: 'Resuelto',
          programa: 'Administración de Empresas'
        },
        {
          id: 2,
          codigo: 'REC-20240120',
          fecha: '2024-01-20',
          tipo: 'Problemas con certificados',
          estado: 'En proceso',
          programa: 'Marketing Digital'
        }
      ];
      
      setReclamacionesConsulta(reclamacionesSimuladas);
      setMensaje({ tipo: '', texto: '' });
      
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al consultar las reclamaciones' });
      setReclamacionesConsulta([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Resuelto':
        return 'bg-green-100 text-green-800';
      case 'En proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-white to-blue-50 border border-blue-100 p-5 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-1 justify-center">
              <FaMicrochip className="text-blue-700" />
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Sistema de Reclamaciones</h1>
            </div>
            <p className="text-gray-700 text-sm md:text-base font-mono">Gestiona tus reclamaciones de forma rápida y eficiente</p>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.tipo === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            mensaje.tipo === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <p className="font-medium">{mensaje.texto}</p>
          </div>
        )}

        {vistaActual === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition duration-300">
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Nueva Reclamación</h3>
                <p className="text-gray-600 mb-6">Presenta una nueva reclamación sobre nuestros servicios educativos</p>
                <button
                  onClick={() => setVistaActual('nueva')}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 w-full"
                >
                  Crear Reclamación
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition duration-300">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Seguimiento</h3>
                <p className="text-gray-600 mb-6">Consulta el estado de tu reclamación usando el código de seguimiento</p>
                <button
                  onClick={() => setVistaActual('seguimiento')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 w-full"
                >
                  Hacer Seguimiento
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition duration-300">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Consultar Historial</h3>
                <p className="text-gray-600 mb-6">Ve todas tus reclamaciones anteriores y su estado actual</p>
                <button
                  onClick={() => setVistaActual('consultar')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 w-full"
                >
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'nueva' && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Nueva Reclamación</h2>
              </div>
              <button
                onClick={() => setVistaActual('menu')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Volver al Menú
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos Personales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento</label>
                    <select
                      value={nuevaReclamacion.tipoDocumento}
                      onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Documento *</label>
                    <input
                      type="text"
                      maxLength={nuevaReclamacion.tipoDocumento === 'DNI' ? '8' : '12'}
                      placeholder={nuevaReclamacion.tipoDocumento === 'DNI' ? '12345678' : 'Número de documento'}
                      value={nuevaReclamacion.numeroDocumento}
                      onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errores.numeroDocumento ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errores.numeroDocumento && <p className="text-red-500 text-sm mt-1">{errores.numeroDocumento}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombres *
                  </label>
                  <input
                    type="text"
                    placeholder="Juan Carlos"
                    value={nuevaReclamacion.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errores.nombres ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errores.nombres && <p className="text-red-500 text-sm mt-1">{errores.nombres}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos *</label>
                  <input
                    type="text"
                    placeholder="Pérez García"
                    value={nuevaReclamacion.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errores.apellidos ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errores.apellidos && <p className="text-red-500 text-sm mt-1">{errores.apellidos}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={nuevaReclamacion.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errores.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errores.email && <p className="text-red-500 text-sm mt-1">{errores.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    placeholder="987654321"
                    value={nuevaReclamacion.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errores.telefono ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errores.telefono && <p className="text-red-500 text-sm mt-1">{errores.telefono}</p>}
                </div>
              </div>

              {/* Datos de la Reclamación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos de la Reclamación</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Reclamación *</label>
                  <select
                    value={nuevaReclamacion.tipoReclamacion}
                    onChange={(e) => handleInputChange('tipoReclamacion', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errores.tipoReclamacion ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione el tipo de reclamación</option>
                    {tiposReclamacion.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errores.tipoReclamacion && <p className="text-red-500 text-sm mt-1">{errores.tipoReclamacion}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Programa Relacionado</label>
                  <select
                    value={nuevaReclamacion.programa}
                    onChange={(e) => handleInputChange('programa', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleccione el programa (opcional)</option>
                    {programasDisponibles.map((programa) => (
                      <option key={programa} value={programa}>{programa}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Descripción Detallada *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe detalladamente tu reclamación. Incluye fechas, nombres, situaciones específicas y cualquier información relevante..."
                    value={nuevaReclamacion.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                      errores.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errores.descripcion && <p className="text-red-500 text-sm">{errores.descripcion}</p>}
                    <p className="text-gray-500 text-sm ml-auto">{nuevaReclamacion.descripcion.length}/500 caracteres</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Upload className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Evidencias (Opcional)</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Puedes adjuntar documentos, capturas de pantalla o cualquier evidencia que respalde tu reclamación.
                        Formatos permitidos: PDF, JPG, PNG (máx. 5MB cada uno)
                      </p>
                      <button className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition duration-200">
                        Seleccionar Archivos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={enviarReclamacion}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Reclamación
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {vistaActual === 'seguimiento' && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Search className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Seguimiento de Reclamación</h2>
              </div>
              <button
                onClick={() => {
                  setVistaActual('menu');
                  setReclamacionEncontrada(null);
                  setCodigoSeguimiento('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Volver al Menú
              </button>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Seguimiento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="REC-12345678"
                  value={codigoSeguimiento}
                  onChange={(e) => setCodigoSeguimiento(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={buscarReclamacion}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {reclamacionEncontrada && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la Reclamación</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">Código:</span>
                        <span className="ml-2 text-gray-800">{reclamacionEncontrada.codigo}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fecha:</span>
                        <span className="ml-2 text-gray-800">{reclamacionEncontrada.fecha}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <span className="ml-2 text-gray-800">{reclamacionEncontrada.tipo}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Programa:</span>
                        <span className="ml-2 text-gray-800">{reclamacionEncontrada.programa}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Estado:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reclamacionEncontrada.estado)}`}>
                          {reclamacionEncontrada.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Respuesta Institucional</h3>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 mb-3">{reclamacionEncontrada.respuesta}</p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Fecha de respuesta:</strong> {reclamacionEncontrada.fechaRespuesta}</p>
                        <p><strong>Responsable:</strong> {reclamacionEncontrada.responsable}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Descripción Original</h4>
                  <p className="text-gray-700 bg-white rounded-lg p-4 border border-gray-200">
                    {reclamacionEncontrada.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {vistaActual === 'consultar' && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Historial de Reclamaciones</h2>
              </div>
              <button
                onClick={() => {
                  setVistaActual('menu');
                  setReclamacionesConsulta([]);
                  setFiltroConsulta({ documento: '', fechaInicio: '', fechaFin: '', estado: '' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Volver al Menú
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Documento *</label>
                <input
                  type="text"
                  placeholder="12345678"
                  value={filtroConsulta.documento}
                  onChange={(e) => setFiltroConsulta(prev => ({ ...prev, documento: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={filtroConsulta.fechaInicio}
                  onChange={(e) => setFiltroConsulta(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={filtroConsulta.fechaFin}
                  onChange={(e) => setFiltroConsulta(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <select
                  value={filtroConsulta.estado}
                  onChange={(e) => setFiltroConsulta(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Resuelto">Resuelto</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={consultarReclamaciones}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Consultar Reclamaciones
                  </>
                )}
              </button>
            </div>

            {reclamacionesConsulta.length > 0 && (
              <div className="space-y-4">
                {reclamacionesConsulta.map((reclamacion) => (
                  <div key={reclamacion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{reclamacion.codigo}</h4>
                        <p className="text-sm text-gray-600">{reclamacion.fecha}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>Tipo:</strong></p>
                        <p className="text-gray-800">{reclamacion.tipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>Programa:</strong></p>
                        <p className="text-gray-800">{reclamacion.programa}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(reclamacion.estado)}`}>
                          {reclamacion.estado}
                        </span>
                        <button
                          onClick={() => {
                            setCodigoSeguimiento(reclamacion.codigo);
                            setVistaActual('seguimiento');
                            buscarReclamacion();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reclamaciones;

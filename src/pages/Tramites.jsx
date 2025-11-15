import React, { useState, useEffect } from 'react';
import { FileText, GraduationCap, Award, BookOpen, History, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui';
import api, { API_BASE } from '../config/api';

const tramites = [
  {
    id: 1,
    nombre: 'Solicitud de Certificado',
    descripcion: 'Solicita tu certificado digital o físico de manera rápida y sencilla.',
    requisitos: ['DNI escaneado', 'Pago por derecho de trámite', 'Formulario de solicitud'],
    link: '#',
  },
  {
    id: 2,
    nombre: 'Constancia de Estudios',
    descripcion: 'Obtén tu constancia de estudios para trámites académicos o laborales.',
    requisitos: ['DNI escaneado', 'Formulario de solicitud'],
    link: '#',
  },
  {
    id: 3,
    nombre: 'Duplicado de Carnet',
    descripcion: 'Solicita un duplicado de tu carnet de estudiante en caso de pérdida.',
    requisitos: ['DNI escaneado', 'Pago por derecho de trámite'],
    link: '#',
  },
];

const tiposDocumentos = [
  {
    id: 1,
    nombre: 'Constancia de Estudios',
    descripcion: 'Documento que certifica tu condición de estudiante actual',
    icono: FileText,
    costo: 'S/. 15.00',
    tiempoEntrega: '3 días hábiles'
  },
  {
    id: 2,
    nombre: 'Certificado de Estudios',
    descripcion: 'Certificado oficial de estudios realizados',
    icono: Award,
    costo: 'S/. 25.00',
    tiempoEntrega: '5 días hábiles'
  },
  {
    id: 3,
    nombre: 'Trámite de Diploma',
    descripcion: 'Solicitud para obtención de diploma oficial',
    icono: GraduationCap,
    costo: 'S/. 150.00',
    tiempoEntrega: '15 días hábiles'
  },
  {
    id: 4,
    nombre: 'Transcripción de Acta',
    descripcion: 'Copia oficial de actas de notas',
    icono: BookOpen,
    costo: 'S/. 20.00',
    tiempoEntrega: '4 días hábiles'
  },
  {
    id: 5,
    nombre: 'Historial Académico',
    descripcion: 'Registro completo de tu trayectoria académica',
    icono: History,
    costo: 'S/. 30.00',
    tiempoEntrega: '7 días hábiles'
  }
];

function Tramites() {
  const [busqueda, setBusqueda] = useState('');
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('general'); // 'general' o 'documentos'
  const [pasoActual, setPasoActual] = useState(1);
  const [curriculaSeleccionada, setCurriculaSeleccionada] = useState('');
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [formularioData, setFormularioData] = useState({});
  const [errores, setErrores] = useState({});
  const [formularios, setFormularios] = useState([]);
  const [loadingFormularios, setLoadingFormularios] = useState(false);

  const tramitesFiltrados = tramites.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formularioData.nombres) nuevosErrores.nombres = 'Nombres es requerido';
    if (!formularioData.apellidos) nuevosErrores.apellidos = 'Apellidos es requerido';
    if (!formularioData.dni) nuevosErrores.dni = 'DNI es requerido';
    if (!formularioData.telefono) nuevosErrores.telefono = 'Teléfono es requerido';
    if (!formularioData.email) nuevosErrores.email = 'Email es requerido';
    if (!formularioData.programa) nuevosErrores.programa = 'Programa de estudios es requerido';
    
    if (documentoSeleccionado?.id === 3) { // Diploma
      if (!formularioData.fechaEgreso) nuevosErrores.fechaEgreso = 'Fecha de egreso es requerida';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (campo, valor) => {
    setFormularioData(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const resetearFormulario = () => {
    setPasoActual(1);
    setCurriculaSeleccionada('');
    setDocumentoSeleccionado(null);
    setFormularioData({});
    setErrores({});
  };

  useEffect(() => {
    const fetchFormularios = async () => {
      setLoadingFormularios(true);
      try {
        const res = await api.get('/documentos');
        setFormularios(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Error cargando formularios:', e);
        setFormularios([]);
      } finally {
        setLoadingFormularios(false);
      }
    };
    fetchFormularios();
  }, []);

  const normalizar = (s = '') => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slugify = (s = '') => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const getFormularioParaTramite = (tramite) => {
    if (!tramite) return null;
    const name = normalizar(tramite.nombre);
    const slug = slugify(tramite.nombre).replace(/de-/,'').replace(/-/g,'-');
    const posibles = formularios.filter(d => {
      const t = normalizar(d.titulo || '');
      const tags = Array.isArray(d.etiquetas) ? d.etiquetas.map(normalizar) : [];
      const hasExact = Array.isArray(d.etiquetas) && d.etiquetas.some(x => String(x || '').toLowerCase() === `tramite:${slug}`);
      if (hasExact) return true;
      if (t.includes(name) || name.includes(t)) return true;
      if (name.includes('certificado') && (t.includes('certificado') || tags.includes('certificado'))) return true;
      if (name.includes('constancia') && (t.includes('constancia') || tags.includes('constancia'))) return true;
      if (name.includes('duplicado') && (t.includes('duplicado') || tags.includes('duplicado'))) return true;
      return false;
    });
    return posibles[0] || null;
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border border-slate-800 p-6 mb-6 shadow-xl ring-1 ring-blue-300/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
        <div className="flex items-center gap-3 text-white justify-center">
          <FileText className="text-emerald-400" />
          <h1 className="text-2xl md:text-3xl font-bold">Trámites y Solicitudes</h1>
        </div>
        <p className="text-slate-200 mt-2 text-center text-sm">Gestiona trámites académicos y solicita documentos oficiales del Instituto de Informática INFOUNA.</p>
        <div className="mt-3 flex justify-center gap-2">
          <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/90 text-white font-mono tracking-wider">INFO-ADMIN</span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="rounded-xl p-1 flex bg-blue-50 ring-1 ring-blue-200">
          <button
            onClick={() => { setSeccionActiva('general'); resetearFormulario(); }}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              seccionActiva === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-700 hover:bg-white'
            }`}
          >
            Trámites Generales
          </button>
          <button
            onClick={() => { setSeccionActiva('documentos'); resetearFormulario(); }}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              seccionActiva === 'documentos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-700 hover:bg-white'
            }`}
          >
            Documentos Académicos
          </button>
        </div>
      </div>

      {seccionActiva === 'general' && (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-3 justify-center items-center">
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar trámite..."
              className="border border-blue-200 rounded-xl px-4 py-2 text-blue-900 font-semibold w-full md:w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {tramitesFiltrados.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-12">No se encontraron trámites.</div>
            ) : (
              tramitesFiltrados.map(tramite => (
                <div key={tramite.id} className="rounded-xl ring-1 ring-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-4 flex flex-col shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="text-blue-700 w-4 h-4" />
                    <h3 className="font-semibold text-base text-blue-900">{tramite.nombre}</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{tramite.descripcion}</p>
                  <Button
                    className="mt-auto"
                    variant="primary"
                    size="sm"
                    onClick={() => setTramiteSeleccionado(tramite)}
                  >
                    Ver requisitos
                  </Button>
                </div>
              ))
            )}
          </div>
          {/* Modal de requisitos */}
          {tramiteSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl"
                  onClick={() => setTramiteSeleccionado(null)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold text-blue-900 mb-2">{tramiteSeleccionado.nombre}</h2>
                <p className="mb-3 text-gray-700 text-sm">{tramiteSeleccionado.descripcion}</p>
                <h4 className="font-semibold mb-2">Requisitos:</h4>
                <ul className="list-disc list-inside mb-4">
                  {tramiteSeleccionado.requisitos.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                {(() => {
                  const doc = getFormularioParaTramite(tramiteSeleccionado);
                  if (loadingFormularios) {
                    return <div className="text-gray-500 text-sm">Cargando formularios...</div>;
                  }
                  if (doc) {
                    return (
                      <div className="mt-3">
                        <div className="rounded-lg border border-gray-200 overflow-hidden mb-3" style={{ height: 360 }}>
                          <iframe title={`Vista previa: ${doc.titulo}`} src={`${API_BASE}/documentos/${doc.id}/preview`} className="w-full h-full" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">Tipo: {doc.mime} • Tamaño: {(doc.tamano/1024).toFixed(1)} KB</div>
                          <div className="flex gap-2">
                            <a href={`${API_BASE}/documentos/${doc.id}/preview`} target="_blank" rel="noreferrer" className="inline-block bg-gray-100 text-blue-700 px-3 py-1.5 rounded border border-gray-200">Abrir en nueva pestaña</a>
                            <a href={`${API_BASE}/documentos/${doc.id}/download`} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Descargar</a>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      No encontramos un formulario cargado para este trámite. Puedes subirlo desde el panel de administración en Documentos (categoría "Formularios").
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {seccionActiva === 'documentos' && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Indicador de progreso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center ${pasoActual >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pasoActual >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {pasoActual > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Seleccionar Currícula</span>
              </div>
              <div className={`flex items-center ${pasoActual >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pasoActual >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {pasoActual > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="ml-2 font-medium">Tipo de Documento</span>
              </div>
              <div className={`flex items-center ${pasoActual >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pasoActual >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {pasoActual > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
                </div>
                <span className="ml-2 font-medium">Completar Solicitud</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((pasoActual - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Paso 1: Selección de Currícula */}
          {pasoActual === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Selecciona tu Currícula</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setCurriculaSeleccionada('2019')}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    curriculaSeleccionada === '2019'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-lg mb-2">Currícula 2019</h3>
                  <p className="text-gray-600">Para estudiantes que ingresaron desde 2019 en adelante</p>
                </button>
                <button
                  onClick={() => setCurriculaSeleccionada('2014')}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    curriculaSeleccionada === '2014'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-lg mb-2">Currícula 2014</h3>
                  <p className="text-gray-600">Para estudiantes que ingresaron entre 2014-2018</p>
                </button>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setPasoActual(2)}
                  disabled={!curriculaSeleccionada}
                  variant="primary"
                  size="md"
                  rightIcon={ChevronRight}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Selección de Tipo de Documento */}
          {pasoActual === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <Button
                  onClick={() => setPasoActual(1)}
                  variant="ghost"
                  size="sm"
                  leftIcon={ChevronLeft}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  Volver
                </Button>
                <h2 className="text-2xl font-bold text-blue-900">Selecciona el Tipo de Documento</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {tiposDocumentos.map(documento => {
                  const IconoComponente = documento.icono;
                  return (
                    <button
                      key={documento.id}
                      onClick={() => setDocumentoSeleccionado(documento)}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        documentoSeleccionado?.id === documento.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <IconoComponente className="w-8 h-8 text-blue-600 mr-3" />
                        <h3 className="font-semibold text-lg">{documento.nombre}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{documento.descripcion}</p>
                      <div className="text-sm">
                        <p className="font-semibold text-green-600">{documento.costo}</p>
                        <p className="text-gray-500">{documento.tiempoEntrega}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => setPasoActual(3)}
                  disabled={!documentoSeleccionado}
                  variant="primary"
                  size="md"
                  rightIcon={ChevronRight}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Formulario de Solicitud */}
          {pasoActual === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <Button
                  onClick={() => setPasoActual(2)}
                  variant="ghost"
                  size="sm"
                  leftIcon={ChevronLeft}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  Volver
                </Button>
                <h2 className="text-2xl font-bold text-blue-900">Completar Solicitud</h2>
              </div>

              {/* Resumen de selección */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Resumen de tu solicitud:</h3>
                <p><strong>Currícula:</strong> {curriculaSeleccionada}</p>
                <p><strong>Documento:</strong> {documentoSeleccionado?.nombre}</p>
                <p><strong>Costo:</strong> {documentoSeleccionado?.costo}</p>
                <p><strong>Tiempo de entrega:</strong> {documentoSeleccionado?.tiempoEntrega}</p>
              </div>

              {/* Formulario */}
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      value={formularioData.nombres || ''}
                      onChange={(e) => handleInputChange('nombres', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores.nombres ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores.nombres && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errores.nombres}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      value={formularioData.apellidos || ''}
                      onChange={(e) => handleInputChange('apellidos', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores.apellidos ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores.apellidos && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errores.apellidos}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
                    <input
                      type="text"
                      value={formularioData.dni || ''}
                      onChange={(e) => handleInputChange('dni', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores.dni ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores.dni && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errores.dni}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      value={formularioData.telefono || ''}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores.telefono ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores.telefono && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errores.telefono}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formularioData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errores.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errores.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programa de Estudios *</label>
                  <select
                    value={formularioData.programa || ''}
                    onChange={(e) => handleInputChange('programa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.programa ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona tu programa</option>
                    <option value="sistemas">Desarrollo de Sistemas de Información</option>
                    <option value="contabilidad">Contabilidad</option>
                    <option value="administracion">Administración de Empresas</option>
                    <option value="enfermeria">Enfermería Técnica</option>
                    <option value="mecanica">Mecánica Automotriz</option>
                  </select>
                  {errores.programa && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errores.programa}
                    </p>
                  )}
                </div>

                {/* Campo adicional para diploma */}
                {documentoSeleccionado?.id === 3 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Egreso *</label>
                    <input
                      type="date"
                      value={formularioData.fechaEgreso || ''}
                      onChange={(e) => handleInputChange('fechaEgreso', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores.fechaEgreso ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errores.fechaEgreso && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errores.fechaEgreso}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    value={formularioData.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Información adicional (opcional)"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetearFormulario}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    leftIcon={CheckCircle}
                    onClick={() => {
                      if (validarFormulario()) {
                        alert('Solicitud enviada correctamente. Recibirás un email de confirmación.');
                        resetearFormulario();
                      }
                    }}
                  >
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
       )}

       {/* Información adicional sobre documentos */}
       {seccionActiva === 'documentos' && (
         <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
           <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
             <AlertCircle className="w-5 h-5 mr-2" />
             Información Importante
           </h3>
           <ul className="text-yellow-700 space-y-1 text-sm">
             <li>• Los documentos se entregarán según el tiempo estimado una vez completado el pago.</li>
             <li>• Todos los campos marcados con (*) son obligatorios.</li>
             <li>• Recibirás un email de confirmación con el número de seguimiento.</li>
             <li>• Los anexos y formularios adicionales están disponibles en nuestro <a href="https://drive.google.com/drive/u/2/folders/1gNQ99dW48k2k6sOfEqb-zHfY0c_MqSdi" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">repositorio de documentos</a>.</li>
           </ul>
         </div>
       )}
    </section>
  );
}

export default Tramites;

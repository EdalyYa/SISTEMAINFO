import React, { useState } from 'react';
import { FileText, GraduationCap, Award, BookOpen, History, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

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

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Trámites y Solicitudes</h1>
      
      {/* Pestañas de navegación */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => { setSeccionActiva('general'); resetearFormulario(); }}
            className={`px-6 py-3 rounded-md font-semibold transition-all ${
              seccionActiva === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Trámites Generales
          </button>
          <button
            onClick={() => { setSeccionActiva('documentos'); resetearFormulario(); }}
            className={`px-6 py-3 rounded-md font-semibold transition-all ${
              seccionActiva === 'documentos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Documentos Académicos
          </button>
        </div>
      </div>

      {seccionActiva === 'general' && (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar trámite..."
              className="border border-gray-300 rounded px-4 py-2 text-blue-900 font-semibold w-full md:w-1/2"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tramitesFiltrados.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-12">No se encontraron trámites.</div>
            ) : (
              tramitesFiltrados.map(tramite => (
                <div key={tramite.id} className="border rounded-lg shadow p-6 flex flex-col bg-white">
                  <h3 className="font-semibold text-lg mb-2 text-blue-800">{tramite.nombre}</h3>
                  <p className="text-gray-700 mb-2">{tramite.descripcion}</p>
                  <button
                    className="mt-auto bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
                    onClick={() => setTramiteSeleccionado(tramite)}
                  >
                    Ver requisitos
                  </button>
                </div>
              ))
            )}
          </div>
          {/* Modal de requisitos */}
          {tramiteSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl"
                  onClick={() => setTramiteSeleccionado(null)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold text-blue-900 mb-4">{tramiteSeleccionado.nombre}</h2>
                <p className="mb-2 text-gray-700">{tramiteSeleccionado.descripcion}</p>
                <h4 className="font-semibold mb-2">Requisitos:</h4>
                <ul className="list-disc list-inside mb-4">
                  {tramiteSeleccionado.requisitos.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                <a
                  href={tramiteSeleccionado.link}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Descargar formulario
                </a>
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
                <button
                  onClick={() => setPasoActual(2)}
                  disabled={!curriculaSeleccionada}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  Continuar
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Selección de Tipo de Documento */}
          {pasoActual === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setPasoActual(1)}
                  className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Volver
                </button>
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
                <button
                  onClick={() => setPasoActual(3)}
                  disabled={!documentoSeleccionado}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  Continuar
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Formulario de Solicitud */}
          {pasoActual === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setPasoActual(2)}
                  className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Volver
                </button>
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
                  <button
                    type="button"
                    onClick={resetearFormulario}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validarFormulario()) {
                        alert('Solicitud enviada correctamente. Recibirás un email de confirmación.');
                        resetearFormulario();
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Enviar Solicitud
                  </button>
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

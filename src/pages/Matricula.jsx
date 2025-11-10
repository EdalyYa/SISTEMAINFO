import React, { useState } from 'react';
import { CheckCircle, AlertCircle, FileText, CreditCard, ExternalLink, Upload, User, Phone, Mail } from 'lucide-react';

function Matricula() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    email: '',
    programa: '',
    numeroOperacion: '',
    fechaPago: '',
    montoPago: '',
    metodoPago: 'banco',
    documentos: {
      dni: false,
      certificadoEstudios: false,
      fotografia: false,
      reciboPago: false
    }
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const programas = [
    { id: 'ofimatica', name: 'Ofimática', precio: 'S/. 76.00 (Universitarios UNA) / S/. 86.00 (Egresados) / S/. 131.00 (Particulares)' },
    { id: 'excel', name: 'Excel Avanzado', precio: 'S/. 91.00 (Universitarios/Egresados) / S/. 101.00 (Particulares)' },
    { id: 'autocad', name: 'AutoCAD', precio: 'S/. 91.00 (Universitarios/Egresados) / S/. 101.00 (Particulares)' },
    { id: 'archicad', name: 'ArchiCAD', precio: 'S/. 91.00 (Universitarios/Egresados) / S/. 101.00 (Particulares)' },
    { id: 'project', name: 'MS Project', precio: 'S/. 91.00 (Universitarios/Egresados) / S/. 101.00 (Particulares)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (doc) => {
    setFormData(prev => ({
      ...prev,
      documentos: {
        ...prev.documentos,
        [doc]: !prev.documentos[doc]
      }
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.nombres) newErrors.nombres = 'Nombres requeridos';
      if (!formData.apellidos) newErrors.apellidos = 'Apellidos requeridos';
      if (!formData.dni) newErrors.dni = 'DNI requerido';
      if (!formData.telefono) newErrors.telefono = 'Teléfono requerido';
      if (!formData.email) newErrors.email = 'Email requerido';
      if (!formData.programa) newErrors.programa = 'Programa requerido';
    }
    
    if (stepNumber === 2) {
      if (!formData.numeroOperacion) newErrors.numeroOperacion = 'Número de operación requerido';
      if (!formData.fechaPago) newErrors.fechaPago = 'Fecha de pago requerida';
      if (!formData.montoPago) newErrors.montoPago = 'Monto de pago requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(step)) {
      // Aquí se procesaría el formulario
      alert('Formulario enviado correctamente. Recibirás una confirmación por email.');
    }
  };

  const redirectToMatriculas = () => {
    window.open('https://matriculas.infouna.unap.edu.pe/login', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Sistema de Matrícula - INFOUNA</h1>
          <p className="text-gray-700 mb-4">
            Complete el formulario de verificación de pago y documentación para proceder con su matrícula.
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Datos Personales</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Verificación de Pago</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Documentación</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Datos Personales */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Datos Personales y Programa
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nombres ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ingrese sus nombres"
                    />
                    {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ingrese sus apellidos"
                    />
                    {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.dni ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="12345678"
                      maxLength="8"
                    />
                    {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="999123456"
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="ejemplo@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Programa de Interés *</label>
                    <select
                      name="programa"
                      value={formData.programa}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.programa ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Seleccione un programa</option>
                      {programas.map(programa => (
                        <option key={programa.id} value={programa.id}>
                          {programa.name} - {programa.precio}
                        </option>
                      ))}
                    </select>
                    {errors.programa && <p className="text-red-500 text-xs mt-1">{errors.programa}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Verificación de Pago */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Verificación de Pago
                </h2>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Instrucciones de Pago:</h3>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                    <li>Realiza el pago en el Banco de la Nación o a través de www.pagalo.pe</li>
                    <li>Espera 24 horas para que se refleje el pago en el sistema</li>
                    <li>Completa este formulario con los datos de tu pago</li>
                    <li>Adjunta la documentación requerida</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                    <select
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="banco">Banco de la Nación</option>
                      <option value="pagalo">PagaloCard (www.pagalo.pe)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Operación *</label>
                    <input
                      type="text"
                      name="numeroOperacion"
                      value={formData.numeroOperacion}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.numeroOperacion ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Número de operación"
                    />
                    {errors.numeroOperacion && <p className="text-red-500 text-xs mt-1">{errors.numeroOperacion}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago *</label>
                    <input
                      type="date"
                      name="fechaPago"
                      value={formData.fechaPago}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.fechaPago ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.fechaPago && <p className="text-red-500 text-xs mt-1">{errors.fechaPago}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado *</label>
                    <input
                      type="number"
                      name="montoPago"
                      value={formData.montoPago}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.montoPago ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                      step="0.01"
                    />
                    {errors.montoPago && <p className="text-red-500 text-xs mt-1">{errors.montoPago}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documentación */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="mr-2" size={20} />
                  Documentación Requerida
                </h2>
                
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-1">Importante:</h3>
                      <p className="text-sm text-yellow-700">
                        Marque los documentos que tiene listos. Todos son obligatorios para completar la matrícula.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="dni"
                      checked={formData.documentos.dni}
                      onChange={() => handleDocumentChange('dni')}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dni" className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-800">Copia de DNI</div>
                      <div className="text-sm text-gray-600">Documento Nacional de Identidad vigente</div>
                    </label>
                    {formData.documentos.dni && <CheckCircle className="text-green-500" size={20} />}
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="certificadoEstudios"
                      checked={formData.documentos.certificadoEstudios}
                      onChange={() => handleDocumentChange('certificadoEstudios')}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="certificadoEstudios" className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-800">Certificado de Estudios</div>
                      <div className="text-sm text-gray-600">Certificado de estudios secundarios o superiores</div>
                    </label>
                    {formData.documentos.certificadoEstudios && <CheckCircle className="text-green-500" size={20} />}
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="fotografia"
                      checked={formData.documentos.fotografia}
                      onChange={() => handleDocumentChange('fotografia')}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fotografia" className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-800">Fotografía</div>
                      <div className="text-sm text-gray-600">2 fotografías tamaño carnet fondo blanco</div>
                    </label>
                    {formData.documentos.fotografia && <CheckCircle className="text-green-500" size={20} />}
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="reciboPago"
                      checked={formData.documentos.reciboPago}
                      onChange={() => handleDocumentChange('reciboPago')}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reciboPago" className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-800">Voucher de Pago</div>
                      <div className="text-sm text-gray-600">Comprobante del pago realizado</div>
                    </label>
                    {formData.documentos.reciboPago && <CheckCircle className="text-green-500" size={20} />}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-2 rounded-lg font-medium ${
                  step === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                Anterior
              </button>
              
              <div className="flex space-x-4">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Enviar Solicitud
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Portal Access */}
        <div className="bg-blue-900 text-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Acceso al Portal de Matrículas</h2>
          <p className="mb-4">
            Una vez completado y verificado su pago, podrá acceder al portal oficial de matrículas para finalizar su inscripción.
          </p>
          <button
            onClick={redirectToMatriculas}
            className="bg-white text-blue-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition flex items-center"
          >
            <ExternalLink className="mr-2" size={16} />
            Ir al Portal de Matrículas
          </button>
          <p className="text-sm mt-2 opacity-90">
            Portal: matriculas.infouna.unap.edu.pe
          </p>
        </div>
      </div>
    </div>
  );
}

export default Matricula;

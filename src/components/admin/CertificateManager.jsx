import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import CertificateDesigner from './CertificateDesigner';
import ExcelImporter from './ExcelImporter';
import { Settings, FileSpreadsheet, Palette, Download, Eye, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const CertificateManager = () => {
  const [modoActivo, setModoActivo] = useState('diseno'); // 'diseno', 'importar', 'gestionar'
  const [plantillas, setPlantillas] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Cargar plantillas y certificados existentes
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar plantillas
      const respPlantillas = await fetch(`${API_BASE}/admin/certificados/plantillas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (respPlantillas.ok) {
        const dataPlantillas = await respPlantillas.json();
        setPlantillas(dataPlantillas);
      }

      // Cargar certificados
      const respCertificados = await fetch(`${API_BASE}/admin/certificados`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (respCertificados.ok) {
        const dataCertificados = await respCertificados.json();
        setCertificados(dataCertificados);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar certificados
  const certificadosFiltrados = certificados.filter(cert => {
    const coincideBusqueda = cert.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                            cert.dni?.includes(busqueda) ||
                            cert.nombre_evento?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === 'todos' || cert.tipo_certificado?.toLowerCase() === filtroTipo.toLowerCase();
    
    return coincideBusqueda && coincideTipo;
  });

  // Navegación de pestañas
  const pestanas = [
    { id: 'diseno', nombre: 'Diseñar Plantilla', icono: Palette },
    { id: 'importar', nombre: 'Importar Excel', icono: FileSpreadsheet },
    { id: 'gestionar', nombre: 'Gestionar Certificados', icono: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="mr-3" />
            Sistema de Certificados
          </h1>
          <p className="text-gray-600 mt-1">
            Diseña plantillas, importa datos y genera certificados profesionales
          </p>
        </div>
      </div>

      {/* Navegación */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {pestanas.map(pestaña => {
              const Icono = pestaña.icono;
              return (
                <button
                  key={pestaña.id}
                  onClick={() => setModoActivo(pestaña.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    modoActivo === pestaña.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icono className="mr-2 w-4 h-4" />
                  {pestaña.nombre}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {modoActivo === 'diseno' && <CertificateDesigner />}
        {modoActivo === 'importar' && <ExcelImporter />}
        
        {modoActivo === 'gestionar' && (
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Palette className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Plantillas</p>
                    <p className="text-2xl font-bold text-gray-900">{plantillas.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Certificados</p>
                    <p className="text-2xl font-bold text-gray-900">{certificados.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Eye className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Verificaciones</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {certificados.reduce((acc, cert) => acc + (cert.verificaciones || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Descargas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {certificados.reduce((acc, cert) => acc + (cert.descargas || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, DNI o evento..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="asistente">Asistente</option>
                    <option value="ponente">Ponente</option>
                    <option value="estudiante">Estudiante</option>
                  </select>
                </div>
              </div>

              {/* Tabla de certificados */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DNI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificadosFiltrados.map((certificado) => (
                      <tr key={certificado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {certificado.dni}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {certificado.nombre_completo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={certificado.nombre_evento}>
                            {certificado.nombre_evento}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            certificado.tipo_certificado === 'ponente' 
                              ? 'bg-purple-100 text-purple-800'
                              : certificado.tipo_certificado === 'asistente'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {certificado.tipo_certificado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {certificado.horas_academicas}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {certificado.codigo_verificacion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            certificado.estado === 'activo' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {certificado.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                  onClick={() => window.open(`${API_BASE}/certificados-publicos/descargar/${certificado.codigo_verificacion}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {/* Lógica de edición */}}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {/* Lógica de eliminación */}}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {certificadosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron certificados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateManager;

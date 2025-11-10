import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Download, FileText, Users, Play, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../config/api';

const ExcelImporter = ({ onAfterProcess }) => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [processResult, setProcessResult] = useState(null);

  // Columnas esperadas en el Excel
  const columnasRequeridas = [
    'dni',
    'apellido_paterno', 
    'apellido_materno',
    'nombres',
    'tipo_certificado', // Asistente, Ponente, Estudiante
    'nombre_evento',
    'fecha_inicio',
    'fecha_fin',
    'horas_academicas',
    'correo_electronico'
  ];

  useEffect(() => {
    fetchArchivos();
  }, []);

  const fetchArchivos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/certificados-masivos/archivos');
      setArchivos(response.data.archivos || []);
    } catch (error) {
      console.error('Error fetching archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('excel', file);
    try {
      await api.post('/certificados-masivos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchArchivos();
      e.target.value = '';
      setProcessResult(null);
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    setProcessResult(null);
    try {
      const response = await api.post(`/certificados-masivos/procesar/${id}`);
      setProcessResult(response.data);
      fetchArchivos();
      if (typeof onAfterProcess === 'function') {
        try { onAfterProcess(); } catch (e) { /* no-op */ }
      }
    } catch (error) {
      console.error('Error processing:', error);
      const data = error.response?.data;
      setProcessResult({
        success: false,
        message: data?.error || error.message,
        errores: data?.errores || [],
        resumen: data?.resumen || null
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;
    try {
      await api.delete(`/certificados-masivos/archivos/${id}`);
      fetchArchivos();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Descargar plantilla Excel
  const descargarPlantilla = () => {
    const plantilla = [
      columnasRequeridas.map(col => col.toUpperCase().replace(/_/g, ' ')),
      ['12345678', 'PÉREZ', 'GARCÍA', 'JUAN CARLOS', 'ASISTENTE', 'Taller de Desarrollo Web', '2024-01-15', '2024-01-19', '20', 'juan.perez@email.com'],
      ['87654321', 'GÓMEZ', 'LÓPEZ', 'MARÍA ISABEL', 'PONENTE', 'Congreso de Innovación', '2024-02-01', '2024-02-03', '15', 'maria.gomez@email.com']
    ];

    const ws = XLSX.utils.aoa_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_certificados.xlsx');
  };

  // Descargar plantilla CSV (más liviana)
  const descargarPlantillaCSV = () => {
    const encabezados = columnasRequeridas.map(col => col.toUpperCase().replace(/_/g, ' '));
    const filas = [
      ['12345678','PÉREZ','GARCÍA','JUAN CARLOS','ASISTENTE','Taller de Desarrollo Web','2024-01-15','2024-01-19','20','juan.perez@email.com'],
      ['87654321','GÓMEZ','LÓPEZ','MARÍA ISABEL','PONENTE','Congreso de Innovación','2024-02-01','2024-02-03','15','maria.gomez@email.com']
    ];
    const csv = [encabezados, ...filas]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_certificados.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-1 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Sección de carga de archivo */}
        <div className="bg-white rounded-lg shadow p-1.5 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
            {/* Cargar archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subir archivo Excel:
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-1.5 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1.5" />
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    {uploading ? 'Subiendo...' : 'Haz clic para subir archivo'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Formatos: XLSX, XLS, CSV (máx. 20MB)
                  </p>
                </label>
              </div>
              {uploading && <p className="text-xs text-blue-600 mt-1">Subiendo archivo...</p>}
            </div>

            {/* Descargar plantilla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plantilla de ejemplo
              </label>
              <button
                onClick={descargarPlantilla}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
              >
                <FileText className="mr-2 w-4 h-4" />
                Descargar plantilla Excel
              </button>
              <span className="mx-2 text-gray-300">•</span>
              <button
                onClick={descargarPlantillaCSV}
                className="inline-flex items-center text-green-600 hover:text-green-700 text-xs"
              >
                <FileText className="mr-2 w-4 h-4" />
                Descargar plantilla CSV
              </button>
              <p className="text-[11px] text-gray-500 mt-0.5">Incluye formato y ejemplos de datos</p>
          </div>
        </div>

          {/* Columnas requeridas */}
          <div className="mt-1 p-1.5 bg-blue-50 rounded">
            <h3 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
              <Users className="mr-2 w-4 h-4" />
              Columnas requeridas:
            </h3>
            <div className="flex flex-wrap gap-1 text-blue-700">
              {columnasRequeridas.map(col => (
                <span key={col} className="bg-white px-1.5 py-0.5 rounded border text-[10px]">
                  {col.toUpperCase().replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de archivos subidos */}
        {(loading || archivos.length > 0 || processResult) && (
          <div className="bg-white rounded-lg shadow p-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                <FileText className="mr-2 w-4 h-4" />
                Archivos Pendientes de Procesar
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Cargando archivos...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre Original
                      </th>
                      <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Subida
                      </th>
                      <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {archivos.map((archivo) => (
                      <tr key={archivo.id} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={archivo.original_name}>
                            {archivo.original_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs" title={archivo.filename}>
                            {archivo.filename}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
                          {new Date(archivo.upload_date).toLocaleString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleProcess(archivo.id)}
                              disabled={processingId === archivo.id}
                              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${
                                processingId === archivo.id
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {processingId === archivo.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Procesar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(archivo.id)}
                              className="px-2.5 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* Resultado del último procesamiento */}
          {processResult && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <h4 className="text-sm font-medium text-green-800 mb-2">Último procesamiento completado:</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-green-600 font-semibold">Total filas:</span>
                  <p>{processResult.resumen?.total_filas || 0}</p>
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Válidas:</span>
                  <p>{processResult.resumen?.certificados_validos || 0}</p>
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Generados:</span>
                  <p>{processResult.resumen?.certificados_generados || 0}</p>
                </div>
                <div>
                  <span className="text-orange-600 font-semibold">Errores:</span>
                  <p>{processResult.resumen?.errores || 0}</p>
                </div>
              </div>
              {processResult.errores && processResult.errores.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-orange-800 font-medium mb-2">Errores encontrados:</h5>
                  <div className="max-h-28 overflow-y-auto bg-orange-50 p-2 rounded">
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                      {processResult.errores.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {processResult.resultados && (
                <button
                  className="mt-3 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Ver Detalles Completos
                </button>
              )}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelImporter;

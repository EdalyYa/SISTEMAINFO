import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, Eye, Download, Trash2, Edit, SortAsc, SortDesc } from 'lucide-react';
import PDFPreviewModal from '../../components/PDFPreviewModal';
import DisenoCertificados from '../../components/DisenoCertificados';
import ExcelImporter from '../../components/admin/ExcelImporter';
import SimpleDesignUploader from '../../components/admin/SimpleDesignUploader';
import api, { API_BASE, API_HOST } from '../../config/api';
import { ConfirmModal, useToast } from '../../components/ui';

const CertificadosAdmin = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [designEditorOpen, setDesignEditorOpen] = useState(false);
  const [designEditorContext, setDesignEditorContext] = useState('global'); // 'global' | 'personal'
  const [errors, setErrors] = useState({});
  const [editCert, setEditCert] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const toast = useToast();

  // Diseños de certificados
  const [disenos, setDisenos] = useState([]);
  const [defaultDesignId, setDefaultDesignId] = useState(null);
  const [settingDefault, setSettingDefault] = useState(false);
  const [designUploaderOpen, setDesignUploaderOpen] = useState(false);

  useEffect(() => {
    fetchCertificados();
    fetchDisenos();
  }, []);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/certificados');
      const list = Array.isArray(response.data) ? response.data : [];
      setCertificados(list);
      setPage(1);
    } catch (error) {
      console.error('Error al obtener certificados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisenos = async () => {
    try {
      const response = await api.get('/admin/certificados/disenos');
      const list = Array.isArray(response.data) ? response.data : [];
      setDisenos(list);
      const activo = list.find(d => d.activa === 1 || d.activa === true);
      if (activo) setDefaultDesignId(activo.id);
    } catch (error) {
      console.error('Error al obtener diseños:', error);
    }
  };

  // Búsqueda y paginación (client-side)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const filteredCerts = useMemo(() => {
    const term = debouncedSearch;
    if (!term) return certificados;
    return certificados.filter((c) => {
      return [
        c.dni,
        c.nombre_completo,
        c.tipo_certificado,
        c.nombre_evento,
        c.codigo_verificacion
      ]
        .map((v) => (v || '').toString().toLowerCase())
        .some((v) => v.includes(term));
    });
  }, [certificados, debouncedSearch]);

  const sortedCerts = useMemo(() => {
    return [...filteredCerts].sort((a, b) => {
      const da = new Date(a.fecha_emision || 0).getTime();
      const db = new Date(b.fecha_emision || 0).getTime();
      return sortOrder === 'asc' ? da - db : db - da;
    });
  }, [filteredCerts, sortOrder]);

  const totalItems = sortedCerts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleCerts = useMemo(() => sortedCerts.slice(startIndex, startIndex + pageSize), [sortedCerts, startIndex, pageSize]);

  const copyPublicUrl = async (codigo) => {
    try {
      const url = `${API_BASE}/certificados-publicos/descargar/${codigo}`;
      await navigator.clipboard.writeText(url);
      setErrors({ copy: 'URL pública copiada' });
      setTimeout(() => setErrors({}), 2000);
    } catch (e) {
      console.error('Error al copiar URL pública:', e);
    }
  };

  const handleVerPDF = async (certificado) => {
    try {
      const timestamp = new Date().getTime();
      const url = `${API_BASE}/admin/certificados/pdf/${certificado.codigo_verificacion}?v=${timestamp}`;
      setSelectedCertificate({
        pdfUrl: url,
        codigo: certificado.codigo_verificacion,
        estudiante: {
          id: certificado.id,
          dni: certificado.dni,
          nombre_completo: certificado.nombre_completo,
          tipo_certificado: certificado.tipo_certificado,
          nombre_evento: certificado.nombre_evento,
          descripcion_evento: certificado.descripcion_evento,
          fecha_inicio: certificado.fecha_inicio,
          fecha_fin: certificado.fecha_fin,
          horas_academicas: certificado.horas_academicas,
          fecha_emision: certificado.fecha_emision,
          modalidad: certificado.modalidad || 'Presencial',
          observaciones: certificado.observaciones || ''
        }
      });
      setShowPDFModal(true);
    } catch (error) {
      console.error('Error al obtener PDF:', error);
    }
  };

  const handleDescargarPDF = async (certificado) => {
    try {
      const timestamp = new Date().getTime();
      // Usar generación directa por código y forzar descarga
      const downloadUrl = `${API_BASE}/admin/certificados/pdf/${certificado.codigo_verificacion}?download=1&v=${timestamp}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
    }
  };

  const handleEliminar = async (id) => {
    setConfirmMessage('Esta acción eliminará el certificado seleccionado. ¿Deseas continuar?');
    setDeleteAction(() => async () => {
      setDeleting(true);
      try {
        await api.delete(`/admin/certificados/${id}`);
        toast.addToast({ type: 'success', title: 'Eliminado', message: 'Certificado eliminado correctamente.' });
        fetchCertificados();
      } catch (error) {
        console.error('Error al eliminar certificado:', error);
        toast.addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el certificado.' });
      } finally {
        setDeleting(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  // Página simplificada: sin creación manual ni buscador

  const openEditModal = (cert) => {
    setIsCreate(false);
    setEditCert({
      id: cert.id,
      dni: cert.dni,
      nombre_completo: cert.nombre_completo,
      tipo_certificado: cert.tipo_certificado,
      nombre_evento: cert.nombre_evento,
      descripcion_evento: cert.descripcion_evento || '',
      fecha_inicio: cert.fecha_inicio ? cert.fecha_inicio.substring(0, 10) : '',
      fecha_fin: cert.fecha_fin ? cert.fecha_fin.substring(0, 10) : '',
      horas_academicas: cert.horas_academicas,
      fecha_emision: cert.fecha_emision ? new Date(cert.fecha_emision).toISOString().substring(0, 10) : ''
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setIsCreate(true);
    setEditCert({
      dni: '',
      nombre_completo: '',
      tipo_certificado: '',
      nombre_evento: '',
      descripcion_evento: '',
      fecha_inicio: '',
      fecha_fin: '',
      horas_academicas: 0,
      fecha_emision: ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditCert(null);
  };

  const saveEdit = async () => {
    if (!editCert) return;
    try {
      const payload = {
        dni: editCert.dni,
        nombre_completo: editCert.nombre_completo,
        tipo_certificado: editCert.tipo_certificado,
        nombre_evento: editCert.nombre_evento,
        descripcion_evento: editCert.descripcion_evento,
        fecha_inicio: editCert.fecha_inicio || null,
        fecha_fin: editCert.fecha_fin || null,
        horas_academicas: editCert.horas_academicas,
        fecha_emision: editCert.fecha_emision || null
      };
      if (isCreate && defaultDesignId) {
        payload.plantilla_certificado = `diseno_${defaultDesignId}.svg`;
      }
      if (isCreate) {
        await api.post(`/admin/certificados`, payload);
      } else {
        await api.put(`/admin/certificados/${editCert.id}`, payload);
      }
      closeEditModal();
      fetchCertificados();
    } catch (error) {
      console.error('Error al actualizar certificado:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || 'No se pudo actualizar';
      toast.addToast({ type: 'error', title: 'Error al guardar', message: msg });
    }
  };

  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setSelectedCertificate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado simple */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Award className="text-blue-600" />
            Certificados (Gestión)
          </h1>
          <p className="text-gray-600 text-xs">Gestión de registros y carga por Excel.</p>
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => setSortOrder('desc')} className={`px-3 py-1 rounded border text-xs flex items-center gap-1 ${sortOrder==='desc' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
              <SortDesc className="w-4 h-4" />
              Recientes primero
            </button>
            <button onClick={() => setSortOrder('asc')} className={`px-3 py-1 rounded border text-xs flex items-center gap-1 ${sortOrder==='asc' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
              <SortAsc className="w-4 h-4" />
              Antiguos primero
            </button>
          </div>
        </div>

        {/* Sección: Importación por Excel */}
        <div className="mb-3">
          <div className="bg-white rounded-lg shadow p-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Importar Excel</h2>
              <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={openCreateModal}>
                Agregar registro
              </button>
            </div>
            {/* Selector de plantilla por defecto */}
            <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Plantilla por defecto:</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={defaultDesignId || ''}
                    onChange={(e) => setDefaultDesignId(Number(e.target.value) || null)}
                  >
                    <option value="">Selecciona plantilla</option>
                    {disenos.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                    disabled={!defaultDesignId || settingDefault}
                    onClick={async () => {
                      if (!defaultDesignId) return;
                      setSettingDefault(true);
                      try {
                        // Forzar uso del router admin (sin prefijo /api) para evitar conflictos
                        await api.put(`${API_HOST}/admin/certificados/disenos/${defaultDesignId}/activar`);
                        await fetchDisenos();
                        toast.addToast({ type: 'success', title: 'Plantilla activada', message: 'Se aplicará por defecto al crear o importar.' });
                      } catch (e) {
                        console.error('Error al activar plantilla:', e);
                        const msg = e.response?.data?.error || e.response?.data?.message || 'No se pudo activar la plantilla';
                        toast.addToast({ type: 'error', title: 'Error', message: msg });
                      } finally {
                        setSettingDefault(false);
                      }
                    }}
                  >
                    {settingDefault ? 'Guardando...' : 'Establecer como predeterminada'}
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs"
                    onClick={() => setDesignUploaderOpen(true)}
                  >
                    Seleccionar diseño
                  </button>
                  <button
                    className="px-2 py-1 bg-purple-700 text-white rounded text-xs"
                    onClick={() => setDesignEditorOpen(true)}
                  >
                    Editar diseño
                  </button>
                  {defaultDesignId && (
                    <span className="text-xs text-gray-500">Actual: {disenos.find(d=>d.id===defaultDesignId)?.nombre || '—'}</span>
                  )}
                </div>
              </div>
            </div>
            <ExcelImporter 
              onAfterProcess={fetchCertificados} 
              defaultDesignName={disenos.find(d=>d.id===defaultDesignId)?.nombre}
              defaultDesignId={defaultDesignId}
            />
            <SimpleDesignUploader
              open={designUploaderOpen}
              onClose={() => setDesignUploaderOpen(false)}
              onSaved={() => { setDesignUploaderOpen(false); fetchDisenos(); }}
            />
          </div>
        </div>

        {/* Lista de certificados */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex flex-wrap items-center gap-2 justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="text-blue-600" />
              Certificados Registrados ({totalItems})
            </h2>
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por DNI, nombre, evento o código"
                  className="w-64 border rounded px-3 py-1 text-sm"
                />
              </div>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={openCreateModal}>
                Agregar registro
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Emisión</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleCerts.map((cert) => (
                  <motion.tr
                    key={cert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900">{cert.dni}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">{cert.nombre_completo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">
                        {cert.tipo_certificado}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-sm text-gray-900 max-w-xs truncate">{cert.nombre_evento}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.fecha_emision).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-100 text-green-800">
                        {cert.horas_academicas}h
                      </span>
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                      {cert.codigo_verificacion}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleVerPDF(cert)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver PDF"
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDescargarPDF(cert)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(cert)}
                          className="text-yellow-600 hover:text-yellow-900 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEliminar(cert.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Controles de paginación */}
            <div className="flex flex-wrap items-center justify-between px-3 py-2 border-t border-gray-200 text-sm">
              <div className="text-gray-600">
                Mostrando {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} de {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
                <span className="text-gray-700">{page} / {totalPages}</span>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>

            {totalItems === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No hay certificados registrados</h3>
                <p className="text-gray-500 text-xs">Importa un Excel para generarlos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de previsualización de PDF */}
        <PDFPreviewModal
          isOpen={showPDFModal}
          onClose={handleClosePDFModal}
          pdfUrl={selectedCertificate?.pdfUrl}
          certificateCode={selectedCertificate?.codigo}
          onEdit={() => {
            setShowPDFModal(false);
            // Edición personal: abre el editor con contexto del estudiante
            setDesignEditorContext('personal');
            setDesignEditorOpen(true);
          }}
        />

        {/* Editor visual de diseño de certificados */}
        {designEditorOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-base font-semibold">Editor de diseño de certificados</h3>
                <button className="px-2 py-1 text-xs bg-gray-700 text-white rounded" onClick={() => setDesignEditorOpen(false)}>Cerrar</button>
              </div>
              <div className="p-2">
                <DisenoCertificados 
                  onClose={() => { setDesignEditorOpen(false); setDesignEditorContext('global'); }} 
                  onlyPDF={false}
                  datosEstudiante={designEditorContext === 'personal' ? selectedCertificate?.estudiante : undefined}
                  pdfUrl={designEditorContext === 'personal' ? selectedCertificate?.pdfUrl : undefined}
                  initialSelectedElement={designEditorContext === 'personal' ? 'nombreEstudiante' : undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición simple */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-4">
              <h3 className="text-base font-semibold mb-3">{isCreate ? 'Agregar certificado' : 'Editar certificado'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-600">DNI</label>
                  <input className="w-full border rounded px-2 py-1" value={editCert?.dni || ''} onChange={(e)=>setEditCert({...editCert, dni: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Nombre completo</label>
                  <input className="w-full border rounded px-2 py-1" value={editCert?.nombre_completo || ''} onChange={(e)=>setEditCert({...editCert, nombre_completo: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tipo certificado</label>
                  <select className="w-full border rounded px-2 py-1" value={editCert?.tipo_certificado || ''} onChange={(e)=>setEditCert({...editCert, tipo_certificado: e.target.value})}>
                    <option value="">Seleccione</option>
                    <option>Seminario</option>
                    <option>Curso</option>
                    <option>Taller</option>
                    <option>Conferencia</option>
                    <option>Diplomado</option>
                    <option>Capacitación</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Nombre evento</label>
                  <input className="w-full border rounded px-2 py-1" value={editCert?.nombre_evento || ''} onChange={(e)=>setEditCert({...editCert, nombre_evento: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Descripción evento</label>
                  <input className="w-full border rounded px-2 py-1" value={editCert?.descripcion_evento || ''} onChange={(e)=>setEditCert({...editCert, descripcion_evento: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Fecha inicio</label>
                  <input type="date" className="w-full border rounded px-2 py-1" value={editCert?.fecha_inicio || ''} onChange={(e)=>setEditCert({...editCert, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Fecha fin</label>
                  <input type="date" className="w-full border rounded px-2 py-1" value={editCert?.fecha_fin || ''} onChange={(e)=>setEditCert({...editCert, fecha_fin: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Horas académicas</label>
                  <input type="number" min={1} className="w-full border rounded px-2 py-1" value={editCert?.horas_academicas || ''} onChange={(e)=>setEditCert({...editCert, horas_academicas: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Fecha emisión</label>
                  <input type="date" className="w-full border rounded px-2 py-1" value={editCert?.fecha_emision || ''} onChange={(e)=>setEditCert({...editCert, fecha_emision: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button className="px-3 py-1.5 bg-gray-200 rounded text-sm" onClick={closeEditModal}>Cancelar</button>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm" onClick={saveEdit}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { if (!deleting) { setConfirmOpen(false); setDeleteAction(null); } }}
        onConfirm={async () => { if (typeof deleteAction === 'function') { await deleteAction(); } }}
        title="Confirmar eliminación"
        message={confirmMessage || 'Esta acción es permanente. ¿Deseas continuar?'}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default CertificadosAdmin;

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Download, Trash2, Search, Edit, ChevronDown, ChevronUp, Image, MoreHorizontal, Plus, LayoutGrid, Table, User, FileSpreadsheet } from 'lucide-react';
import api, { API_HOST } from '../../config/api';
import * as XLSX from 'xlsx';
import CertificateDesigner from '../../components/admin/CertificateDesigner';
import { ConfirmModal, useToast, Modal } from '../../components/ui';

const CertificadosV2 = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [templateName, setTemplateName] = useState('Plantilla A4');
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [single, setSingle] = useState({
    documento_tipo: 'DNI',
    dni: '', nombre_completo: '', rol: '', nombre_evento: '', descripcion_evento: '',
    fecha_inicio: '', fecha_fin: '', horas_academicas: ''
  });
  const [batchFile, setBatchFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const CACHE_KEY = 'certificados_v2_records_cache';
  const [openTemplates, setOpenTemplates] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const [openActionsId, setOpenActionsId] = useState(null);
  const [singleErrors, setSingleErrors] = useState({});
  const [batchInfo, setBatchInfo] = useState({ rows: 0, valid: 0, errors: [], columnsOk: false });
  const [tplActionsId, setTplActionsId] = useState(null);
  const [newTplOpen, setNewTplOpen] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplFile, setNewTplFile] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [bgOpen, setBgOpen] = useState(false);
  const [bgId, setBgId] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [confirmTplOpen, setConfirmTplOpen] = useState(false);
  const [deleteTplId, setDeleteTplId] = useState(null);
  const [activeTab, setActiveTab] = useState('plantillas');
  const [createOpen, setCreateOpen] = useState(false);
  const [lastCreateMode, setLastCreateMode] = useState(() => { try { return localStorage.getItem('cert_v2_last_mode') || null; } catch(_) { return null; } });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewSourceUrl, setPreviewSourceUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => { fetchTemplates(); }, []);
  useEffect(() => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      if (Array.isArray(cache) && cache.length) setRecords(cache);
    } catch(_) {}
    fetchRecords();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const filtered = useMemo(() => {
    const t = debounced;
    if (!t) return records;
    return records.filter(r => [r.dni, r.nombre_completo, r.nombre_evento, r.codigo_verificacion].some(x => String(x || '').toLowerCase().includes(t)));
  }, [records, debounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openPreview = async (record) => {
    try {
      const src = `${API_HOST}/api/certificados-v2/download/${record.codigo_verificacion}`;
      setPreviewSourceUrl(src);
      setPreviewLoading(true);
      setPreviewError('');
      setPreviewOpen(true);
      const res = await fetch(src);
      if (!res.ok) throw new Error('fetch');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (_) {
      setPreviewUrl('');
      setPreviewError('No se pudo cargar la vista previa');
    }
    setPreviewLoading(false);
  };

  async function fetchTemplates() {
    try {
      const { data } = await api.get('/certificados-v2/templates');
      setTemplates(Array.isArray(data) ? data : []);
    } catch (_) {}
  }

  async function fetchRecords() {
    try {
      setLoadingRecords(true);
      let serverRecords = [];
      try {
        const { data } = await api.get('/certificados-v2/certificados');
        serverRecords = Array.isArray(data) ? data : [];
      } catch (_) {
        serverRecords = [];
      }
      if (!serverRecords.length) {
        try {
          const { data: dataAll } = await api.get('/certificados-v2/all');
          serverRecords = Array.isArray(dataAll) ? dataAll : [];
        } catch (_) {}
      }
      let cache = [];
      try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); } catch(_) {}
      const merged = [...serverRecords];
      const seen = new Set(serverRecords.map(r => String(r.id)));
      for (const r of cache) {
        const key = String(r.id);
        if (!seen.has(key)) { merged.push(r); seen.add(key); }
      }
      merged.sort((a,b)=>Number(b.id)-Number(a.id));
      setRecords(merged);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch(_) {}
      if (!serverRecords.length) {
        alert('No se pudo cargar desde la base de datos. Mostrando registros en caché. Verifica que el backend esté conectado a la BD correcta.');
      }
    } catch (_) {
      alert('Error al cargar certificados.');
    }
    setLoadingRecords(false);
  }

  async function saveTemplate(config) {
    try {
      const form = new FormData();
      const isEditing = !!selectedTemplate;
      const current = templates.find(t => t.id === selectedTemplate);
      const nombreFinal = templateName || config?.nombre || current?.nombre || 'Plantilla A4';
      form.append('nombre', nombreFinal);
      if (backgroundFile) {
        form.append('background', backgroundFile);
      } else if (config?.fondo && String(config.fondo).startsWith('data:')) {
        const dataUrl = String(config.fondo);
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8arr], { type: mime });
        const file = new File([blob], `fondo_${Date.now()}.png`, { type: mime });
        form.append('background', file);
      }
      form.append('config_json', JSON.stringify(config?.configuracion || {}));
      const { data } = isEditing
        ? await api.put(`/certificados-v2/templates/${selectedTemplate}`, form)
        : await api.post('/certificados-v2/templates', form);
      setDesignerOpen(false);
      fetchTemplates();
      if (!isEditing) setSelectedTemplate(data?.id || null);
    } catch (_) {}
  }

  async function createTemplate() {
    try {
      const form = new FormData();
      form.append('nombre', newTplName || 'Plantilla');
      if (newTplFile) form.append('background', newTplFile);
      form.append('config_json', JSON.stringify({}));
      const { data } = await api.post('/certificados-v2/templates', form);
      setNewTplOpen(false);
      setNewTplName('');
      setNewTplFile(null);
      await fetchTemplates();
      setSelectedTemplate(data?.id || null);
      toast.success('Plantilla creada');
    } catch(_) { toast.error('No se pudo crear la plantilla'); }
  }

  async function renameTemplate() {
    if (!renameId) return;
    try {
      const form = new FormData();
      form.append('nombre', renameName || 'Plantilla');
      await api.put(`/certificados-v2/templates/${renameId}`, form);
      setRenameOpen(false);
      setRenameId(null);
      setRenameName('');
      await fetchTemplates();
      toast.success('Nombre actualizado');
    } catch(_) { toast.error('No se pudo actualizar el nombre'); }
  }

  async function updateTemplateBackground() {
    if (!bgId || !bgFile) return;
    try {
      const form = new FormData();
      form.append('nombre', templates.find(t => t.id === bgId)?.nombre || 'Plantilla');
      form.append('background', bgFile);
      await api.put(`/certificados-v2/templates/${bgId}`, form);
      setBgOpen(false);
      setBgId(null);
      setBgFile(null);
      await fetchTemplates();
      toast.success('Fondo actualizado');
    } catch(_) { toast.error('No se pudo actualizar el fondo'); }
  }

  async function deleteTemplate() {
    if (!deleteTplId) return;
    try {
      await api.delete(`/certificados-v2/templates/${deleteTplId}`);
      setConfirmTplOpen(false);
      if (selectedTemplate === deleteTplId) setSelectedTemplate(null);
      setDeleteTplId(null);
      await fetchTemplates();
      toast.success('Plantilla eliminada');
    } catch(_) { toast.error('No se pudo eliminar la plantilla'); }
  }

  async function generateSingle() {
    if (!selectedTemplate) return;
    setCreating(true);
    try {
      const payload = {
        template_id: selectedTemplate,
        documento_tipo: single.documento_tipo || 'DNI',
        dni: single.dni ? String(single.dni).toUpperCase() : null,
        nombre_completo: single.nombre_completo ? String(single.nombre_completo).toUpperCase() : '',
        rol: single.rol ? String(single.rol).toUpperCase() : null,
        nombre_evento: single.nombre_evento ? String(single.nombre_evento).toUpperCase() : '',
        descripcion_evento: single.descripcion_evento ? String(single.descripcion_evento).toUpperCase() : '',
        fecha_inicio: single.fecha_inicio || '',
        fecha_fin: single.fecha_fin || '',
        horas_academicas: single.horas_academicas ? Number(single.horas_academicas) : null,
      };
      const { data } = await api.post('/certificados-v2/generate', payload);
      if (data?.id) {
        const newRec = {
          id: data.id,
          documento_tipo: single.documento_tipo || 'DNI',
          dni: single.dni || null,
          nombre_completo: single.nombre_completo || '',
          rol: single.rol || null,
          nombre_evento: single.nombre_evento || '',
          horas_academicas: single.horas_academicas ? Number(single.horas_academicas) : null,
          codigo_verificacion: data.codigo_verificacion || '',
          created_at: new Date().toISOString(),
        };
        setRecords(prev => [newRec, ...prev]);
        try {
          const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
          localStorage.setItem(CACHE_KEY, JSON.stringify([newRec, ...cache]));
        } catch(_) {}
        setSearch('');
        toast.success('Certificado guardado correctamente');
      } else {
        await fetchRecords();
      }
    } catch (_) {}
    setCreating(false);
  }

  async function generateBatch() {
    if (!selectedTemplate || !batchFile) return;
    if (!batchInfo.columnsOk) { toast.error('El archivo no tiene las columnas requeridas'); return; }
    setCreating(true);
    try {
      const form = new FormData();
      form.append('template_id', selectedTemplate);
      form.append('file', batchFile);
      await api.post('/certificados-v2/batch', form);
      alert('Lote procesado. Puedes descargar usando el código de verificación mostrado en tu archivo si lo incluyes, o buscar por nombre.');
    } catch (_) {}
    setCreating(false);
  }

  function downloadBatchTemplate() {
    try {
      const headers = ['documento_tipo','dni','nombre_completo','rol','nombre_evento','descripcion_evento','fecha_inicio','fecha_fin','horas_academicas'];
      const sample = ['DNI','12345678','NOMBRE EJEMPLO','ASISTENTE','CURSO DEMO','DESCRIPCION','2025-01-01','2025-01-02','20'];
      const csv = [headers.join(','), sample.join(',')].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_certificados.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (_) {}
  }

  function downloadBatchTemplateXLSX() {
    try {
      const headers = ['documento_tipo','dni','nombre_completo','rol','nombre_evento','descripcion_evento','fecha_inicio','fecha_fin','horas_academicas'];
      const sample1 = ['DNI','12345678','NOMBRE EJEMPLO','ASISTENTE','CURSO DEMO','DESCRIPCION','2025-01-01','2025-01-02','20'];
      const sample2 = ['CE','AB123456','OTRO NOMBRE','PONENTE','EVENTO DEMO','DETALLE','2025-02-10','2025-02-12','12'];
      const data = [headers, sample1, sample2];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
      XLSX.writeFile(wb, 'plantilla_certificados.xlsx');
    } catch (_) {}
  }

  async function handleDelete(record) {
    setDeleteTarget(record);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/certificados-v2/certificados/${deleteTarget.id}`);
      setRecords(prev => prev.filter(x => String(x.id) !== String(deleteTarget.id)));
      try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache.filter(x => String(x.id) !== String(deleteTarget.id))));
      } catch(_) {}
      toast.success('Certificado eliminado correctamente');
    } catch (e) {
      toast.error('No se pudo eliminar el certificado');
    }
    setDeleting(false);
    setConfirmOpen(false);
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-2 md:py-4">
      <div className="space-y-3 md:space-y-4">
        <div className="bg-white rounded-2xl p-2 md:p-3 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificados V2</h1>
              <p className="text-gray-600">Plantillas con posiciones, generación individual y por lote.</p>
            </div>
            <div className="text-sm text-gray-500">{new Date().toLocaleDateString('es-PE')}</div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('plantillas')} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${activeTab==='plantillas' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}><LayoutGrid size={16}/> Plantillas</button>
              <button onClick={() => setActiveTab('certificados')} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${activeTab==='certificados' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}><Table size={16}/> Certificados</button>
            </div>
            <button disabled={!selectedTemplate} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm" onClick={() => setCreateOpen(true)}><Plus size={16}/> Crear</button>
          </div>
        </div>

        {activeTab==='plantillas' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-2 md:gap-3">
          <div className="bg-white rounded-2xl p-2 border shadow-sm">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Plantillas</h2>
              <div className="flex items-center gap-2">
                <button className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm" onClick={() => setDesignerOpen(true)}><Edit size={16}/> Editar</button>
                <button className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 text-sm" onClick={() => setNewTplOpen(true)}><Plus size={16}/> Agregar</button>
                <button className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 text-sm" onClick={() => setGalleryOpen(true)}><LayoutGrid size={16}/> Galería</button>
                <button className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 text-sm" onClick={() => setOpenTemplates(v => !v)}>{openTemplates ? (<><ChevronUp size={16}/> Ocultar</>) : (<><ChevronDown size={16}/> Mostrar</>)}</button>
              </div>
            </div>
            {openTemplates && (
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-3">
                <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  {templates.map(t => (
                    <div key={t.id} className={`group relative rounded-xl border p-2 bg-white transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${selectedTemplate === t.id ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => setSelectedTemplate(t.id)}>
                      <div className="relative">
                        {t.fondo_url ? (
                          <img src={`${API_HOST}/${String(t.fondo_url).replace(/^\/+/, '')}`} alt="Fondo" className="h-28 w-full rounded-lg object-contain border bg-white" />
                        ) : (
                          <div className="h-28 w-full rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400"><Image size={18}/></div>
                        )}
                        {selectedTemplate === t.id && (
                          <div className="absolute top-2 left-2">
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-600 text-white">Seleccionada</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/50 to-transparent px-2 py-1">
                          <div className="text-xs text-white truncate">{t.nombre}</div>
                        </div>
                        <button
                          title="Acciones"
                          aria-haspopup="menu"
                          aria-expanded={tplActionsId === t.id}
                          className="absolute top-2 right-2 hidden group-hover:flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-white shadow-sm"
                          onClick={() => setTplActionsId(tplActionsId === t.id ? null : t.id)}
                        >
                          <MoreHorizontal size={16}/>
                        </button>
                        {tplActionsId === t.id && (
                          <div className="absolute right-2 top-12 w-44 bg-white border rounded-lg shadow-lg z-20">
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2" onClick={() => { setSelectedTemplate(t.id); setDesignerOpen(true); setTplActionsId(null); }}><Edit size={16}/> Editar posiciones</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2" onClick={() => { setRenameId(t.id); setRenameName(t.nombre || ''); setRenameOpen(true); setTplActionsId(null); }}>Renombrar</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2" onClick={() => { setBgId(t.id); setBgFile(null); setBgOpen(true); setTplActionsId(null); }}>Cambiar fondo</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600" onClick={() => { setDeleteTplId(t.id); setConfirmTplOpen(true); setTplActionsId(null); }}><Trash2 size={16}/> Eliminar</button>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 px-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{t.nombre}</div>
                        <div className="text-[11px] text-gray-500">ID: {t.id}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] rounded-full ${t.fondo_url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{t.fondo_url ? 'Con fondo' : 'Sin fondo'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-2 border shadow-sm lg:sticky lg:top-16">
            {(function(){
              const t = templates.find(x => x.id === selectedTemplate);
              const total = records.length;
              const porTpl = records.filter(r => Number(r.template_id) === Number(selectedTemplate)).length;
              if (!t) return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Detalles</h2>
                    <span className="text-xs text-gray-500">Selecciona una plantilla</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-gray-50 border p-3">
                      <div className="text-[11px] text-gray-500">Plantillas</div>
                      <div className="text-lg font-semibold text-gray-900">{templates.length}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border p-3">
                      <div className="text-[11px] text-gray-500">Certificados</div>
                      <div className="text-lg font-semibold text-gray-900">{total}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-white p-3 text-sm text-gray-600">
                    <div>Usa la galería para explorar plantillas en pantalla completa.</div>
                    <div className="mt-2">
                      <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setGalleryOpen(true)}>Abrir galería</button>
                    </div>
                  </div>
                </div>
              );
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{t.nombre}</div>
                      <div className="text-xs text-gray-500">ID: {t.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-gray-500">Certificados</div>
                      <div className="text-lg font-semibold text-gray-900">{porTpl}</div>
                    </div>
                  </div>
                  <div className="rounded border bg-white p-2">
                    {t.fondo_url ? (
                      <img src={`${API_HOST}/${String(t.fondo_url).replace(/^\/+/, '')}`} alt="Fondo" className="w-full h-40 object-contain rounded bg-white" />
                    ) : (
                      <div className="w-full h-40 rounded bg-gray-100 flex items-center justify-center text-gray-400">Sin fondo</div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs" onClick={() => setDesignerOpen(true)}>Editar</button>
                    <button className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs" onClick={() => { setRenameId(t.id); setRenameName(t.nombre || ''); setRenameOpen(true); }}>Renombrar</button>
                    <button className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs" onClick={() => { setBgId(t.id); setBgFile(null); setBgOpen(true); }}>Fondo</button>
                    <button className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs" onClick={() => { setDeleteTplId(t.id); setConfirmTplOpen(true); }}>Eliminar</button>
                    <button className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs" onClick={() => setSingleOpen(true)}>Individual</button>
                    <button className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs" onClick={() => setBatchOpen(true)}>Lote</button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs" onClick={downloadBatchTemplate}>Plantilla CSV</button>
                    <button className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs" onClick={downloadBatchTemplateXLSX}>Plantilla Excel</button>
                  </div>
                  <div className="text-[11px] text-gray-500">Columnas: documento_tipo, dni, nombre_completo, rol, nombre_evento, descripcion_evento, fecha_inicio, fecha_fin, horas_academicas. Fechas YYYY-MM-DD.</div>
                </div>
              );
            })()}
          </div>
        </div>
        )}

        {activeTab==='certificados' && (
          <div className="bg-white rounded-2xl p-3 border shadow-sm min-h-[50vh] md:min-h-[60vh]">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Certificados Generados</h2>
              <div className="flex items-center gap-2">
              <div className="relative">
                <input className="border rounded-lg pl-8 pr-2 py-1 text-sm w-40" placeholder="Buscar" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                <Search size={14} className="absolute left-2 top-2 text-gray-400" />
              </div>
              <select className="border rounded-lg px-2 py-1 text-xs" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg" onClick={fetchRecords}>Act.</button>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg" onClick={() => { setSearch(''); try { localStorage.removeItem(CACHE_KEY); } catch(_) {} }}>Limpiar</button>
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{filtered.length}</span>
              </div>
            </div>
          <div className={paged.length > 8 ? 'overflow-x-auto max-h-[60vh] overflow-y-auto' : 'overflow-x-auto'}>
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-1 pr-3">ID</th>
                  <th className="py-1 pr-3">Doc.</th>
                  <th className="py-1 pr-3">DNI</th>
                  <th className="py-1 pr-3">Nombre</th>
                  <th className="py-1 pr-3">Rol</th>
                  <th className="py-1 pr-3">Evento</th>
                  <th className="py-1 pr-3">Horas</th>
                  <th className="py-1 pr-3">Código</th>
                  <th className="py-1 pr-3">Acc.</th>
                </tr>
              </thead>
              <tbody>
                {loadingRecords ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b">
                      <td className="py-1 pr-3"><div className="h-3 w-6 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-10 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-16 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-40 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-20 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-40 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-10 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-3 w-32 bg-gray-200 rounded animate-pulse"/></td>
                      <td className="py-1 pr-3"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    </tr>
                  ))
                ) : paged.length ? (
                  paged.map(r => (
                      <tr key={r.id} className="border-b odd:bg-gray-50 hover:bg-gray-100">
                        <td className="py-1 pr-3">{r.id}</td>
                        <td className="py-1 pr-3">
                          {(function(){ const dt = String(r.documento_tipo || 'DNI').toUpperCase(); return dt === 'PASAPORTE' ? 'P' : dt; })()}
                        </td>
                        <td className="py-1 pr-3">{r.dni || '-'}</td>
                        <td className="py-1 pr-3">{r.nombre_completo}</td>
                        <td className="py-1 pr-3">{r.rol || '-'}</td>
                        <td className="py-1 pr-3">{r.nombre_evento}</td>
                        <td className="py-1 pr-3"><span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800">{r.horas_academicas || '-'}</span></td>
                        <td className="py-1 pr-3 font-mono"><span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-700">{r.codigo_verificacion}</span></td>
                        <td className="py-1 pr-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="h-7 w-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                              title="Ver"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPreview(r); }}
                            >
                              <Eye size={16}/>
                            </button>
                            <button className="h-7 w-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center" title="Descargar" onClick={() => window.open(`${API_HOST}/api/certificados-v2/download/${r.codigo_verificacion}?download=1`, '_blank')}><Download size={16}/></button>
                            <button className="h-7 w-7 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center" title="Eliminar" onClick={() => handleDelete(r)}><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td className="py-12" colSpan={9}>
                      <div className="flex flex-col items-center justify-center text-center">
                        <Search size={28} className="text-gray-400" />
                        <div className="mt-2 font-medium text-gray-800">Sin resultados</div>
                        <div className="text-sm text-gray-500">Ajusta tu búsqueda o actualiza los registros</div>
                        <div className="mt-3 flex items-center gap-2">
                          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setSearch('')}>Limpiar búsqueda</button>
                          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={fetchRecords}>Actualizar</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">Página {currentPage} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-100 rounded" disabled={currentPage<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Anterior</button>
                <button className="px-3 py-1 bg-gray-100 rounded" disabled={currentPage>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Siguiente</button>
              </div>
            </div>
          )}
        </div>
        )}

        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Crear certificado"
          size="md"
          footer={lastCreateMode ? (
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setCreateOpen(false)}>Cancelar</button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={() => {
                if (!selectedTemplate) { toast.error('Selecciona una plantilla'); return; }
                if (lastCreateMode === 'single') { setCreateOpen(false); setSingleOpen(true); }
                else if (lastCreateMode === 'batch') { setCreateOpen(false); setBatchOpen(true); }
              }}>Continuar con {lastCreateMode === 'single' ? 'Individual' : 'Lote'}</button>
            </>
          ) : null}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Plantilla</label>
              <select className="border rounded-lg px-3 py-1.5 text-sm w-full" value={selectedTemplate || ''} onChange={e => setSelectedTemplate(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Selecciona una plantilla</option>
                {templates.map(t => (<option key={`opt-${t.id}`} value={t.id}>{t.nombre} (ID: {t.id})</option>))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                onClick={() => { if (!selectedTemplate) { toast.error('Selecciona una plantilla'); return; } try { localStorage.setItem('cert_v2_last_mode','single'); } catch(_) {}; setLastCreateMode('single'); setCreateOpen(false); setSingleOpen(true); }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center"><User size={16}/></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Individual</div>
                    <div className="text-xs text-gray-600">Completa datos de una persona</div>
                  </div>
                </div>
              </button>
              <button
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                onClick={() => { if (!selectedTemplate) { toast.error('Selecciona una plantilla'); return; } try { localStorage.setItem('cert_v2_last_mode','batch'); } catch(_) {}; setLastCreateMode('batch'); setCreateOpen(false); setBatchOpen(true); }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center"><FileSpreadsheet size={16}/></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Por lote</div>
                    <div className="text-xs text-gray-600">Importa CSV o Excel</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={previewOpen}
          onClose={() => { if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch(_) {} } setPreviewOpen(false); setPreviewUrl(''); setPreviewSourceUrl(''); setPreviewError(''); }}
          title="Vista previa"
          size="lg"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => { setPreviewOpen(false); setPreviewUrl(''); }}>Cerrar</button>
              {previewSourceUrl && (
                <a className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded" href={`${previewSourceUrl}?download=1`} target="_blank" rel="noreferrer">Descargar</a>
              )}
            </>
          }
        >
          <div className="h-[70vh]">
            {previewLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-600">Cargando...</div>
            ) : previewError ? (
              <div className="h-full w-full flex items-center justify-center text-center px-4">
                <div>
                  <div className="text-sm font-medium text-red-600">{previewError}</div>
                  {previewSourceUrl && (
                    <div className="mt-2">
                      <a href={previewSourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm">Abrir en nueva pestaña</a>
                    </div>
                  )}
                </div>
              </div>
            ) : (previewUrl ? (
              <iframe title="preview" src={previewUrl} className="w-full h-full rounded border" />
            ) : previewSourceUrl ? (
              <iframe title="preview" src={previewSourceUrl} className="w-full h-full rounded border" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-600">Sin contenido</div>
            ))}
          </div>
        </Modal>
        <Modal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          title="Galería de plantillas"
          size="lg"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setGalleryOpen(false)}>Cerrar</button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={() => setGalleryOpen(false)}>Usar seleccionada</button>
            </>
          }
        >
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-4 max-h-[70vh] overflow-auto">
            {templates.map(t => (
              <button
                key={`gal-${t.id}`}
                className={`relative text-left rounded-xl border p-2 bg-white transition hover:shadow-md ${selectedTemplate === t.id ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <div className="relative">
                  {t.fondo_url ? (
                    <img src={`${API_HOST}/${String(t.fondo_url).replace(/^\/+/, '')}`} alt="Fondo" className="h-44 w-full rounded-lg object-contain border bg-white" />
                  ) : (
                    <div className="h-44 w-full rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400"><Image size={18}/></div>
                  )}
                  {selectedTemplate === t.id && (
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-600 text-white">Seleccionada</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 px-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{t.nombre}</div>
                  <div className="text-[11px] text-gray-500">ID: {t.id}</div>
                </div>
              </button>
            ))}
          </div>
        </Modal>

        

        <Modal
          isOpen={designerOpen}
          onClose={() => setDesignerOpen(false)}
          title="Editar posiciones"
          size="5xl"
          allowOverflow
        >
          <CertificateDesigner
            onSave={saveTemplate}
            onClose={() => setDesignerOpen(false)}
            initialTemplate={(function(){
              const t = templates.find(x => x.id === selectedTemplate);
              if (!t) return undefined;
              let cfg = {};
              try { cfg = typeof t.config_json === 'string' ? JSON.parse(t.config_json) : (t.config_json || {}); } catch(_){}
              const fondo = t.fondo_url ? `${API_HOST}/${String(t.fondo_url).replace(/^\/+/, '')}` : undefined;
              return { nombre: t.nombre, fondo, configuracion: cfg };
            })()}
          />
        </Modal>

        <Modal
          isOpen={newTplOpen}
          onClose={() => setNewTplOpen(false)}
          title="Nueva plantilla"
          size="md"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setNewTplOpen(false)}>Cancelar</button>
              <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded" onClick={createTemplate}>Crear</button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input className="border rounded-lg px-3 py-1.5 text-sm w-full" placeholder="Nombre de plantilla" value={newTplName} onChange={e => setNewTplName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fondo (opcional)</label>
              <input type="file" accept="image/*" onChange={e => setNewTplFile(e.target.files[0])} className="block w-full text-sm" />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={renameOpen}
          onClose={() => setRenameOpen(false)}
          title="Renombrar plantilla"
          size="sm"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setRenameOpen(false)}>Cancelar</button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={renameTemplate}>Guardar</button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input className="border rounded-lg px-3 py-1.5 text-sm w-full" placeholder="Nombre" value={renameName} onChange={e => setRenameName(e.target.value)} />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={bgOpen}
          onClose={() => setBgOpen(false)}
          title="Cambiar fondo"
          size="sm"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setBgOpen(false)}>Cancelar</button>
              <button disabled={!bgFile} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={updateTemplateBackground}>Actualizar</button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Fondo</label>
              <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files[0])} className="block w-full text-sm" />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={singleOpen}
          onClose={() => setSingleOpen(false)}
          title="Agregar certificado"
          size="lg"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setSingleOpen(false)}>Cancelar</button>
              <button
                disabled={!selectedTemplate || creating}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={async () => {
                  const errors = {};
                  if (!String(single.nombre_completo || '').trim()) errors.nombre_completo = 'Requerido';
                  if (!String(single.rol || '').trim()) errors.rol = 'Requerido';
                  if (!String(single.nombre_evento || '').trim()) errors.nombre_evento = 'Requerido';
                  if (single.horas_academicas === '' || single.horas_academicas === null || Number(single.horas_academicas) <= 0) errors.horas_academicas = 'Debe ser mayor a 0';
                  const docLen = String(single.dni || '').length;
                  if (single.documento_tipo === 'DNI') {
                    if (docLen && docLen !== 8) errors.dni = 'DNI inválido (8 dígitos)';
                  } else if (single.documento_tipo === 'CE') {
                    if (docLen && (docLen < 6 || docLen > 12)) errors.dni = 'CE inválido (6-12)';
                  } else {
                    if (docLen && (docLen < 6 || docLen > 12)) errors.dni = 'Pasaporte inválido (6-12)';
                  }
                  setSingleErrors(errors);
                  if (Object.keys(errors).length) { toast.error('Completa los campos obligatorios'); return; }
                  await generateSingle();
                  setSingleOpen(false);
                }}
              >
                Generar
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de documento</label>
              <select className="border rounded-lg px-3 py-1.5 text-sm w-full" value={single.documento_tipo} onChange={e => { const tipo = e.target.value; setSingle(prev => ({ ...prev, documento_tipo: tipo, dni: '' })); setSingleErrors(prev => ({ ...prev, dni: undefined })); }}>
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">PASAPORTE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Documento</label>
              <input
                inputMode={single.documento_tipo === 'DNI' ? 'numeric' : 'text'}
                className={`border rounded-lg px-3 py-1.5 text-sm w-full ${singleErrors.dni ? 'border-red-500' : ''}`}
                placeholder={single.documento_tipo === 'DNI' ? 'DNI (8 dígitos)' : (single.documento_tipo === 'CE' ? 'CE (6-12)' : 'Pasaporte (6-12)')}
                value={single.dni || ''}
                onChange={e => {
                  let v = String(e.target.value || '');
                  if (single.documento_tipo === 'DNI') {
                    v = v.replace(/\D/g,'').slice(0,8);
                  } else {
                    v = v.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,12);
                  }
                  setSingle({ ...single, dni: v });
                }}
              />
              {singleErrors.dni && (<div className="mt-1 text-xs text-red-600">{singleErrors.dni}</div>)}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input className={`border rounded-lg px-3 py-1.5 text-sm w-full ${singleErrors.nombre_completo ? 'border-red-500' : ''}`} placeholder="Nombre" value={single.nombre_completo || ''} onChange={e => setSingle({ ...single, nombre_completo: (e.target.value || '').toUpperCase() })} />
              {singleErrors.nombre_completo && (<div className="mt-1 text-xs text-red-600">{singleErrors.nombre_completo}</div>)}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
              <input className={`border rounded-lg px-3 py-1.5 text-sm w-full ${singleErrors.rol ? 'border-red-500' : ''}`} placeholder="Rol" value={single.rol || ''} onChange={e => setSingle({ ...single, rol: (e.target.value || '').toUpperCase() })} />
              {singleErrors.rol && (<div className="mt-1 text-xs text-red-600">{singleErrors.rol}</div>)}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Evento</label>
              <input className={`border rounded-lg px-3 py-1.5 text-sm w-full ${singleErrors.nombre_evento ? 'border-red-500' : ''}`} placeholder="Evento" value={single.nombre_evento || ''} onChange={e => setSingle({ ...single, nombre_evento: (e.target.value || '').toUpperCase() })} />
              {singleErrors.nombre_evento && (<div className="mt-1 text-xs text-red-600">{singleErrors.nombre_evento}</div>)}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <input className="border rounded-lg px-3 py-1.5 text-sm w-full" placeholder="Descripción" value={single.descripcion_evento || ''} onChange={e => setSingle({ ...single, descripcion_evento: (e.target.value || '').toUpperCase() })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input type="date" className="border rounded-lg px-3 py-1.5 text-sm w-full" value={single.fecha_inicio || ''} onChange={e => setSingle({ ...single, fecha_inicio: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input type="date" className="border rounded-lg px-3 py-1.5 text-sm w-full" value={single.fecha_fin || ''} onChange={e => setSingle({ ...single, fecha_fin: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Horas Académicas</label>
              <input type="number" min="1" step="1" inputMode="numeric" className={`border rounded-lg px-3 py-1.5 text-sm w-full ${singleErrors.horas_academicas ? 'border-red-500' : ''}`} placeholder="Horas" value={single.horas_academicas || ''} onChange={e => { const n = Number(e.target.value); setSingle({ ...single, horas_academicas: Number.isFinite(n) ? n : '' }); }} />
              {singleErrors.horas_academicas && (<div className="mt-1 text-xs text-red-600">{singleErrors.horas_academicas}</div>)}
            </div>
            <div className="md:col-span-2 text-xs text-gray-500">Selecciona una plantilla para habilitar generación</div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={confirmTplOpen}
          onClose={() => { setConfirmTplOpen(false); setDeleteTplId(null); }}
          onConfirm={deleteTemplate}
          title="Eliminar plantilla"
          message={deleteTplId ? `¿Deseas eliminar la plantilla con ID ${deleteTplId}?` : '¿Deseas eliminar esta plantilla?'}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />

        <Modal
          isOpen={batchOpen}
          onClose={() => setBatchOpen(false)}
          title="Procesar lote"
          size="md"
          footer={
            <>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setBatchOpen(false)}>Cancelar</button>
              <button disabled={!selectedTemplate || !batchFile || creating} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded" onClick={async () => { await generateBatch(); setBatchOpen(false); }}>Procesar</button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Archivo Excel/CSV</label>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={async e => { const f = e.target.files[0]; setBatchFile(f); if (f) await validateBatchFile(f); }} className="block w-full text-sm" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={downloadBatchTemplate}>Descargar plantilla CSV</button>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded" onClick={downloadBatchTemplateXLSX}>Descargar plantilla Excel</button>
              <span className="text-xs text-gray-500">Columnas: documento_tipo, dni, nombre_completo, rol, nombre_evento, descripcion_evento, fecha_inicio, fecha_fin, horas_academicas. Fechas YYYY-MM-DD.</span>
            </div>
            {batchFile && (
              <div className="text-xs text-gray-700 bg-gray-50 border rounded p-2">
                <div>Filas: {batchInfo.rows} • Válidas: {batchInfo.valid} • Errores: {batchInfo.errors.length}</div>
                {!batchInfo.columnsOk && (<div className="text-red-600 mt-1">Faltan columnas requeridas</div>)}
                {batchInfo.errors.length > 0 && (
                  <ul className="mt-2 list-disc ml-4 max-h-24 overflow-auto">
                    {batchInfo.errors.slice(0,8).map((e,i)=>(<li key={i} className="text-red-600">{e}</li>))}
                  </ul>
                )}
              </div>
            )}
            <div className="text-xs text-gray-500">Selecciona una plantilla para habilitar el procesamiento por lote</div>
          </div>
        </Modal>
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { if (!deleting) { setConfirmOpen(false); setDeleteTarget(null); } }}
        onConfirm={confirmDelete}
        title="Eliminar certificado"
        message={deleteTarget ? `¿Deseas eliminar el certificado de "${deleteTarget.nombre_completo}" (ID ${deleteTarget.id})?` : '¿Deseas eliminar este certificado?'}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default CertificadosV2;
  function parseCSVContent(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    const parseRow = (line) => {
      const res = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i+1] === '"') { cur += '"'; i++; }
          else { inQ = !inQ; }
        } else if (ch === ',' && !inQ) { res.push(cur); cur = ''; }
        else { cur += ch; }
      }
      res.push(cur);
      return res.map(s => s.trim());
    };
    const header = parseRow(lines[0]).map(h => h.toLowerCase());
    const required = ['documento_tipo','dni','nombre_completo','rol','nombre_evento','descripcion_evento','fecha_inicio','fecha_fin','horas_academicas'];
    const columnsOk = required.every(c => header.includes(c));
    const idx = Object.fromEntries(required.map(c => [c, header.indexOf(c)]));
    let valid = 0; const errors = [];
    for (let r = 1; r < lines.length; r++) {
      const cells = parseRow(lines[r]);
      const get = (k) => cells[idx[k]] ?? '';
      const tipo = String(get('documento_tipo') || '').toUpperCase();
      const dni = String(get('dni') || '');
      const nombre = String(get('nombre_completo') || '');
      const rol = String(get('rol') || '');
      const evento = String(get('nombre_evento') || '');
      const finicio = String(get('fecha_inicio') || '');
      const ffin = String(get('fecha_fin') || '');
      const horas = String(get('horas_academicas') || '');
      const errs = [];
      if (!['DNI','CE','PASAPORTE'].includes(tipo)) errs.push('documento_tipo');
      if (tipo === 'DNI') { if (!/^\d{8}$/.test(dni)) errs.push('dni'); }
      else { if (!/^[A-Za-z0-9]{6,12}$/.test(dni)) errs.push('dni'); }
      if (!nombre.trim()) errs.push('nombre_completo');
      if (!rol.trim()) errs.push('rol');
      if (!evento.trim()) errs.push('nombre_evento');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(finicio)) errs.push('fecha_inicio');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ffin)) errs.push('fecha_fin');
      if (!/^\d+$/.test(horas) || Number(horas) <= 0) errs.push('horas_academicas');
      if (errs.length === 0) valid++; else errors.push(`Fila ${r+1}: ${errs.join(', ')}`);
    }
    return { rows: Math.max(0, lines.length - 1), valid, errors, columnsOk };
  }

  async function validateBatchFile(file) {
    try {
      const name = String(file?.name || '').toLowerCase();
      if (name.endsWith('.csv')) {
        const text = await file.text();
        const info = parseCSVContent(text);
        setBatchInfo(info);
        if (!info.columnsOk) toast.error('Columnas requeridas faltantes en CSV');
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
        const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g,'_');
        const header = (rows[0] || []).map(norm);
        const required = ['documento_tipo','dni','nombre_completo','rol','nombre_evento','descripcion_evento','fecha_inicio','fecha_fin','horas_academicas'];
        const columnsOk = required.every(c => header.includes(c));
        const idx = Object.fromEntries(required.map(c => [c, header.indexOf(c)]));
        let valid = 0; const errors = [];
        for (let r = 1; r < rows.length; r++) {
          const cells = rows[r];
          const get = (k) => norm(cells[idx[k]]);
          const tipo = String(get('documento_tipo') || '').toUpperCase();
          const dni = String(cells[idx['dni']] ?? '').trim();
          const nombre = String(cells[idx['nombre_completo']] ?? '').trim();
          const rol = String(cells[idx['rol']] ?? '').trim();
          const evento = String(cells[idx['nombre_evento']] ?? '').trim();
          const finicio = String(cells[idx['fecha_inicio']] ?? '').trim();
          const ffin = String(cells[idx['fecha_fin']] ?? '').trim();
          const horas = String(cells[idx['horas_academicas']] ?? '').trim();
          const errs = [];
          if (!['DNI','CE','PASAPORTE'].includes(tipo)) errs.push('documento_tipo');
          if (tipo === 'DNI') { if (!/^\d{8}$/.test(dni)) errs.push('dni'); }
          else { if (!/^[A-Za-z0-9]{6,12}$/.test(dni)) errs.push('dni'); }
          if (!nombre) errs.push('nombre_completo');
          if (!rol) errs.push('rol');
          if (!evento) errs.push('nombre_evento');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(finicio)) errs.push('fecha_inicio');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(ffin)) errs.push('fecha_fin');
          if (!/^\d+$/.test(horas) || Number(horas) <= 0) errs.push('horas_academicas');
          if (errs.length === 0) valid++; else errors.push(`Fila ${r+1}: ${errs.join(', ')}`);
        }
        const info = { rows: Math.max(0, rows.length - 1), valid, errors, columnsOk };
        setBatchInfo(info);
        if (!info.columnsOk) toast.error('Columnas requeridas faltantes en Excel');
      }
    } catch (_) {
      setBatchInfo({ rows: 0, valid: 0, errors: ['No se pudo leer el archivo'], columnsOk: false });
    }
  }
  

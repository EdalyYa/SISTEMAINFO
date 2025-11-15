import React, { useState, useEffect } from 'react';
import { API_HOST, ASSET_BASE, API_BASE } from '../../config/api';
import { Plus, BookOpen, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminTable from '../../components/admin/AdminTable';
import AdminFormModal from '../../components/admin/AdminFormModal';
import FormField from '../../components/admin/FormField';
import { useToast, ConfirmModal } from '../../components/ui';
import logoFallback from '../../logo.png';

function Cursos() {
  const toast = useToast();
  // Plantillas de horario propuestas
  const horarioPresets = [
    { id: 'LMV_MANANA', label: 'LUN-MIE-VIE · Mañana', dias: 'LUN-MIE-VIE', rango: '8:00 am.-12:00 pm.', forceModalidad: null },
    { id: 'LMV_TARDE', label: 'LUN-MIE-VIE · Tarde', dias: 'LUN-MIE-VIE', rango: '4:00 pm.-7:00 pm.', forceModalidad: null },
    { id: 'LMV_NOCHE', label: 'LUN-MIE-VIE · Noche', dias: 'LUN-MIE-VIE', rango: '7:00 pm.-9:00 pm.', forceModalidad: null },
    { id: 'MJ_MANANA', label: 'MAR-JUE · Mañana', dias: 'MAR-JUE', rango: '8:00 am.-12:00 pm.', forceModalidad: null },
    { id: 'MJ_TARDE', label: 'MAR-JUE · Tarde', dias: 'MAR-JUE', rango: '1:00 pm.-4:00 pm.', forceModalidad: null },
    { id: 'MJ_NOCHE', label: 'MAR-JUE · Noche', dias: 'MAR-JUE', rango: '7:00 pm.-9:00 pm.', forceModalidad: null },
    { id: 'SD_MANANA_VIRTUAL', label: 'SAB-DOM · Mañana (Virtual)', dias: 'SAB-DOM', rango: '9:00 am.-12:00 pm.', forceModalidad: 'virtual' },
    { id: 'SD_TARDE_VIRTUAL', label: 'SAB-DOM · Tarde (Virtual)', dias: 'SAB-DOM', rango: '2:00 pm.-5:00 pm.', forceModalidad: 'virtual' },
    { id: 'SD_NOCHE_VIRTUAL', label: 'SAB-DOM · Noche (Virtual)', dias: 'SAB-DOM', rango: '7:00 pm.-10:00 pm.', forceModalidad: 'virtual' }
  ];

  const aplicarPresetHorario = (presetId) => {
    const p = horarioPresets.find(h => h.id === presetId);
    if (!p) return;
    setForm(prev => ({
      ...prev,
      horario: `${p.dias} [ ${p.rango} ]`,
      modalidad: p.forceModalidad ? p.forceModalidad : prev.modalidad
    }));
  };
  const [cursos, setCursos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCursoId, setEditingCursoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    duracion_horas: '',
    modalidad: 'presencial',
    programa_id: '',
    modulo_id: '', // NUEVO
    precio: '',
    estado: 'activo',
    horario: '',
    instructor: '',
    nivel: '',
    imagen: '' // opcional
  });

  useEffect(() => {
    fetchCursos();
    fetchProgramas();
  }, []);

  useEffect(() => {
    if (form.programa_id) {
      fetchModulos(form.programa_id);
    } else {
      setModulos([]);
      setForm(prev => ({ ...prev, modulo_id: '' }));
    }
  }, [form.programa_id]);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/cursos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar cursos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
      try {
        toast.error(err.message || 'Error de conexión', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/programas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgramas(data);
      }
    } catch (err) {
      console.error('Error al cargar programas:', err);
      try {
        toast.error('No se pudo cargar la lista de programas', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validaciones
    if (!form.nombre.trim()) {
      setError('El nombre del curso es requerido');
      try {
        toast.warning('El nombre del curso es requerido', {
          title: 'Validación',
          duration: 6000,
        });
      } catch (_) {}
      setLoading(false);
      return;
    }
    if (!form.programa_id) {
      setError('Debe seleccionar un programa');
      try {
        toast.warning('Debe seleccionar un programa', {
          title: 'Validación',
          duration: 6000,
        });
      } catch (_) {}
      setLoading(false);
      return;
    }
    // Si el programa seleccionado tiene módulos, exigir que el curso seleccione uno
    const availableMods = modulos.filter(m => String(m.programa_id) === String(form.programa_id));
    if (availableMods.length > 0 && !form.modulo_id) {
      setError('Debe seleccionar un módulo del programa');
      try {
        toast.warning('Debe seleccionar un módulo del programa', {
          title: 'Validación',
          duration: 6000,
        });
      } catch (_) {}
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingCursoId 
        ? `${API_HOST}/admin/cursos/${editingCursoId}`
        : `${API_HOST}/admin/cursos`;
      
      const method = editingCursoId ? 'PUT' : 'POST';
      
      // Preparar datos para enviar
      const dataToSend = {
        ...form,
        duracion: form.duracion_horas || form.duracion,
        imagen: form.imagen || null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        // Crear/actualizar horario asociado para cursos normales (grupo CN{id})
        try {
          const courseId = editingCursoId ? editingCursoId : data.id;
          if (courseId && form.horario && form.horario.trim()) {
            const grupoCode = `CN${courseId}`;
            const areaNombre = `AREA: ${getProgramaName(form.programa_id)}`;
            const payload = {
              area: areaNombre,
              nombre_curso: form.nombre,
              dias: form.horario,
              grupo: grupoCode,
              modalidad: (form.modalidad || 'virtual').toUpperCase(),
              instructor: form.instructor || ''
            };

            if (!editingCursoId) {
              // Crear horario al crear curso
              const r = await fetch(`${API_BASE}/horarios`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });
              await r.json().catch(() => ({}));
            } else {
              // Upsert al actualizar: buscar por grupo CN{id}
              const listRes = await fetch(`${API_BASE}/horarios/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const horarios = await listRes.json().catch(() => []);
              const existente = Array.isArray(horarios) ? horarios.find(h => h.grupo === grupoCode) : null;
              if (existente) {
                const r = await fetch(`${API_BASE}/horarios/${existente.id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ ...payload, estado: 'activo' })
                });
                await r.json().catch(() => ({}));
              } else {
                const r = await fetch(`${API_BASE}/horarios`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(payload)
                });
                await r.json().catch(() => ({}));
              }
            }
          }
        } catch (e) {
          console.warn('Sincronización de horario falló:', e);
          try {
            toast.warning('No se pudo sincronizar el horario asociado', {
              title: 'Aviso',
              duration: 6000,
            });
          } catch (_) {}
        }

        setSuccess(editingCursoId ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');
        try {
          toast.success(editingCursoId ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente', {
            title: editingCursoId ? 'Actualización exitosa' : 'Creación exitosa',
            duration: 5000,
          });
        } catch (_) {}
        setForm({ 
          nombre: '', 
          descripcion: '', 
          duracion: '', 
          duracion_horas: '',
          modalidad: 'presencial', 
          programa_id: '', 
          precio: '', 
          estado: 'activo',
          horario: '',
          instructor: '',
          nivel: '',
          imagen: ''
        });
        setEditingCursoId(null);
        setShowModal(false);
        await fetchCursos();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al guardar curso');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
      try {
        toast.error(err.message || 'Error de conexión', {
          title: 'Error al guardar',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (curso) => {
    setForm({
      nombre: curso.nombre || '',
      descripcion: curso.descripcion || '',
      duracion: curso.duracion || '',
      duracion_horas: curso.duracion_horas || curso.duracion || '',
      modalidad: curso.modalidad || 'presencial',
      programa_id: curso.programa_id || '',
      modulo_id: curso.modulo_id || '', // NUEVO
      precio: curso.precio || '',
      estado: curso.estado || 'activo',
      horario: curso.horario || '',
      instructor: curso.instructor || '',
      nivel: curso.nivel || '',
      imagen: curso.imagen || ''
    });
    setEditingCursoId(curso.id);
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    const curso = cursos.find(c => c.id === id) || null;
    setCursoToDelete(curso || { id });
    setConfirmOpen(true);
  };

  const confirmDeleteCurso = async () => {
    if (!cursoToDelete?.id) {
      setConfirmOpen(false);
      return;
    }
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/cursos/${cursoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Curso eliminado exitosamente');
        try {
          toast.success('Curso eliminado correctamente', {
            title: 'Eliminación exitosa',
            duration: 5000,
          });
        } catch (_) {}
        await fetchCursos();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al eliminar curso');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
      try {
        toast.error(err.message || 'Error de conexión', {
          title: 'Error de eliminación',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setCursoToDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    return `${ASSET_BASE}${path.startsWith('/') ? path : '/' + path}`;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('imagen', file);
      const res = await fetch(`${API_HOST}/admin/cursos/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
      setForm(prev => ({ ...prev, imagen: data.imageUrl }));
      try {
        toast.success('Imagen subida exitosamente', { title: 'Subida de imagen' });
      } catch (_) {}
    } catch (err) {
      console.error('Upload error:', err);
      try {
        toast.error(err.message || 'No se pudo subir la imagen', { title: 'Error de subida' });
      } catch (_) {}
    }
  };

  const getProgramaName = (programaId) => {
    const programa = programas.find(p => p.id === programaId);
    return programa ? programa.nombre : 'Sin programa';
  };

  const fetchModulos = async (programaId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const url = programaId
        ? `${API_HOST}/admin/modulos?programa_id=${programaId}`
        : `${API_HOST}/admin/modulos`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setModulos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
      setModulos([]);
      try {
        toast.error('No se pudo cargar los módulos del programa', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const getModuloName = (moduloId) => {
    const m = modulos.find(mm => mm.id === moduloId);
    return m ? m.nombre : '—';
  };

  const filteredCursos = cursos.filter(curso => {
    const search = searchTerm.toLowerCase();
    return (
      curso.nombre?.toLowerCase().includes(search) ||
      curso.descripcion?.toLowerCase().includes(search) ||
      getProgramaName(curso.programa_id).toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900 block truncate max-w-[160px]" title={value}>{value}</span>
      )
    },
    {
      key: 'programa_id',
      header: 'Programa',
      render: (value, row) => (
        <span className="text-gray-600 block truncate max-w-[160px]" title={getProgramaName(value)}>{getProgramaName(value)}</span>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (value) => (
        <span className="text-gray-600 text-xs block truncate max-w-[220px]" title={value || 'Sin descripción'}>
          {value || 'Sin descripción'}
        </span>
      )
    },
    {
      key: 'duracion',
      header: 'Duración',
      render: (value) => (
        <span className="text-gray-600 text-xs">{value || 'No especificada'}</span>
      )
    },
    {
      key: 'modalidad',
      header: 'Modalidad',
      render: (value) => (
        <span className={`inline-flex px-1.5 py-0.5 text-[11px] font-semibold rounded-full ${
          value === 'presencial' ? 'bg-blue-100 text-blue-800' :
          value === 'virtual' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'precio',
      header: 'Precio',
      render: (value) => (
        <span className="text-gray-900 font-medium text-sm">
          {value ? `S/ ${parseFloat(value).toFixed(2)}` : 'Gratuito'}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value) => (
        <span className={`inline-flex px-1.5 py-0.5 text-[11px] font-semibold rounded-full ${
          value === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'modulo_id',
      header: 'Módulo',
      render: (value) => <span className="text-gray-600 block truncate max-w-[140px]" title={getModuloName(value)}>{getModuloName(value)}</span>
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={32} />
            Gestión de Cursos
          </h1>
          <p className="text-gray-600 mt-1">Administra los cursos del sistema</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setForm({ 
              nombre: '', 
              descripcion: '', 
              duracion: '', 
              duracion_horas: '',
              modalidad: 'presencial', 
              programa_id: '', 
              precio: '', 
              estado: 'activo',
              horario: '',
              instructor: '',
              nivel: ''
            });
            setEditingCursoId(null);
            setShowModal(true);
            setError(null);
            setSuccess(null);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Curso
        </motion.button>
      </div>

      {/* Alertas */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3"
        >
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3"
        >
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-600">{success}</p>
        </motion.div>
      )}

      {/* Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o programa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filteredCursos}
        loading={loading}
        emptyMessage="No hay cursos registrados"
        onEdit={handleEdit}
        onDelete={handleDelete}
        dense={true}
      />

      {/* Modal de Formulario */}
      <AdminFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setForm({ 
            nombre: '', 
            descripcion: '', 
            duracion: '', 
            duracion_horas: '',
            modalidad: 'presencial', 
            programa_id: '', 
            precio: '', 
            estado: 'activo',
            horario: '',
            instructor: '',
            nivel: '',
            imagen: ''
          });
          setEditingCursoId(null);
          setError(null);
        }}
        title={editingCursoId ? 'Editar Curso' : 'Nuevo Curso'}
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Guardando...' : editingCursoId ? 'Actualizar' : 'Crear'}
        loading={loading}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Programa"
              name="programa_id"
              type="select"
              value={form.programa_id}
              onChange={(e) => {
                setForm(prev => ({ ...prev, programa_id: e.target.value, modulo_id: '' }));
              }}
              required
              options={[
                { value: '', label: 'Seleccionar programa' },
                ...programas.map(p => ({ value: p.id, label: p.nombre }))
              ]}
            />
            {/* NUEVO: selector de módulo */}
            <FormField
              label="Módulo"
              name="modulo_id"
              type="select"
              value={form.modulo_id}
              onChange={(e) => setForm(prev => ({ ...prev, modulo_id: e.target.value }))}
              disabled={!form.programa_id || modulos.length === 0}
              required={modulos.filter(m => String(m.programa_id) === String(form.programa_id)).length > 0}
              options={[
                { value: '', label: modulos.length ? 'Seleccionar módulo' : 'Seleccione primero un programa' },
                ...modulos
                  .filter(m => String(m.programa_id) === String(form.programa_id))
                  .map(m => ({ value: m.id, label: `${m.numero ? `${m.numero}. ` : ''}${m.nombre}` }))
              ]}
            />
          </div>

          <FormField
            label="Nombre del Curso"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Microsoft Word"
            required
          />

          {/* Imagen del curso (opcional) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del curso (opcional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-900 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vista previa</label>
              <div className="flex items-center gap-4">
                <img
                  src={resolveImageUrl(form.imagen) || logoFallback}
                  alt="Imagen del curso"
                  className="w-24 h-24 rounded-md object-cover border"
                />
                <div className="text-xs text-gray-500">
                  <p>Si no subes imagen, se mostrará el logo de INFOUNA por defecto.</p>
                </div>
              </div>
            </div>
          </div>

          <FormField
            label="Descripción"
            name="descripcion"
            type="textarea"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción detallada del curso..."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Duración"
              name="duracion_horas"
              value={form.duracion_horas}
              onChange={handleChange}
              placeholder="Ej: 40 horas"
            />
            
            <FormField
              label="Modalidad"
              name="modalidad"
              type="select"
              value={form.modalidad}
              onChange={handleChange}
              options={[
                { value: 'presencial', label: 'Presencial' },
                { value: 'virtual', label: 'Virtual' },
                { value: 'hibrido', label: 'Híbrido' }
              ]}
            />
            
            <FormField
              label="Precio (S/)"
              name="precio"
              type="number"
              value={form.precio}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Plantilla de horario"
              name="preset_horario"
              type="select"
              value={''}
              onChange={(e) => aplicarPresetHorario(e.target.value)}
              options={[
                { value: '', label: 'Seleccionar plantilla' },
                ...horarioPresets.map(p => ({ value: p.id, label: p.label }))
              ]}
            />
            <FormField
              label="Horario"
              name="horario"
              value={form.horario}
              onChange={handleChange}
              placeholder="Ej: LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]"
            />
            
            <FormField
              label="Instructor"
              name="instructor"
              value={form.instructor}
              onChange={handleChange}
              placeholder="Nombre del instructor"
            />
          
            <FormField
              label="Nivel"
              name="nivel"
              type="select"
              value={form.nivel}
              onChange={handleChange}
              options={[
                { value: '', label: 'Seleccionar nivel' },
                { value: 'basico', label: 'Básico' },
                { value: 'intermedio', label: 'Intermedio' },
                { value: 'avanzado', label: 'Avanzado' }
              ]}
            />
          </div>

          <FormField
            label="Estado"
            name="estado"
            type="select"
            value={form.estado}
            onChange={handleChange}
            options={[
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' }
            ]}
          />
        </div>
      </AdminFormModal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setCursoToDelete(null);
          }
        }}
        onConfirm={confirmDeleteCurso}
        title="Confirmar eliminación"
        message={`Se eliminará el curso${cursoToDelete?.nombre ? ` "${cursoToDelete.nombre}"` : ''}. Esta acción no se puede deshacer.
¿Deseas continuar?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Cursos;

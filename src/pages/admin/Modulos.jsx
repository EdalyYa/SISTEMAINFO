import React, { useEffect, useState } from 'react';
import { API_HOST } from '../../config/api';
import { Plus, Puzzle, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminTable from '../../components/admin/AdminTable';
import AdminFormModal from '../../components/admin/AdminFormModal';
import FormField from '../../components/admin/FormField';
import { useToast, ConfirmModal } from '../../components/ui';

function ModulosAdmin() {
  const toast = useToast();
  const [modulos, setModulos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [programaFiltro, setProgramaFiltro] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [moduloToDelete, setModuloToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    numero: '',
    programa_id: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchProgramas();
  }, []);

  useEffect(() => {
    fetchModulos(programaFiltro);
  }, [programaFiltro]);

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  const fetchModulos = async (programaId) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const url = programaId ? `${API_HOST}/admin/modulos?programa_id=${programaId}` : `${API_HOST}/admin/modulos`;
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
      setModulos(data);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
      setError('Error al cargar módulos');
      try {
        toast.error('No se pudo cargar los módulos', {
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
      const token = getAuthToken();
      const res = await fetch(`${API_HOST}/admin/programas`, {
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
      setProgramas(data);
    } catch (err) {
      console.error('Error al cargar programas:', err);
      setError('Error al cargar programas');
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
    try {
      setLoading(true);
      setError(null);
      // Validaciones básicas
      if (!form.nombre.trim()) {
        setError('El nombre del módulo es requerido');
        try {
          toast.warning('El nombre del módulo es requerido', {
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
      const token = getAuthToken();
      const url = editingId
        ? `${API_HOST}/admin/modulos/${editingId}`
        : `${API_HOST}/admin/modulos`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar módulo');
      setSuccess(editingId ? 'Módulo actualizado' : 'Módulo creado');
      try {
        toast.success(editingId ? 'Módulo actualizado' : 'Módulo creado', {
          title: editingId ? 'Actualización exitosa' : 'Creación exitosa',
          duration: 5000,
        });
      } catch (_) {}
      setShowModal(false);
      setEditingId(null);
      setForm({ nombre: '', descripcion: '', numero: '', programa_id: '', estado: 'activo' });
      await fetchModulos(programaFiltro);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
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

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      nombre: row.nombre || '',
      descripcion: row.descripcion || '',
      numero: row.numero || '',
      programa_id: row.programa_id || '',
      estado: row.estado || 'activo'
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = (id) => {
    const modulo = modulos.find(m => m.id === id) || null;
    setModuloToDelete(modulo || { id });
    setConfirmOpen(true);
  };

  const confirmDeleteModulo = async () => {
    if (!moduloToDelete?.id) {
      setConfirmOpen(false);
      return;
    }
    try {
      setDeleting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_HOST}/admin/modulos/${moduloToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      try {
        toast.success('Módulo eliminado correctamente', {
          title: 'Eliminación exitosa',
          duration: 5000,
        });
      } catch (_) {}
      await fetchModulos(programaFiltro);
    } catch (err) {
      console.error(err);
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
      setModuloToDelete(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getProgramaName = (id) => programas.find(p => p.id === id)?.nombre || '—';

  const filtered = modulos.filter(m => {
    const s = searchTerm.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(s) ||
      m.numero?.toLowerCase().includes(s) ||
      getProgramaName(m.programa_id).toLowerCase().includes(s)
    );
  });

  const columns = [
    { key: 'nombre', header: 'Nombre', render: v => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'numero', header: 'Número', render: v => <span className="text-gray-700">{v || '—'}</span> },
    { key: 'programa_id', header: 'Programa', render: (v) => <span className="text-gray-700">{getProgramaName(v)}</span> },
    { key: 'estado', header: 'Estado', render: v => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${v === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{v}</span>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Puzzle className="text-blue-600" size={32} />
            Gestión de Módulos
          </h1>
          <p className="text-gray-600 mt-2">Administra los módulos de los Programas INFOUNA</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setForm({ nombre: '', descripcion: '', numero: '', programa_id: '', estado: 'activo' });
            setEditingId(null);
            setShowModal(true);
            setError(null);
            setSuccess(null);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Módulo
        </motion.button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-600">{success}</p>
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, número o programa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <FormField
              label="Filtrar por programa"
              name="programaFiltro"
              type="select"
              value={programaFiltro}
              onChange={(e) => setProgramaFiltro(e.target.value)}
              options={[{ value: '', label: 'Todos los programas' }, ...programas.map(p => ({ value: String(p.id), label: p.nombre }))]}
            />
          </div>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay módulos registrados"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AdminFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setForm({ nombre: '', descripcion: '', numero: '', programa_id: '', estado: 'activo' });
          setEditingId(null);
          setError(null);
        }}
        title={editingId ? 'Editar Módulo' : 'Nuevo Módulo'}
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
        loading={loading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nombre del Módulo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Módulo I Especialista en Ofimática"
            />
            <FormField
              label="Programa"
              name="programa_id"
              type="select"
              value={form.programa_id}
              onChange={handleChange}
              required
              options={[{ value: '', label: 'Seleccionar programa' }, ...programas.map(p => ({ value: p.id, label: p.nombre }))]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Número"
              name="numero"
              type="select"
              value={form.numero}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sin número' },
                { value: 'I', label: 'Módulo I' },
                { value: 'II', label: 'Módulo II' },
                { value: 'III', label: 'Módulo III' },
                { value: 'IV', label: 'Módulo IV' },
                { value: 'V', label: 'Módulo V' },
                { value: 'VI', label: 'Módulo VI' },
                { value: 'VII', label: 'Módulo VII' },
                { value: 'VIII', label: 'Módulo VIII' },
                { value: 'IX', label: 'Módulo IX' },
                { value: 'X', label: 'Módulo X' },
                { value: 'XI', label: 'Módulo XI' },
                { value: 'XII', label: 'Módulo XII' },
                { value: 'XIII', label: 'Módulo XIII' },
                { value: 'XIV', label: 'Módulo XIV' },
                { value: 'XV', label: 'Módulo XV' },
                { value: 'XVI', label: 'Módulo XVI' },
                { value: 'XVII', label: 'Módulo XVII' },
                { value: 'XVIII', label: 'Módulo XVIII' },
                { value: 'XIX', label: 'Módulo XIX' },
                { value: 'XX', label: 'Módulo XX' },
              ]}
            />
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

          <FormField
            label="Descripción"
            name="descripcion"
            type="textarea"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción del módulo..."
          />
        </div>
      </AdminFormModal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setModuloToDelete(null);
          }
        }}
        onConfirm={confirmDeleteModulo}
        title="Confirmar eliminación"
        message={`Se eliminará el módulo${moduloToDelete?.nombre ? ` "${moduloToDelete.nombre}"` : ''}. Esta acción es permanente.
¿Deseas continuar?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default ModulosAdmin;

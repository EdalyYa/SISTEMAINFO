import React, { useState, useEffect } from 'react';
import { API_HOST } from '../../config/api';
import { ConfirmModal, useToast } from '../../components/ui';
import { Plus, AlertTriangle, Search, AlertCircle, CheckCircle, User, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminTable from '../../components/admin/AdminTable';
import AdminFormModal from '../../components/admin/AdminFormModal';
import FormField from '../../components/admin/FormField';

function Reclamaciones() {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [reclamaciones, setReclamaciones] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReclamacion, setEditingReclamacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    usuario_id: '',
    tipo: '',
    descripcion: '',
    estado: 'pendiente'
  });

  useEffect(() => {
    fetchReclamaciones();
    fetchUsers();
  }, []);

  const fetchReclamaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/reclamaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReclamaciones(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar reclamaciones');
      }
    } catch (error) {
      console.error('Error fetching reclamaciones:', error);
      setError(error.message || 'Error al cargar las reclamaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validaciones
    if (!formData.usuario_id) {
      setError('Debe seleccionar un usuario');
      setLoading(false);
      return;
    }
    if (!formData.tipo) {
      setError('Debe seleccionar un tipo de reclamación');
      setLoading(false);
      return;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingReclamacion 
        ? `${API_HOST}/admin/reclamaciones/${editingReclamacion.id}`
        : `${API_HOST}/admin/reclamaciones`;
      
      const method = editingReclamacion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingReclamacion ? 'Reclamación actualizada exitosamente' : 'Reclamación creada exitosamente');
        setShowModal(false);
        setEditingReclamacion(null);
        setFormData({ usuario_id: '', tipo: '', descripcion: '', estado: 'pendiente' });
        await fetchReclamaciones();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al procesar la reclamación');
      }
    } catch (error) {
      console.error('Error submitting reclamación:', error);
      setError(error.message || 'Error al procesar la reclamación');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reclamacion) => {
    setEditingReclamacion(reclamacion);
    setFormData({
      usuario_id: reclamacion.usuario_id || '',
      tipo: reclamacion.tipo || '',
      descripcion: reclamacion.descripcion || '',
      estado: reclamacion.estado || 'pendiente'
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reclamacionToDelete, setReclamacionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    const r = reclamaciones.find(x => x.id === id) || { id };
    setReclamacionToDelete(r);
    setConfirmOpen(true);
  };

  const confirmDeleteReclamacion = async () => {
    if (!reclamacionToDelete?.id) { setConfirmOpen(false); return; }
    
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/reclamaciones/${reclamacionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccess('Reclamación eliminada exitosamente');
        try { toast.success('Reclamación eliminada', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
        await fetchReclamaciones();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al eliminar la reclamación');
      }
    } catch (error) {
      console.error('Error deleting reclamación:', error);
      setError(error.message || 'Error al eliminar la reclamación');
      try { toast.error(error.message || 'Error al eliminar', { title: 'Error', duration: 6000 }); } catch(_){}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setReclamacionToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getUsuarioName = (usuarioId) => {
    const user = users.find(u => u.id === usuarioId);
    return user ? (user.full_name || user.name || user.username || 'Usuario no encontrado') : 'Usuario no encontrado';
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'en proceso': 'bg-blue-100 text-blue-800',
      'resuelto': 'bg-green-100 text-green-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const filteredReclamaciones = reclamaciones.filter(reclamacion => {
    const search = searchTerm.toLowerCase();
    return (
      getUsuarioName(reclamacion.usuario_id).toLowerCase().includes(search) ||
      reclamacion.tipo?.toLowerCase().includes(search) ||
      reclamacion.descripcion?.toLowerCase().includes(search) ||
      reclamacion.estado?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: 'usuario_id',
      header: 'Usuario',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="text-gray-400" size={16} />
          <span className="font-medium text-gray-900">{getUsuarioName(value)}</span>
        </div>
      )
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (value) => (
        <span className="text-gray-900">{value || 'Sin tipo'}</span>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (value) => (
        <span className="text-gray-600 text-sm max-w-xs truncate block" title={value}>
          {value || 'Sin descripción'}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'creado_en',
      header: 'Fecha',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={16} />
          <span className="text-gray-600 text-sm">
            {value ? new Date(value).toLocaleDateString('es-PE') : 'Sin fecha'}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="text-blue-600" size={32} />
            Gestión de Reclamaciones
          </h1>
          <p className="text-gray-600 mt-2">Administra las reclamaciones del sistema</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingReclamacion(null);
            setFormData({ usuario_id: '', tipo: '', descripcion: '', estado: 'pendiente' });
            setShowModal(true);
            setError(null);
            setSuccess(null);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nueva Reclamación
        </motion.button>
      </div>

      {/* Alertas */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-600">{success}</p>
        </motion.div>
      )}

      {/* Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por usuario, tipo, descripción o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filteredReclamaciones}
        loading={loading}
        emptyMessage="No hay reclamaciones registradas"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <AdminFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingReclamacion(null);
          setFormData({ usuario_id: '', tipo: '', descripcion: '', estado: 'pendiente' });
          setError(null);
        }}
        title={editingReclamacion ? 'Editar Reclamación' : 'Nueva Reclamación'}
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Guardando...' : editingReclamacion ? 'Actualizar' : 'Crear'}
        loading={loading}
        size="md"
      >
        <div className="space-y-4">
          <FormField
            label="Usuario"
            name="usuario_id"
            type="select"
            value={formData.usuario_id}
            onChange={handleInputChange}
            required
            options={[
              { value: '', label: 'Seleccionar usuario' },
              ...users.map(user => ({ 
                value: user.id, 
                label: `${user.full_name || user.name || user.username} (${user.email || user.username})` 
              }))
            ]}
          />
          
          <FormField
            label="Tipo de Reclamación"
            name="tipo"
            type="select"
            value={formData.tipo}
            onChange={handleInputChange}
            required
            options={[
              { value: '', label: 'Seleccionar tipo' },
              { value: 'Académica', label: 'Académica' },
              { value: 'Administrativa', label: 'Administrativa' },
              { value: 'Técnica', label: 'Técnica' },
              { value: 'Financiera', label: 'Financiera' },
              { value: 'Otra', label: 'Otra' }
            ]}
          />
          
          <FormField
            label="Descripción"
            name="descripcion"
            type="textarea"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Describe la reclamación en detalle..."
          />
          
          <FormField
            label="Estado"
            name="estado"
            type="select"
            value={formData.estado}
            onChange={handleInputChange}
            options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'en proceso', label: 'En Proceso' },
              { value: 'resuelto', label: 'Resuelto' }
            ]}
          />
        </div>
      </AdminFormModal>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { if (!deleting) { setConfirmOpen(false); setReclamacionToDelete(null); } }}
        onConfirm={confirmDeleteReclamacion}
        title="Confirmar eliminación"
        message={`Se eliminará la reclamación${reclamacionToDelete ? ` del usuario "${getUsuarioName(reclamacionToDelete.usuario_id)}"` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Reclamaciones;

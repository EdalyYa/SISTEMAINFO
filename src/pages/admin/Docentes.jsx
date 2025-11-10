import React, { useState, useEffect } from 'react';
import { useToast, ConfirmModal } from '../../components/ui';
import { Plus, GraduationCap, Search, AlertCircle, CheckCircle, Mail, Phone, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminTable from '../../components/admin/AdminTable';
import AdminFormModal from '../../components/admin/AdminFormModal';
import FormField from '../../components/admin/FormField';

function Docentes() {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDocenteId, setEditingDocenteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    grado_academico: '',
    experiencia: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchDocentes();
  }, []);

  const fetchDocentes = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/admin/docentes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocentes(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar docentes');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validaciones
    if (!form.nombre.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }
    if (!form.apellido.trim()) {
      setError('El apellido es requerido');
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError('El email es requerido');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingDocenteId 
        ? `http://localhost:4001/admin/docentes/${editingDocenteId}`
        : 'http://localhost:4001/admin/docentes';
      
      const method = editingDocenteId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingDocenteId ? 'Docente actualizado exitosamente' : 'Docente creado exitosamente');
        setForm({ nombre: '', apellido: '', email: '', telefono: '', especialidad: '', grado_academico: '', experiencia: '', estado: 'activo' });
        setEditingDocenteId(null);
        setShowModal(false);
        await fetchDocentes();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al guardar docente');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (docente) => {
    setForm({
      nombre: docente.nombre || '',
      apellido: docente.apellido || '',
      email: docente.email || '',
      telefono: docente.telefono || '',
      especialidad: docente.especialidad || '',
      grado_academico: docente.grado_academico || '',
      experiencia: docente.experiencia || '',
      estado: docente.estado || 'activo'
    });
    setEditingDocenteId(docente.id);
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [docenteToDelete, setDocenteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    const d = docentes.find(x => x.id === id);
    setDocenteToDelete(d || { id });
    setConfirmOpen(true);
  };

  const confirmDeleteDocente = async () => {
    if (!docenteToDelete?.id) { setConfirmOpen(false); return; }
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4001/admin/docentes/${docenteToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccess('Docente eliminado exitosamente');
        try { toast.success('Docente eliminado', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
        await fetchDocentes();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al eliminar docente');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
      try { toast.error(err.message || 'Error al eliminar', { title: 'Error', duration: 6000 }); } catch(_){}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDocenteToDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const filteredDocentes = docentes.filter(docente => {
    const search = searchTerm.toLowerCase();
    const nombreCompleto = `${docente.nombre || ''} ${docente.apellido || ''}`.toLowerCase();
    return (
      nombreCompleto.includes(search) ||
      docente.email?.toLowerCase().includes(search) ||
      docente.especialidad?.toLowerCase().includes(search) ||
      docente.grado_academico?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre Completo',
      render: (value, row) => (
        <span className="font-medium text-gray-900">
          {value} {row.apellido || ''}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="text-gray-400" size={16} />
          <span className="text-gray-600">{value || 'Sin email'}</span>
        </div>
      )
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="text-gray-400" size={16} />
          <span className="text-gray-600">{value || 'No especificado'}</span>
        </div>
      )
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: (value) => (
        <span className="text-gray-600">{value || 'No especificada'}</span>
      )
    },
    {
      key: 'grado_academico',
      header: 'Grado Académico',
      render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {value || 'No especificado'}
        </span>
      )
    },
    {
      key: 'experiencia',
      header: 'Experiencia',
      render: (value) => (
        <span className="text-gray-600">{value || 'No especificada'}</span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-3 p-3 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} />
            Gestión de Docentes
          </h1>
          <p className="text-gray-600 mt-1">Administra los docentes del sistema</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setForm({ nombre: '', apellido: '', email: '', telefono: '', especialidad: '', grado_academico: '', experiencia: '', estado: 'activo' });
            setEditingDocenteId(null);
            setShowModal(true);
            setError(null);
            setSuccess(null);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Docente
        </motion.button>
      </div>

      {/* Alertas */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
        >
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
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
            placeholder="Buscar por nombre, email, especialidad o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filteredDocentes}
        loading={loading}
        emptyMessage="No hay docentes registrados"
        onEdit={handleEdit}
        onDelete={handleDelete}
        dense={true}
      />

      {/* Modal de Formulario */}
      <AdminFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setForm({ nombre: '', apellido: '', email: '', telefono: '', especialidad: '', grado_academico: '', experiencia: '', estado: 'activo' });
          setEditingDocenteId(null);
          setError(null);
        }}
        title={editingDocenteId ? 'Editar Docente' : 'Nuevo Docente'}
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Guardando...' : editingDocenteId ? 'Actualizar' : 'Crear'}
        loading={loading}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Juan"
            />
            
            <FormField
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              placeholder="Pérez"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="juan.perez@ejemplo.com"
            />
            
            <FormField
              label="Teléfono"
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              placeholder="987654321"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Especialidad"
              name="especialidad"
              value={form.especialidad}
              onChange={handleChange}
              placeholder="Informática"
            />
            
            <FormField
              label="Grado Académico"
              name="grado_academico"
              type="select"
              value={form.grado_academico}
              onChange={handleChange}
              options={[
                { value: '', label: 'Seleccionar grado' },
                { value: 'Bachiller', label: 'Bachiller' },
                { value: 'Licenciado', label: 'Licenciado' },
                { value: 'Magister', label: 'Magíster' },
                { value: 'Doctor', label: 'Doctor' }
              ]}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Experiencia"
              name="experiencia"
              value={form.experiencia}
              onChange={handleChange}
              placeholder="Ej: 5 años, etc."
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
        </div>
      </AdminFormModal>
      <ConfirmModal
      isOpen={confirmOpen}
      onClose={() => { if (!deleting) { setConfirmOpen(false); setDocenteToDelete(null); } }}
      onConfirm={confirmDeleteDocente}
      title="Confirmar eliminación"
      message={`Se eliminará el docente${docenteToDelete?.nombre ? ` "${docenteToDelete.nombre} ${docenteToDelete.apellido || ''}"` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      loading={deleting}
    />
    </div>
  );
}

export default Docentes;

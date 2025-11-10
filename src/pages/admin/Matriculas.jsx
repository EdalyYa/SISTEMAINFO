import React, { useState, useEffect } from 'react';
import { ConfirmModal, useToast } from '../../components/ui';
import { Plus, FileText, Search, AlertCircle, CheckCircle, User, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminTable from '../../components/admin/AdminTable';
import AdminFormModal from '../../components/admin/AdminFormModal';
import FormField from '../../components/admin/FormField';

function Matriculas() {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMatriculaId, setEditingMatriculaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    usuario_id: '',
    curso_id: '',
    fecha_matricula: '',
    estado: 'activo'
  });
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    fetchMatriculas();
    fetchUsuarios();
    fetchCursos();
  }, []);

  const fetchMatriculas = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/admin/matriculas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatriculas(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar matrículas');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Error fetching usuarios:', err);
    }
  };

  const fetchCursos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/admin/cursos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      }
    } catch (err) {
      console.error('Error fetching cursos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validaciones
    if (!form.usuario_id) {
      setError('Debe seleccionar un usuario');
      setLoading(false);
      return;
    }
    if (!form.curso_id) {
      setError('Debe seleccionar un curso');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingMatriculaId 
        ? `http://localhost:4001/admin/matriculas/${editingMatriculaId}`
        : 'http://localhost:4001/admin/matriculas';
      
      const method = editingMatriculaId ? 'PUT' : 'POST';
      
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
        setSuccess(editingMatriculaId ? 'Matrícula actualizada exitosamente' : 'Matrícula creada exitosamente');
        setForm({ usuario_id: '', curso_id: '', fecha_matricula: '', estado: 'activo' });
        setEditingMatriculaId(null);
        setShowModal(false);
        await fetchMatriculas();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al guardar matrícula');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (matricula) => {
    setForm({
      usuario_id: matricula.usuario_id || '',
      curso_id: matricula.curso_id || '',
      fecha_matricula: matricula.fecha_matricula ? matricula.fecha_matricula.split('T')[0] : '',
      estado: matricula.estado || 'activo'
    });
    setEditingMatriculaId(matricula.id);
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [matriculaToDelete, setMatriculaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    const m = matriculas.find(x => x.id === id) || { id };
    setMatriculaToDelete(m);
    setConfirmOpen(true);
  };

  const confirmDeleteMatricula = async () => {
    if (!matriculaToDelete?.id) { setConfirmOpen(false); return; }
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4001/admin/matriculas/${matriculaToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccess('Matrícula eliminada exitosamente');
        try { toast.success('Matrícula eliminada', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
        await fetchMatriculas();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Error al eliminar matrícula');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión');
      try { toast.error(err.message || 'Error al eliminar', { title: 'Error', duration: 6000 }); } catch(_){}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setMatriculaToDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const getUsuarioName = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? (usuario.full_name || usuario.username || 'Usuario no encontrado') : 'Usuario no encontrado';
  };

  const getCursoName = (cursoId) => {
    const curso = cursos.find(c => c.id === cursoId);
    return curso ? curso.nombre : 'Curso no encontrado';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const filteredMatriculas = matriculas.filter(matricula => {
    const search = searchTerm.toLowerCase();
    return (
      getUsuarioName(matricula.usuario_id).toLowerCase().includes(search) ||
      getCursoName(matricula.curso_id).toLowerCase().includes(search) ||
      matricula.estado?.toLowerCase().includes(search)
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
      key: 'curso_id',
      header: 'Curso',
      render: (value) => (
        <div className="flex items-center gap-2">
          <BookOpen className="text-gray-400" size={16} />
          <span className="text-gray-600">{getCursoName(value)}</span>
        </div>
      )
    },
    {
      key: 'fecha_matricula',
      header: 'Fecha Matrícula',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={16} />
          <span className="text-gray-600">{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'activo' ? 'bg-green-100 text-green-800' :
          value === 'completado' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            Gestión de Matrículas
          </h1>
          <p className="text-gray-600 mt-2">Administra las matrículas del sistema</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setForm({ usuario_id: '', curso_id: '', fecha_matricula: '', estado: 'activo' });
            setEditingMatriculaId(null);
            setShowModal(true);
            setError(null);
            setSuccess(null);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nueva Matrícula
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
            placeholder="Buscar por usuario, curso o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filteredMatriculas}
        loading={loading}
        emptyMessage="No hay matrículas registradas"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <AdminFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setForm({ usuario_id: '', curso_id: '', fecha_matricula: '', estado: 'activo' });
          setEditingMatriculaId(null);
          setError(null);
        }}
        title={editingMatriculaId ? 'Editar Matrícula' : 'Nueva Matrícula'}
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Guardando...' : editingMatriculaId ? 'Actualizar' : 'Crear'}
        loading={loading}
      >
        <div className="space-y-4">
          <FormField
            label="Usuario"
            name="usuario_id"
            type="select"
            value={form.usuario_id}
            onChange={handleChange}
            required
            options={[
              { value: '', label: 'Seleccionar usuario' },
              ...usuarios.map(u => ({ 
                value: u.id, 
                label: `${u.full_name || u.name || u.username} (${u.email || u.username})` 
              }))
            ]}
          />
          
          <FormField
            label="Curso"
            name="curso_id"
            type="select"
            value={form.curso_id}
            onChange={handleChange}
            required
            options={[
              { value: '', label: 'Seleccionar curso' },
              ...cursos.map(c => ({ value: c.id, label: c.nombre }))
            ]}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Fecha de Matrícula"
              name="fecha_matricula"
              type="date"
              value={form.fecha_matricula}
              onChange={handleChange}
            />
            
            <FormField
              label="Estado"
              name="estado"
              type="select"
              value={form.estado}
              onChange={handleChange}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'completado', label: 'Completado' },
                { value: 'cancelado', label: 'Cancelado' }
              ]}
            />
          </div>
        </div>
      </AdminFormModal>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { if (!deleting) { setConfirmOpen(false); setMatriculaToDelete(null); } }}
        onConfirm={confirmDeleteMatricula}
        title="Confirmar eliminación"
        message={`Se eliminará la matrícula${matriculaToDelete ? ` (Usuario: ${getUsuarioName(matriculaToDelete.usuario_id)}, Curso: ${getCursoName(matriculaToDelete.curso_id)})` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Matriculas;

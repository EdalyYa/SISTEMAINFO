import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { FaClock, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaCalendarAlt, FaDesktop, FaUsers, FaGraduationCap, FaSave, FaTimes } from 'react-icons/fa';
import { useToast, ConfirmModal } from '../../components/ui';

const HorariosAdmin = () => {
  const toast = useToast();
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [filterTipo, setFilterTipo] = useState(''); // normal|libre
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  // Confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  

  const [formData, setFormData] = useState({
    nombre_curso: '',
    dias: '',
    grupo: '',
    modalidad: 'VIRTUAL',
    instructor: '',
    estado: 'activo'
  });

  // Cargar horarios
  const fetchHorarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE}/horarios/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al cargar horarios');
      const data = await response.json();
      setHorarios(data);
    } catch (error) {
      setError('Error al cargar los horarios: ' + error.message);
      try {
        toast.error('No se pudo cargar los horarios', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  // Filtrar horarios
  const filteredHorarios = horarios.filter(horario => {
    const matchesSearch = horario.nombre_curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         horario.grupo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         horario.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModalidad = !filterModalidad || horario.modalidad === filterModalidad;
    const tipo = horario.grupo?.startsWith('CL') ? 'libre' : (horario.grupo?.startsWith('CN') ? 'normal' : '');
    const matchesTipo = !filterTipo || tipo === filterTipo;
    
    return matchesSearch && matchesModalidad && matchesTipo;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingHorario(null);
    setFormData({
      nombre_curso: '',
      dias: '',
      grupo: '',
      modalidad: 'VIRTUAL',
      instructor: '',
      estado: 'activo'
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      nombre_curso: horario.nombre_curso,
      dias: horario.dias,
      grupo: horario.grupo,
      modalidad: horario.modalidad,
      instructor: horario.instructor || '',
      estado: horario.estado
    });
    setShowModal(true);
  };

  // Guardar horario (crear o actualizar)
  const handleSave = async () => {
    try {
      // Validaciones básicas
      if (!formData.nombre_curso.trim()) {
        try {
          toast.warning('El nombre del curso es requerido', {
            title: 'Validación',
            duration: 6000,
          });
        } catch (_) {}
        return;
      }
      if (!formData.dias.trim()) {
        try {
          toast.warning('Los días y horario son requeridos', {
            title: 'Validación',
            duration: 6000,
          });
        } catch (_) {}
        return;
      }
      if (!formData.grupo.trim()) {
        try {
          toast.warning('El grupo es requerido', {
            title: 'Validación',
            duration: 6000,
          });
        } catch (_) {}
        return;
      }
      const url = editingHorario 
        ? `${API_BASE}/horarios/${editingHorario.id}`
        : `${API_BASE}/horarios`;
      
      const method = editingHorario ? 'PUT' : 'POST';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar horario');
      }

      await fetchHorarios();
      setShowModal(false);
      setError('');
      try {
        toast.success(editingHorario ? 'Horario actualizado' : 'Horario creado', {
          title: editingHorario ? 'Actualización exitosa' : 'Creación exitosa',
          duration: 5000,
        });
      } catch (_) {}
    } catch (error) {
      setError(error.message);
      try {
        toast.error(error.message || 'Error al guardar horario', {
          title: 'Error al guardar',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  // Eliminar horario
  const handleDelete = (horario) => {
    setHorarioToDelete(horario);
    setConfirmOpen(true);
  };

  const confirmDeleteHorario = async () => {
    if (!horarioToDelete) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE}/horarios/${horarioToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar horario');
      }

      await fetchHorarios();
      try {
        toast.success('Horario eliminado correctamente', {
          title: 'Eliminación exitosa',
          duration: 5000,
        });
      } catch (_) {}
    } catch (error) {
      setError('Error al eliminar horario: ' + error.message);
      try {
        toast.error(error.message || 'Error al eliminar horario', {
          title: 'Error de eliminación',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setDeleting(false);
      setHorarioToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaClock className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Administración de Horarios</h1>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Nuevo Horario
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar curso, grupo o instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterModalidad}
            onChange={(e) => setFilterModalidad(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las modalidades</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="PRESENCIAL">Presencial</option>
          </select>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="normal">Cursos normales (CN)</option>
            <option value="libre">Cursos libres (CL)</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredHorarios.length} horarios
          </div>
        </div>
      </div>

      {/* Tabla de horarios */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
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
              {filteredHorarios.map((horario) => (
                <tr key={horario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {horario.nombre_curso}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {horario.dias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {horario.grupo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {horario.grupo?.startsWith('CL') ? 'Curso Libre' : (horario.grupo?.startsWith('CN') ? 'Curso Normal' : '—')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      horario.modalidad === 'VIRTUAL' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {horario.modalidad === 'VIRTUAL' ? <FaDesktop className="mr-1" /> : <FaUsers className="mr-1" />}
                      {horario.modalidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {horario.instructor || 'No asignado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      horario.estado === 'activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {horario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(horario)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(horario)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmación de eliminación */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeleteHorario}
        title="Eliminar horario"
        message={horarioToDelete ? `Se eliminará el horario de "${horarioToDelete.nombre_curso}" del grupo "${horarioToDelete.grupo}".\n\nEsta acción no se puede deshacer.` : 'Esta acción no se puede deshacer.'}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingHorario ? 'Editar Horario' : 'Nuevo Horario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  name="nombre_curso"
                  value={formData.nombre_curso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días y Horario *
                </label>
                <input
                  type="text"
                  name="dias"
                  value={formData.dias}
                  onChange={handleInputChange}
                  placeholder="Ej: LUN-MIE-VIE [ 7:00 pm.-9:00 pm. ]"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo *
                </label>
                <input
                  type="text"
                  name="grupo"
                  value={formData.grupo}
                  onChange={handleInputChange}
                  placeholder="Ej: TC1, MW2, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="VIRTUAL">Virtual</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaSave /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosAdmin;

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaSearch, FaFilter } from 'react-icons/fa';
import { API_BASE } from '../../config/api';
import { useToast, ConfirmModal } from '../../components/ui';

const CursosLibresAdmin = () => {
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cursoLibreToDelete, setCursoLibreToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Plantillas de horario propuestas (cursos libres)
  const horarioPresets = [
    { id: 'LMV_MANANA', label: 'LUN-MIE-VIE · Mañana', dias: 'LUN-MIE-VIE', rango: '8:00 am.-12:00 pm.' },
    { id: 'LMV_TARDE', label: 'LUN-MIE-VIE · Tarde', dias: 'LUN-MIE-VIE', rango: '4:00 pm.-7:00 pm.' },
    { id: 'LMV_NOCHE', label: 'LUN-MIE-VIE · Noche', dias: 'LUN-MIE-VIE', rango: '7:00 pm.-9:00 pm.' },
    { id: 'MJ_MANANA', label: 'MAR-JUE · Mañana', dias: 'MAR-JUE', rango: '8:00 am.-12:00 pm.' },
    { id: 'MJ_TARDE', label: 'MAR-JUE · Tarde', dias: 'MAR-JUE', rango: '1:00 pm.-4:00 pm.' },
    { id: 'MJ_NOCHE', label: 'MAR-JUE · Noche', dias: 'MAR-JUE', rango: '7:00 pm.-9:00 pm.' },
    { id: 'SD_MANANA_VIRTUAL', label: 'SAB-DOM · Mañana (Virtual)', dias: 'SAB-DOM', rango: '9:00 am.-12:00 pm.' },
    { id: 'SD_TARDE_VIRTUAL', label: 'SAB-DOM · Tarde (Virtual)', dias: 'SAB-DOM', rango: '2:00 pm.-5:00 pm.' },
    { id: 'SD_NOCHE_VIRTUAL', label: 'SAB-DOM · Noche (Virtual)', dias: 'SAB-DOM', rango: '7:00 pm.-10:00 pm.' }
  ];

  const aplicarPresetHorario = (presetId) => {
    const p = horarioPresets.find(h => h.id === presetId);
    if (!p) return;
    setFormData(prev => ({
      ...prev,
      horario: `${p.dias} [ ${p.rango} ]`,
      modalidad: 'virtual' // cursos libres por defecto virtual; mantenerlo
    }));
  };
  const [cursosLibres, setCursosLibres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [stats, setStats] = useState({});

  // Categorías disponibles
  const categorias = [
    'programacion', 'analisis', 'sistemas', 'bases-datos', 'redes', 
    'tecnologia', 'ia', 'seguridad', 'cloud', 'gis', 'documentos', 'oficina'
  ];

  // Colores predefinidos
  const colores = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-yellow-500 to-yellow-700',
    'from-orange-500 to-orange-700',
    'from-purple-500 to-purple-700',
    'from-red-500 to-red-700',
    'from-pink-500 to-pink-700',
    'from-indigo-500 to-indigo-700',
    'from-teal-500 to-teal-700',
    'from-cyan-500 to-cyan-700'
  ];

  // Iconos predefinidos
  const iconos = [
    '📚', '💻', '🎨', '📊', '🖥️', '🗄️', '🌐', '🚀', '🤖', '🔒',
    '☁️', '🗺️', '📄', '📝', '🐍', '☕', '⚡', '🔧', '📈', '📉'
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    icono: '📚',
    modalidad: 'virtual',
    precio: 0,
    estado: 'activo',
    horario: ''
  });

  const ASSET_BASE = API_BASE.replace('/api', '');
  const esImagen = (valor) => typeof valor === 'string' && /.+\.(png|jpg|jpeg|gif)$/i.test(valor);
  const buildPublicUrl = (valor) => {
    if (!valor) return '';
    // Valor puede ser URL completa, path "/uploads/..." o solo nombre de archivo
    if (valor.startsWith('http')) return valor;
    if (valor.startsWith('/uploads/')) return `${ASSET_BASE}${valor}`;
    if (esImagen(valor)) return `${ASSET_BASE}/uploads/cursos_libres/${valor}`;
    return '';
  };

  const handleUploadImagen = async (file) => {
    if (!file) return;
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('imagen', file);
      const resp = await fetch(`${API_BASE}/cursos-libres/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });
      if (resp.ok) {
        const data = await resp.json();
        const url = (data && typeof data.url === 'string' && data.url.startsWith('http')) ? data.url : '';
        const filename = data.filename || (data.url?.split('/').pop());
        setFormData(prev => ({ ...prev, icono: url || filename }));
        try {
          toast.success('Imagen subida correctamente', {
            title: 'Carga exitosa',
            duration: 5000,
          });
        } catch (_) {}
      } else {
        console.error('Error al subir la imagen');
        try {
          toast.error('No se pudo subir la imagen', {
            title: 'Error de carga',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (err) {
      console.error('Upload error:', err);
      try {
        toast.error('Error al subir la imagen', {
          title: 'Error de carga',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  useEffect(() => {
    fetchCursosLibres();
    fetchStats();
  }, []);

  const fetchCursosLibres = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch(`${API_BASE}/cursos-libres/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data received:', data.length, 'cursos');
        setCursosLibres(data);
      } else {
        const errorText = await response.text();
        console.error('Error fetching cursos libres:', response.status, errorText);
        try {
          toast.error('No se pudo cargar cursos libres', {
            title: 'Error de datos',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error:', error);
      try {
        toast.error('Error al cargar cursos libres', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/cursos-libres/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        try {
          toast.error('No se pudo cargar estadísticas', {
            title: 'Error de datos',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      try {
        toast.error('Error al cargar estadísticas', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validaciones básicas
      if (!formData.nombre.trim()) {
        try {
          toast.warning('El nombre del curso es requerido', {
            title: 'Validación',
            duration: 6000,
          });
        } catch (_) {}
        return;
      }
      const token = localStorage.getItem('token');
      const url = editingCourse 
        ? `${API_BASE}/cursos-libres/admin/${editingCourse.id}`
        : `${API_BASE}/cursos-libres/admin`;
      
      const method = editingCourse ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCursosLibres();
        await fetchStats();
        setShowModal(false);
        resetForm();
        try {
          toast.success(editingCourse ? 'Curso libre actualizado' : 'Curso libre creado', {
            title: editingCourse ? 'Actualización exitosa' : 'Creación exitosa',
            duration: 5000,
          });
        } catch (_) {}
      } else {
        console.error('Error saving curso libre');
        try {
          toast.error('No se pudo guardar el curso libre', {
            title: 'Error al guardar',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error:', error);
      try {
        toast.error('Error al guardar curso libre', {
          title: 'Error al guardar',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const handleEdit = async (course) => {
    setEditingCourse(course);
    setFormData({
      nombre: course.nombre,
      icono: course.icono,
      modalidad: course.modalidad || 'virtual',
      precio: course.precio,
      estado: course.estado,
      horario: ''
    });
    setShowModal(true);

    // Prefill horario si existe en la tabla de horarios usando grupo CL{id}
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/horarios/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const horarios = await resp.json();
        const grupo = `CL${course.id}`;
        const h = horarios.find((x) => x.grupo === grupo);
        if (h?.dias) {
          setFormData(prev => ({ ...prev, horario: h.dias }));
        }
      } else {
        try {
          toast.error('No se pudo cargar horarios', {
            title: 'Error de datos',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (err) {
      console.error('No se pudo cargar horario del curso:', err);
      try {
        toast.error('Error al cargar horarios', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const handleDelete = (id) => {
    const curso = cursosLibres?.find(c => c.id === id) || null;
    setCursoLibreToDelete(curso || { id });
    setConfirmOpen(true);
  };

  const confirmDeleteCursoLibre = async () => {
    if (!cursoLibreToDelete?.id) {
      setConfirmOpen(false);
      return;
    }
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/cursos-libres/admin/${cursoLibreToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCursosLibres();
        await fetchStats();
        try {
          toast.success('Curso libre eliminado', {
            title: 'Eliminación exitosa',
            duration: 5000,
          });
        } catch (_) {}
      } else {
        console.error('Error deleting curso libre');
        try {
          toast.error('No se pudo eliminar el curso libre', {
            title: 'Error de eliminación',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error:', error);
      try {
        toast.error('Error de conexión al eliminar', {
          title: 'Error de eliminación',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setCursoLibreToDelete(null);
    }
  };

  const toggleEstado = async (id, currentEstado) => {
    try {
      const token = localStorage.getItem('token');
      const newEstado = currentEstado === 'activo' ? 'inactivo' : 'activo';
      
      const response = await fetch(`${API_BASE}/cursos-libres/admin/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newEstado })
      });

      if (response.ok) {
        await fetchCursosLibres();
        await fetchStats();
        try {
          toast.success('Estado actualizado', {
            title: 'Actualización exitosa',
            duration: 5000,
          });
        } catch (_) {}
      } else {
        console.error('Error updating estado');
        try {
          toast.error('No se pudo actualizar el estado', {
            title: 'Error de actualización',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error:', error);
      try {
        toast.error('Error al actualizar estado', {
          title: 'Error de actualización',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      icono: '📚',
      modalidad: 'virtual',
      precio: 0,
      estado: 'activo',
      horario: ''
    });
    setEditingCourse(null);
  };

  const filteredCursos = cursosLibres.filter(curso => {
    const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !filterCategoria || curso.categoria === filterCategoria;
    const matchesEstado = !filterEstado || curso.estado === filterEstado;
    
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Administración de Cursos Libres</h1>
        <p className="text-gray-600">Gestiona los cursos libres disponibles en la plataforma</p>
      </div>

      {/* Resumen compacto (prioriza registros sobre tarjetas) */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">Total: {stats.total || 0}</span>
        <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Activos: {stats.activos || 0}</span>
        <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Inactivos: {stats.inactivos || 0}</span>
        <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">Categorías: {stats.categorias?.length || 0}</span>
      </div>

      {/* Controles: solo buscador */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Agregar Curso
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCursos.map((curso) => (
                <tr key={curso.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {esImagen(curso.icono) ? (
                          <img src={buildPublicUrl(curso.icono)} alt="icono" className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200" />
                        ) : (
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${curso.color} flex items-center justify-center text-white text-lg`}>
                            {curso.icono}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{curso.nombre}</div>
                        <div className="text-sm text-gray-500">{curso.modalidad}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    S/. {curso.precio}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleEstado(curso.id, curso.estado)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        curso.estado === 'activo'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {curso.estado === 'activo' ? <FaToggleOn className="mr-1" /> : <FaToggleOff className="mr-1" />}
                      {curso.estado}
                    </button>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(curso)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(curso.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingCourse ? 'Editar Curso Libre' : 'Agregar Nuevo Curso Libre'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Curso *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Categoría removida en formulario simplificado */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icono / Imagen del curso
                    </label>
                    <div className="space-y-2">
                      {/* Preview */}
                      {esImagen(formData.icono) && (
                        <div className="flex items-center space-x-3">
                          <img src={buildPublicUrl(formData.icono)} alt="preview" className="w-12 h-12 rounded-lg object-cover ring-1 ring-gray-200" />
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">{formData.icono}</span>
                        </div>
                      )}
                      {/* Solo selector de imagen del dispositivo */}
                      {/* Subir archivo */}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif"
                        onChange={(e) => handleUploadImagen(e.target.files?.[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Color removido */}

                  {/* Duración removida */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modalidad (por defecto)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.modalidad}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  {/* Nivel removido */}

                  {/* Instructor removido */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (S/.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horario (texto visible en horarios)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <select
                        value={''}
                        onChange={(e) => aplicarPresetHorario(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar plantilla</option>
                        {horarioPresets.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Ej: Lunes y Miércoles 7:00-9:00 PM"
                      value={formData.horario}
                      onChange={(e) => setFormData({...formData, horario: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Se creará/actualizará en Horarios → Cursos Libres.</p>
                  </div>
                </div>
                {/* Descripción removida */}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingCourse ? 'Actualizar' : 'Crear'} Curso
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setCursoLibreToDelete(null);
          }
        }}
        onConfirm={confirmDeleteCursoLibre}
        title="Confirmar eliminación"
        message={`Se eliminará el curso libre${cursoLibreToDelete?.nombre ? ` "${cursoLibreToDelete.nombre}"` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default CursosLibresAdmin;

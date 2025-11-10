import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useToast, ConfirmModal } from '../../components/ui';

function ProgramasAdmin() {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    modalidad: 'presencial',
    precio: '',
    estado: 'activo',
    imagen: '',
    color: '#3B82F6',
    icono: 'AcademicCapIcon'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  // Estado para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [programaToDelete, setProgramaToDelete] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/admin/programas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setProgramas(data);
    } catch (error) {
      console.error('Error al cargar programas:', error);
      try {
        toast.error('Error al cargar programas', {
          title: 'Error de datos',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let imageUrl = formData.imagen;

      // Si hay un archivo de imagen, subirlo primero
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('imagen', imageFile);

        const uploadResponse = await fetch('http://localhost:4001/admin/programas/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataImage,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.imageUrl;
        } else {
          console.error('Error al subir imagen');
          try {
            toast.error('Error al subir la imagen. Por favor, intenta de nuevo.', {
              title: 'Error de carga',
              duration: 6000,
            });
          } catch (_) {}
          return;
        }
      }

      const url = editingPrograma 
        ? `http://localhost:4001/admin/programas/${editingPrograma.id}`
        : 'http://localhost:4001/admin/programas';
      
      const method = editingPrograma ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imagen: imageUrl
        }),
      });

      if (response.ok) {
        fetchProgramas();
        setShowModal(false);
        setEditingPrograma(null);
        setImageFile(null);
        setImagePreview('');
        setFormData({
          nombre: '',
          descripcion: '',
          duracion: '',
          modalidad: 'presencial',
          precio: '',
          estado: 'activo',
          imagen: '',
          color: '#3B82F6',
          icono: 'AcademicCapIcon'
        });
        try {
          toast.success(
            editingPrograma ? 'Programa actualizado exitosamente' : 'Programa creado exitosamente',
            {
              title: editingPrograma ? 'Actualización exitosa' : 'Creación exitosa',
              duration: 5000,
            }
          );
        } catch (_) {}
      } else {
        const errorData = await response.json();
        console.error('Error al guardar programa:', errorData);
        try {
          toast.error('Error al guardar el programa. Por favor, intenta de nuevo.', {
            title: 'Error de guardado',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error al guardar programa:', error);
      try {
        toast.error('Error al guardar el programa. Por favor, intenta de nuevo.', {
          title: 'Error inesperado',
          duration: 6000,
        });
      } catch (_) {}
    }
  };

  const handleEdit = (programa) => {
    setEditingPrograma(programa);
    setFormData({
      nombre: programa.nombre || '',
      descripcion: programa.descripcion || '',
      duracion: programa.duracion || '',
      modalidad: programa.modalidad || 'presencial',
      precio: programa.precio || '',
      estado: programa.estado || 'activo',
      imagen: programa.imagen || '',
      color: programa.color || '#3B82F6',
      icono: programa.icono || 'AcademicCapIcon'
    });
    // Mostrar la imagen actual si existe
    if (programa.imagen && programa.imagen.startsWith('/uploads')) {
      setImagePreview(`http://localhost:4001${programa.imagen}`);
    } else {
      setImagePreview(programa.imagen || '');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = (programa) => {
    const modCount = programa.modulos_count ?? 0;
    const courseCount = programa.cursos_count ?? 0;
    const message = `Este programa tiene ${modCount} módulo(s) y ${courseCount} curso(s).\n\nAl eliminarlo, se eliminarán sus módulos y cursos asociados.\n\n¿Deseas continuar?`;
    setProgramaToDelete(programa);
    setConfirmMessage(message);
    setConfirmOpen(true);
  };

  const confirmDeletePrograma = async () => {
    if (!programaToDelete) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4001/admin/programas/${programaToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchProgramas();
        try {
          toast.success('Programa eliminado correctamente', {
            title: 'Eliminación exitosa',
            duration: 5000,
          });
        } catch (_) {}
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Error al eliminar programa:', err);
        try {
          toast.error('No se pudo eliminar el programa', {
            title: 'Error de eliminación',
            duration: 6000,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error al eliminar programa:', error);
      try {
        toast.error('Error al eliminar el programa. Intenta nuevamente.', {
          title: 'Error de red',
          duration: 6000,
        });
      } catch (_) {}
    } finally {
      setDeleting(false);
      setProgramaToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Programas INFOUNA</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Programa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programas.map((programa) => (
          <div key={programa.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Imagen del programa */}
            <div className="mb-3">
              {programa.imagen ? (
                <img 
                  src={programa.imagen.startsWith('/uploads') 
                    ? `http://localhost:4001${programa.imagen}` 
                    : programa.imagen
                  }
                  alt={programa.nombre}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: programa.color || '#3B82F6' }}
                >
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{programa.nombre}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    programa.estado === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {programa.estado}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(programa)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(programa)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{programa.descripcion}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Duración:</span>
                <span className="font-medium">{programa.duracion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modalidad:</span>
                <span className="font-medium capitalize">{programa.modalidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Módulos / Cursos:</span>
                <span className="font-medium">{(programa.modulos_count ?? 0)} / {(programa.cursos_count ?? 0)}</span>
              </div>
              {programa.precio && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium">${programa.precio}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {programas.length === 0 && (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay programas</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primer programa.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Crear Programa
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración *
                </label>
                <input
                  type="text"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleInputChange}
                  required
                  placeholder="ej: 6 meses, 120 horas"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    Selecciona una imagen desde tu computadora
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPrograma(null);
                    setImageFile(null);
                    setImagePreview('');
                    setFormData({
                      nombre: '',
                      descripcion: '',
                      duracion: '',
                      modalidad: 'presencial',
                      precio: '',
                      estado: 'activo',
                      imagen: '',
                      color: '#3B82F6',
                      icono: 'AcademicCapIcon'
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingPrograma ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeletePrograma}
        title="Confirmar eliminación"
        message={confirmMessage}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default ProgramasAdmin;

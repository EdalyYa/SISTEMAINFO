import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { ConfirmModal, useToast } from '../../components/ui';

function CifrasLogrosAdmin() {
  const [cifras, setCifras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    label: '',
    valor: '',
    orden: 0,
    activo: true
  });

  // Cargar cifras de logros
  const fetchCifras = async () => {
    try {
      const token = localStorage.getItem('token'); // Cambiar de 'adminToken' a 'token'
      const response = await fetch(`${API_BASE}/cifras-logros/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCifras(data);
      } else {
        console.error('Error al cargar cifras de logros');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCifras();
  }, []);

  // Crear nueva cifra
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/cifras-logros/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCifras();
        setShowForm(false);
        setFormData({ label: '', valor: '', orden: 0, activo: true });
      } else {
        console.error('Error al crear cifra de logro');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Actualizar cifra
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const cifra = cifras.find(c => c.id === id);
      
      const response = await fetch(`${API_BASE}/cifras-logros/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cifra)
      });

      if (response.ok) {
        await fetchCifras();
        setEditingId(null);
      } else {
        console.error('Error al actualizar cifra de logro');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Eliminar cifra
  const handleDelete = async (id) => {
    setConfirmMessage('Esta acción eliminará la cifra seleccionada. ¿Deseas continuar?');
    setDeleteAction(() => async () => {
      setDeleting(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/cifras-logros/admin/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          showToast({ title: 'Eliminado', description: 'Cifra de logro eliminada correctamente.' });
          await fetchCifras();
        } else {
          showToast({ title: 'Error', description: 'No se pudo eliminar la cifra de logro.' });
          console.error('Error al eliminar cifra de logro');
        }
      } catch (error) {
        showToast({ title: 'Error', description: 'Ocurrió un error al eliminar.' });
        console.error('Error:', error);
      } finally {
        setDeleting(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  // Toggle activo/inactivo
  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/cifras-logros/admin/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCifras();
      } else {
        console.error('Error al cambiar estado de cifra de logro');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Actualizar campo en edición
  const updateField = (id, field, value) => {
    setCifras(cifras.map(cifra => 
      cifra.id === id ? { ...cifra, [field]: value } : cifra
    ));
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración de Cifras de Logros</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Agregar Cifra
        </button>
      </div>

      {/* Formulario para nueva cifra */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Nueva Cifra de Logro</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiqueta
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="text"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Activo
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Save size={16} />
                Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ label: '', valor: '', orden: 0, activo: true });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de cifras */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Etiqueta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
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
            {cifras.map((cifra) => (
              <tr key={cifra.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === cifra.id ? (
                    <input
                      type="number"
                      value={cifra.orden}
                      onChange={(e) => updateField(cifra.id, 'orden', parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{cifra.orden}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === cifra.id ? (
                    <input
                      type="text"
                      value={cifra.label}
                      onChange={(e) => updateField(cifra.id, 'label', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{cifra.label}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === cifra.id ? (
                    <input
                      type="text"
                      value={cifra.valor}
                      onChange={(e) => updateField(cifra.id, 'valor', e.target.value)}
                      className="w-24 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-blue-600">{cifra.valor}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cifra.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cifra.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {editingId === cifra.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(cifra.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Guardar"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            fetchCifras(); // Recargar para deshacer cambios
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(cifra.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(cifra.id)}
                          className={`${cifra.activo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          title={cifra.activo ? 'Desactivar' : 'Activar'}
                        >
                          {cifra.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(cifra.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cifras.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay cifras de logros registradas
        </div>
      )}
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
}

export default CifrasLogrosAdmin;

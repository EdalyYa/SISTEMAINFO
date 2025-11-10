import React, { useState, useEffect } from 'react';
import { ConfirmModal, useToast } from '../../components/ui';

function Programas() {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProgramaId, setEditingProgramaId] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    modalidad: 'presencial',
    precio: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/admin/programas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgramas(data);
        setError(null);
      } else {
        setError('Error al cargar programas');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingProgramaId 
        ? `http://localhost:4001/admin/programas/${editingProgramaId}`
        : 'http://localhost:4001/admin/programas';
      
      const method = editingProgramaId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        await fetchProgramas();
        setForm({ nombre: '', descripcion: '', duracion: '', modalidad: 'presencial', precio: '', estado: 'activo' });
        setEditingProgramaId(null);
        setShowForm(false);
        setError(null);
      } else {
        setError('Error al guardar programa');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (programa) => {
    setForm({
      nombre: programa.nombre || '',
      descripcion: programa.descripcion || '',
      duracion: programa.duracion || '',
      modalidad: programa.modalidad || 'presencial',
      precio: programa.precio || '',
      estado: programa.estado || 'activo'
    });
    setEditingProgramaId(programa.id);
    setShowForm(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [programaToDelete, setProgramaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    const p = programas.find(x => x.id === id) || { id };
    setProgramaToDelete(p);
    setConfirmOpen(true);
  };

  const confirmDeletePrograma = async () => {
    if (!programaToDelete?.id) { setConfirmOpen(false); return; }
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
        setError(null);
        try { toast.success('Programa eliminado', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
      } else {
        setError('Error al eliminar programa');
        try { toast.error('Error al eliminar programa', { title: 'Error', duration: 6000 }); } catch(_){}
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
      try { toast.error('Error de conexión', { title: 'Error', duration: 6000 }); } catch(_){}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setProgramaToDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Programas</h1>
        <button
          onClick={() => {
            setForm({ nombre: '', descripcion: '', duracion: '', modalidad: 'presencial', precio: '', estado: 'activo' });
            setEditingProgramaId(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Nuevo Programa'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProgramaId ? 'Editar Programa' : 'Nuevo Programa'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Nombre del Programa</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duración</label>
                <input
                  type="text"
                  name="duracion"
                  value={form.duracion}
                  onChange={handleChange}
                  placeholder="ej: 6 meses"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Modalidad</label>
                <select
                  name="modalidad"
                  value={form.modalidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Precio</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : editingProgramaId ? 'Actualizar' : 'Crear'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Programas</h2>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : programas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay programas registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Duración</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Modalidad</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Precio</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {programas.map((programa) => (
                    <tr key={programa.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{programa.nombre}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {programa.descripcion ? programa.descripcion.substring(0, 100) + '...' : 'Sin descripción'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{programa.duracion || 'No especificada'}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          programa.modalidad === 'presencial' ? 'bg-blue-100 text-blue-800' :
                          programa.modalidad === 'virtual' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {programa.modalidad}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {programa.precio ? `S/ ${programa.precio}` : 'Gratuito'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          programa.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {programa.estado}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleEdit(programa)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(programa.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
    <ConfirmModal
      isOpen={confirmOpen}
      onClose={() => { if (!deleting) { setConfirmOpen(false); setProgramaToDelete(null); } }}
      onConfirm={confirmDeletePrograma}
      title="Confirmar eliminación"
      message={`Se eliminará el programa${programaToDelete?.nombre ? ` "${programaToDelete.nombre}"` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      loading={deleting}
    />
  </div>
  );
}

export default Programas;

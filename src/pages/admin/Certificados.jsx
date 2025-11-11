import React, { useState, useEffect } from 'react';
import { API_HOST } from '../../config/api';
import { ConfirmModal, useToast } from '../../components/ui';

function Certificados() {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [certificados, setCertificados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCertificadoId, setEditingCertificadoId] = useState(null);
  const [form, setForm] = useState({
    usuario_id: '',
    curso_id: '',
    fecha_emision: '',
    codigo_certificado: '',
    estado: 'emitido',
    observaciones: ''
  });

  useEffect(() => {
    fetchCertificados();
    fetchUsuarios();
    fetchCursos();
  }, []);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/certificados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCertificados(data);
        setError(null);
      } else {
        setError('Error al cargar certificados');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/users`, {
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
      const response = await fetch(`${API_HOST}/admin/cursos`, {
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

  const generateCertificateCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CERT-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = {
        ...form,
        codigo_certificado: form.codigo_certificado || generateCertificateCode()
      };
      
      const url = editingCertificadoId 
        ? `${API_HOST}/admin/certificados/${editingCertificadoId}`
        : `${API_HOST}/admin/certificados`;
      
      const method = editingCertificadoId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCertificados();
        setForm({ usuario_id: '', curso_id: '', fecha_emision: '', codigo_certificado: '', estado: 'emitido', observaciones: '' });
        setEditingCertificadoId(null);
        setShowForm(false);
        setError(null);
      } else {
        setError('Error al guardar certificado');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (certificado) => {
    setForm({
      usuario_id: certificado.usuario_id || '',
      curso_id: certificado.curso_id || '',
      fecha_emision: certificado.fecha_emision ? certificado.fecha_emision.split('T')[0] : '',
      codigo_certificado: certificado.codigo_certificado || '',
      estado: certificado.estado || 'emitido',
      observaciones: certificado.observaciones || ''
    });
    setEditingCertificadoId(certificado.id);
    setShowForm(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    const c = certificados.find(x => x.id === id) || { id };
    setCertToDelete(c);
    setConfirmOpen(true);
  };

  const confirmDeleteCertificado = async () => {
    if (!certToDelete?.id) { setConfirmOpen(false); return; }
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_HOST}/admin/certificados/${certToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchCertificados();
        setError(null);
        try { toast.success('Certificado eliminado', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
      } else {
        setError('Error al eliminar certificado');
        try { toast.error('Error al eliminar certificado', { title: 'Error', duration: 6000 }); } catch(_){}
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
      try { toast.error('Error de conexión', { title: 'Error', duration: 6000 }); } catch(_){}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setCertToDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.full_name || usuario.email : 'Usuario no encontrado';
  };

  const getCursoNombre = (cursoId) => {
    const curso = cursos.find(c => c.id === cursoId);
    return curso ? curso.nombre : 'Curso no encontrado';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Certificados</h1>
        <button
          onClick={() => {
            setForm({ usuario_id: '', curso_id: '', fecha_emision: '', codigo_certificado: '', estado: 'emitido', observaciones: '' });
            setEditingCertificadoId(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Nuevo Certificado'}
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
            {editingCertificadoId ? 'Editar Certificado' : 'Nuevo Certificado'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Usuario</label>
                <select
                  name="usuario_id"
                  value={form.usuario_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.full_name || usuario.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Curso</label>
                <select
                  name="curso_id"
                  value={form.curso_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Fecha de Emisión</label>
                <input
                  type="date"
                  name="fecha_emision"
                  value={form.fecha_emision}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Código de Certificado</label>
                <input
                  type="text"
                  name="codigo_certificado"
                  value={form.codigo_certificado}
                  onChange={handleChange}
                  placeholder="Se generará automáticamente si se deja vacío"
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
                  <option value="emitido">Emitido</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="revocado">Revocado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : editingCertificadoId ? 'Actualizar' : 'Crear'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Certificados</h2>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : certificados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay certificados registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Código</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Usuario</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Curso</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Fecha Emisión</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {certificados.map((certificado) => (
                    <tr key={certificado.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        {certificado.codigo_certificado}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {getUsuarioNombre(certificado.usuario_id)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {getCursoNombre(certificado.curso_id)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {certificado.fecha_emision ? new Date(certificado.fecha_emision).toLocaleDateString() : 'No especificada'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          certificado.estado === 'emitido' ? 'bg-green-100 text-green-800' :
                          certificado.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {certificado.estado}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleEdit(certificado)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(certificado.id)}
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
      onClose={() => { if (!deleting) { setConfirmOpen(false); setCertToDelete(null); } }}
      onConfirm={confirmDeleteCertificado}
      title="Confirmar eliminación"
      message={`Se eliminará el certificado${certToDelete ? ` (Código: ${certToDelete.codigo_certificado}, Usuario: ${getUsuarioNombre(certToDelete.usuario_id)}, Curso: ${getCursoNombre(certToDelete.curso_id)})` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      loading={deleting}
    />
  </div>
  );
}

export default Certificados;

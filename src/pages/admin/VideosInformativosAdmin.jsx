import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../config/api';
import AdminTable from '../../components/admin/AdminTable';
import AdminFormModal from '../../components/admin/AdminFormModal';
import { Plus, Play, Edit, Trash2 } from 'lucide-react';

const categorias = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'promocion', label: 'Promoción' },
  { value: 'informativo', label: 'Informativo' },
  { value: 'otro', label: 'Otro' },
];

function VideosInformativosAdmin() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    youtube_url: '',
    categoria: 'informativo',
    nombre_testimonio: '',
    activo: true,
    orden: 1,
  });

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = (typeof window !== 'undefined' && window.sessionStorage.getItem('token')) || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/videos-informativos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setVideos(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error('Error cargando videos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ titulo: '', descripcion: '', youtube_url: '', categoria: 'informativo', nombre_testimonio: '', activo: true, orden: 1 });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      titulo: v.titulo || '',
      descripcion: v.descripcion || '',
      youtube_url: v.youtube_url || '',
      categoria: v.categoria || 'informativo',
      nombre_testimonio: v.nombre_testimonio || '',
      activo: Boolean(v.activo),
      orden: Number(v.orden || 0),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este video?')) return;
    try {
      const token = (typeof window !== 'undefined' && window.sessionStorage.getItem('token')) || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/videos-informativos/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (data?.success) fetchVideos();
      else alert(data?.message || 'No se pudo eliminar');
    } catch (e) {
      console.error('Error eliminando:', e);
      alert('Error al eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      const method = editing ? 'PUT' : 'POST';
      const url = editing 
        ? `${API_BASE}/admin/videos-informativos/${editing.id}`
        : `${API_BASE}/admin/videos-informativos`;
      const token = (typeof window !== 'undefined' && window.sessionStorage.getItem('token')) || localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        setShowModal(false);
        setEditing(null);
        fetchVideos();
      } else {
        alert(data?.message || 'No se pudo guardar');
      }
    } catch (e) {
      console.error('Error guardando video:', e);
      alert('Error al guardar');
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'titulo', header: 'Título' },
    { key: 'categoria', header: 'Categoría' },
    {
      key: 'youtube_id',
      header: 'YouTube',
      render: (value) => (
        <div className="flex items-center gap-2 text-xs">
          <span>{value}</span>
          {value && (
            <a
              href={`https://www.youtube.com/watch?v=${value}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Play size={14} /> Ver
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'activo',
      header: 'Activo',
      render: (value) => (
        <span className={`px-2 py-1 rounded ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{value ? 'Sí' : 'No'}</span>
      ),
    },
    { key: 'orden', header: 'Orden' },
  ];

  // Columnas con render personalizado; usar acciones integradas de AdminTable

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Videos Informativos</h1>
          <p className="text-gray-600 text-sm">Administra los videos que aparecen en la página principal.</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus /> Nuevo Video
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <AdminTable columns={columns} data={videos} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      <AdminFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Editar Video' : 'Nuevo Video'}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input className="w-full border rounded px-3 py-2" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
            <input className="w-full border rounded px-3 py-2" placeholder="https://www.youtube.com/watch?v=..." value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} required />
            <p className="text-xs text-gray-500 mt-1">Pega la URL completa del video en YouTube. El ID se detecta automáticamente.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select className="w-full border rounded px-3 py-2" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              {categorias.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del testimonio (opcional)</label>
            <input className="w-full border rounded px-3 py-2" value={form.nombre_testimonio} onChange={e => setForm({ ...form, nombre_testimonio: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activo</label>
            <select className="w-full border rounded px-3 py-2" value={form.activo ? 'true' : 'false'} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={form.orden} onChange={e => setForm({ ...form, orden: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
          </div>
        </div>
      </AdminFormModal>
    </div>
  );
}

export default VideosInformativosAdmin;

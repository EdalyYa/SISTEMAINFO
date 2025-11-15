import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../../config/api';

const categoriasDefault = [
  'Reglamentos',
  'Normativas',
  'Guías',
  'Formularios',
  'Temarios',
  'Otros'
];

const tramiteOptions = [
  { slug: 'solicitud-certificado', label: 'Solicitud de Certificado' },
  { slug: 'constancia-estudios', label: 'Constancia de Estudios' },
  { slug: 'duplicado-carnet', label: 'Duplicado de Carnet' }
];

const normalizeSlug = (s) => {
  const baseRaw = String(s || '').toLowerCase();
  const removed = baseRaw.replace(/^tramite:\s*/, '').trim();
  const dashed = removed.replace(/\s+/g, '-').replace(/-+/g, '-');
  return dashed.replace(/-de-/g, '-');
};

const deriveTramiteSlug = (title) => {
  const t = String(title || '').toLowerCase();
  if (t.includes('constancia')) return 'constancia-estudios';
  if (t.includes('certificado')) return 'solicitud-certificado';
  if (t.includes('duplicado')) return 'duplicado-carnet';
  return '';
};

const labelForSlug = (slug) => {
  const s = normalizeSlug(slug);
  const opt = tramiteOptions.find(o => o.slug === s);
  return opt ? opt.label : (s || null);
};

const getTramiteFromTags = (tags) => {
  const arr = Array.isArray(tags) ? tags : [];
  const t = arr.find((x) => String(x || '').startsWith('tramite:'));
  if (!t) return null;
  const slug = normalizeSlug(t);
  const opt = tramiteOptions.find(o => o.slug === slug);
  return opt ? opt.label : slug;
};

function DocumentosAdmin() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoria: 'Formularios', etiquetas: '', publico: true, tramiteSlug: '' });
  const [file, setFile] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documentos/admin/all');
      setDocs(res.data || []);
    } catch (e) {
      console.error('Error cargando documentos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !form.titulo) { alert('Título y archivo son obligatorios'); return; }
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('titulo', form.titulo);
      if (form.descripcion) fd.append('descripcion', form.descripcion);
      if (form.categoria) fd.append('categoria', form.categoria);
      const etiquetasCombined = [
        ...(form.etiquetas ? String(form.etiquetas).split(',').map(s => s.trim()).filter(Boolean) : []),
        ...(() => {
          const chosen = normalizeSlug(form.tramiteSlug);
          const fallback = deriveTramiteSlug(form.titulo);
          const slug = chosen || fallback;
          return slug ? [`tramite:${slug}`] : [];
        })()
      ].join(',');
      if (etiquetasCombined) fd.append('etiquetas', etiquetasCombined);
      fd.append('publico', form.publico ? '1' : '0');
      await api.post('/documentos/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ titulo: '', descripcion: '', categoria: 'Formularios', etiquetas: '', publico: true, tramiteSlug: '' });
      setFile(null);
      await fetchDocs();
    } catch (e) {
      console.error('Error subiendo documento:', e);
      alert('Error al subir documento');
    } finally {
      setSubiendo(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      await api.delete(`/documentos/admin/${id}`);
      await fetchDocs();
    } catch (e) {
      console.error('Error eliminando documento:', e);
      alert('No se pudo eliminar');
    }
  };

  const togglePublico = async (doc) => {
    try {
      await api.patch(`/documentos/admin/${doc.id}`, { publico: !doc.publico });
      await fetchDocs();
    } catch (e) {
      console.error('Error actualizando documento:', e);
      alert('No se pudo actualizar');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Biblioteca de Documentos</h1>
      <p className="text-gray-600 mb-6">Sube reglamentos, normativas, guías, formularios y más. Configura categorías, etiquetas y visibilidad pública.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 lg:col-span-1">
          <h2 className="font-semibold mb-3">Nuevo Documento</h2>
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Título</label>
              <input className="w-full border rounded px-3 py-2" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Descripción</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Categoría</label>
              <select className="w-full border rounded px-3 py-2" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecciona categoría</option>
                {categoriasDefault.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Etiquetas (coma separadas)</label>
              <input className="w-full border rounded px-3 py-2" placeholder="reglamento, alumnos, 2024" value={form.etiquetas} onChange={e => setForm({ ...form, etiquetas: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Trámite asociado (opcional)</label>
              <select className="w-full border rounded px-3 py-2" value={form.tramiteSlug} onChange={e => setForm({ ...form, tramiteSlug: e.target.value })}>
                <option value="">Sin asociación</option>
                {tramiteOptions.map(t => (<option key={t.slug} value={t.slug}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Archivo</label>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={e => setFile(e.target.files[0] || null)} />
            </div>
            <div className="flex items-center gap-2">
              <input id="publico" type="checkbox" checked={form.publico} onChange={e => setForm({ ...form, publico: e.target.checked })} />
              <label htmlFor="publico" className="text-sm text-gray-700">Visible públicamente</label>
            </div>
            <button type="submit" disabled={subiendo} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {subiendo ? 'Subiendo...' : 'Subir'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Documentos ({docs.length})</h2>
            {loading && <span className="text-sm text-gray-500">Cargando...</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-3 py-2">Título</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Etiquetas</th>
                  <th className="px-3 py-2">Trámite</th>
                  <th className="px-3 py-2">Tamaño</th>
                  <th className="px-3 py-2">Descargas</th>
                  <th className="px-3 py-2">Público</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium">{doc.titulo}</div>
                      {doc.descripcion && <div className="text-gray-500 text-xs">{doc.descripcion}</div>}
                    </td>
                    <td className="px-3 py-2">{doc.categoria || '-'}</td>
                    <td className="px-3 py-2">{Array.isArray(doc.etiquetas) ? doc.etiquetas.join(', ') : '-'}</td>
                    <td className="px-3 py-2">
                      <select className="border rounded px-2 py-1 text-xs" value={(() => {
                        const fromTag = Array.isArray(doc.etiquetas) ? normalizeSlug((doc.etiquetas.find(e => String(e).startsWith('tramite:')) || '')) : '';
                        return fromTag || deriveTramiteSlug(doc.titulo);
                      })()} onChange={async (e) => {
                        const slug = normalizeSlug(e.target.value);
                        const others = Array.isArray(doc.etiquetas) ? doc.etiquetas.filter(x => !String(x).startsWith('tramite:')) : [];
                        const next = slug ? [...others, `tramite:${slug}`] : others;
                        try {
                          await api.patch(`/documentos/admin/${doc.id}`, { etiquetas: next.join(',') });
                          await fetchDocs();
                        } catch (err) { alert('No se pudo actualizar'); }
                      }}>
                        <option value="">Sin asociación</option>
                        {tramiteOptions.map(t => (<option key={t.slug} value={t.slug}>{t.label}</option>))}
                      </select>
                      <div className="text-gray-500 text-xs mt-1">{getTramiteFromTags(doc.etiquetas) || labelForSlug(deriveTramiteSlug(doc.titulo)) || '-'}</div>
                    </td>
                    <td className="px-3 py-2">{(doc.tamano/1024).toFixed(1)} KB</td>
                    <td className="px-3 py-2">{doc.descargas || 0}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => togglePublico(doc)} className={`px-2 py-1 rounded text-xs ${doc.publico ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {doc.publico ? 'Público' : 'Oculto'}
                      </button>
                    </td>
                    <td className="px-3 py-2 space-x-2">
                      <a className="text-blue-600 hover:underline" href={`${API_BASE}/documentos/${doc.id}/download`} target="_blank" rel="noreferrer">Ver</a>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(doc.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && !loading && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>No hay documentos cargados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentosAdmin;

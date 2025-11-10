import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config/api';

function DocumentosPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tag, setTag] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (categoria) params.append('categoria', categoria);
      if (tag) params.append('tag', tag);
      const res = await fetch(`${API_BASE}/documentos?${params.toString()}`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error obteniendo documentos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchDocs, 300);
    return () => clearTimeout(timeout);
  }, [q, categoria, tag]);

  const categorias = useMemo(() => {
    const set = new Set();
    docs.forEach(d => { if (d.categoria) set.add(d.categoria); });
    return Array.from(set);
  }, [docs]);

  const tags = useMemo(() => {
    const set = new Set();
    docs.forEach(d => {
      (Array.isArray(d.etiquetas) ? d.etiquetas : []).forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [docs]);

  const canPreview = (mime) => {
    if (!mime) return false;
    return (
      mime === 'application/pdf' ||
      mime.startsWith('text/') ||
      mime.includes('word') ||
      mime.includes('excel')
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Biblioteca de documentos</h1>
        <p className="text-gray-600 mt-2">Reglamentos, normativas, guías y formularios del INFOUNA. Usa el buscador y los filtros para encontrar rápidamente lo que necesitas. Puedes previsualizar PDFs y descargar cualquier archivo.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Buscar por título" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select className="w-full border rounded px-3 py-2" value={categoria} onChange={e => setCategoria(e.target.value)}>
              <option value="">Todas</option>
              {categorias.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
            <select className="w-full border rounded px-3 py-2" value={tag} onChange={e => setTag(e.target.value)}>
              <option value="">Todas</option>
              {tags.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div className="md:col-span-3 text-xs text-gray-500">Consejo: haz clic en una etiqueta para filtrar por ella rápidamente.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="md:col-span-2 lg:col-span-3 text-center text-gray-600">Cargando documentos...</div>
        )}
        {!loading && docs.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center text-gray-500">No se encontraron documentos</div>
        )}
        {!loading && docs.map(doc => (
          <div key={doc.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{doc.titulo}</h3>
                {doc.descripcion && <p className="text-sm text-gray-600 mt-1 line-clamp-3">{doc.descripcion}</p>}
              </div>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">{doc.categoria || 'General'}</span>
            </div>
            {Array.isArray(doc.etiquetas) && doc.etiquetas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {doc.etiquetas.map(t => (
                  <button key={t} onClick={() => setTag(t)} className={`text-xs px-2 py-1 rounded border ${tag === t ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-700'}`}>#{t}</button>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {canPreview(doc.mime) && (
                  <button onClick={() => setPreviewDoc(doc)} className="text-white bg-gray-800 hover:bg-gray-900 text-sm px-3 py-1 rounded">Ver</button>
                )}
                <a className="text-blue-600 hover:underline" href={`${API_BASE}/documentos/${doc.id}/download`} target="_blank" rel="noreferrer">Descargar</a>
              </div>
              <span className="text-xs text-gray-500">{doc.descargas || 0} descargas</span>
            </div>
          </div>
        ))}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-lg shadow-lg flex flex-col">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{previewDoc.titulo}</h2>
                <p className="text-xs text-gray-500">{previewDoc.categoria || 'General'}{Array.isArray(previewDoc.etiquetas) && previewDoc.etiquetas.length > 0 ? ` · ${previewDoc.etiquetas.map(e=>`#${e}`).join(' ')}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <a className="text-blue-600 text-sm hover:underline" href={`${API_BASE}/documentos/${previewDoc.id}/download`} target="_blank" rel="noreferrer">Abrir en pestaña</a>
                <button onClick={() => setPreviewDoc(null)} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Cerrar</button>
              </div>
            </div>
            <div className="flex-1">
              <iframe title={`Vista previa ${previewDoc.titulo}`} src={`${API_BASE}/documentos/${previewDoc.id}/preview`} className="w-full h-full" />
              {(!canPreview(previewDoc.mime)) && (
                <div className="p-3 text-xs text-gray-500 border-t">Si la vista previa no se muestra, usa “Descargar”. Para documentos de Office puede requerir conversión a PDF en el servidor.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentosPage;

import React, { useEffect, useState } from 'react';
import { FaFileAlt, FaExternalLinkAlt, FaUniversity } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { API_BASE } from '../config/api';

const ASSET_BASE = API_BASE.replace('/api', '');

const descargablesDefault = [
  {
    titulo: 'Guía de Inscripción',
    descripcion: 'Pasos y requisitos para inscribirte a nuestros cursos y programas.',
    url: `${ASSET_BASE}/uploads/docs/guia-inscripcion.pdf`,
  },
  {
    titulo: 'Reglamento Académico',
    descripcion: 'Normas y políticas del instituto para estudiantes y docentes.',
    url: `${ASSET_BASE}/uploads/docs/reglamento-academico.pdf`,
  },
  {
    titulo: 'Temario General de Programas',
    descripcion: 'Resumen de contenidos y competencias por programa.',
    url: `${ASSET_BASE}/uploads/docs/temario-general.pdf`,
  },
];

function DescargablesPage() {
  const [items, setItems] = useState(descargablesDefault.map(d => ({ ...d, available: null })));
  const linkify = (text) => {
    const t = String(text || '');
    const re = /((https?:\/\/|www\.)[^\s]+)/gi;
    const out = [];
    let last = 0;
    for (const m of t.matchAll(re)) {
      const start = m.index || 0;
      const url = m[0];
      if (start > last) out.push(t.slice(last, start));
      const href = url.startsWith('www.') ? `https://${url}` : url;
      out.push(
        <a key={`l-${start}`} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
          {url}
        </a>
      );
      last = start + url.length;
    }
    if (last < t.length) out.push(t.slice(last));
    return out;
  };

  useEffect(() => {
    const check = async (url) => {
      if (!url || url === '#') return false;
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        return !!res.ok;
      } catch (_) {
        return false;
      }
    };
    (async () => {
      const results = await Promise.all(descargablesDefault.map(d => check(d.url)));
      setItems(descargablesDefault.map((d, i) => ({ ...d, available: results[i] })));
    })();
  }, []);

  const handleOpen = async (item, idx) => {
    if (item.url === '#' || item.available === false) return;
    try {
      const res = await fetch(item.url, { method: 'HEAD', cache: 'no-cache' });
      if (res.ok) {
        window.open(item.url, '_blank', 'noopener');
      } else {
        const next = [...items];
        next[idx] = { ...item, available: false };
        setItems(next);
      }
    } catch (_) {
      const next = [...items];
      next[idx] = { ...item, available: false };
      setItems(next);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative mb-4 md:mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 mb-1 justify-center">
                <FaUniversity className="text-blue-600" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Descargables − Instituto de Informática INFOUNA</h1>
              </div>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">Temarios, guías de inscripción y documentos informativos del Instituto de Informática INFOUNA.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200">PDF</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">Docs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {items.map((item, i) => (
            <Card key={i} className="rounded-xl hover:shadow-md transition">
              <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
              <CardHeader className="flex items-center gap-2">
                <FaFileAlt className="text-indigo-600" />
                <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">{item.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{linkify(item.descripcion)}</p>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={FaExternalLinkAlt}
                  disabled={item.url === '#' || item.available === false}
                  onClick={() => handleOpen(item, i)}
                >
                  {item.url === '#' || item.available === false ? 'Próximamente' : 'Descargar PDF'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DescargablesPage;

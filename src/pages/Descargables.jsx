import React from 'react';
import { FaUniversity, FaFileAlt, FaExternalLinkAlt, FaMicrochip } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { API_BASE } from '../config/api';

const ASSET_BASE = API_BASE.replace('/api', '');

const descargables = [
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
  return (
    <main className="bg-white min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border border-slate-800 p-6 mb-6 shadow-xl ring-1 ring-blue-300/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
          <div className="flex items-center gap-3 text-white">
            <FaMicrochip className="text-emerald-400 text-2xl" />
            <FaUniversity className="text-blue-300 text-2xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Descargables − Instituto de Informática INFOUNA</h1>
          </div>
          <p className="text-slate-200 mt-2">Temarios, guías de inscripción y documentos informativos del Instituto de Informática INFOUNA.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/90 text-white font-mono tracking-wider">PDF</span>
            <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-600/90 text-white font-mono tracking-wider">DOCS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {descargables.map((item, i) => (
            <Card key={i} className="rounded-xl bg-white/95 border border-blue-100 backdrop-blur-sm hover:border-blue-200 hover:shadow-xl transition group">
              <CardHeader className="flex items-center gap-2">
                <FaFileAlt className="text-indigo-600 group-hover:text-blue-700" />
                <CardTitle className="text-gray-900 font-mono tracking-wide">{item.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{item.descripcion}</p>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={FaExternalLinkAlt}
                  disabled={item.url === '#'}
                  className="font-mono tracking-wider"
                  onClick={() => { if (item.url !== '#') window.open(item.url, '_blank', 'noopener'); }}
                >
                  {item.url === '#' ? 'Próximamente' : 'Descargar PDF'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export default DescargablesPage;

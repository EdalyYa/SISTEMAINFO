import React from 'react';
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
      <section className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Descargables PDF</h1>
          <p className="text-gray-600 mt-2">Temarios, guías de inscripción y reglamentos oficiales</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {descargables.map((item, i) => (
            <div key={i} className="border rounded-lg p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-blue-900">{item.titulo}</h2>
              <p className="text-gray-600 mt-1">{item.descripcion}</p>
              <div className="mt-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${item.url === '#' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (item.url === '#') e.preventDefault(); }}
                >
                  {item.url === '#' ? 'Próximamente' : 'Descargar PDF'}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>¿Necesitas un documento específico? Contáctanos y te lo enviamos por correo.</p>
        </div>
      </section>
    </main>
  );
}

export default DescargablesPage;

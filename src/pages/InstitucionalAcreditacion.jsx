import React from 'react';

function InstitucionalAcreditacion() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Acreditación Universitaria</h1>
        <p className="text-gray-600 mt-2">Consulta información oficial de acreditación de programas de la Universidad Nacional del Altiplano (UNAP). La evaluación y acreditación en el Perú es gestionada por el Sistema Nacional de Evaluación, Acreditación y Certificación de la Calidad Educativa (SINEACE).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">SINEACE − Información oficial</h2>
          <p className="text-sm text-gray-600 mt-2">Marco de acreditación, estándares de calidad, normativa y búsqueda de programas acreditados.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://www.sineace.gob.pe/" target="_blank" rel="noreferrer">sineace.gob.pe</a>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">UNAP − Noticias/Comunicados de acreditación</h2>
          <p className="text-sm text-gray-600 mt-2">Actualizaciones y comunicados institucionales relacionados con procesos de acreditación.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://transparencia.unap.edu.pe/web/" target="_blank" rel="noreferrer">transparencia.unap.edu.pe</a>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">SINEACE − UNAP (búsqueda por entidad)</h2>
          <p className="text-sm text-gray-600 mt-2">Resultados y notas referidas a programas acreditados vinculados a la UNAP.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://www.sineace.gob.pe/tag/universidad-nacional-del-altiplano/" target="_blank" rel="noreferrer">Tag UNAP en SINEACE</a>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500">Fuentes: SINEACE y portales institucionales UNAP (enlaces externos).</div>
    </div>
  );
}

export default InstitucionalAcreditacion;

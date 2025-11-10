import React from 'react';

function InstitucionalPoliticas() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Políticas y Reglamentos</h1>
        <p className="text-gray-600 mt-2">Reglamentos, directivas y políticas institucionales publicados por la Universidad Nacional del Altiplano (UNAP). Para normativa vigente, consulta siempre los portales oficiales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">Reglamentos − UNAP</h2>
          <p className="text-sm text-gray-600 mt-2">Repositorio de reglamentos y directivas institucionales.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://transparencia.unap.edu.pe/web/reglamentos-una-puno/" target="_blank" rel="noreferrer">transparencia.unap.edu.pe/reglamentos</a>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">Normativa y documentos complementarios</h2>
          <p className="text-sm text-gray-600 mt-2">Directivas, resoluciones y otros documentos administrativos.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://transparencia.unap.edu.pe/web/" target="_blank" rel="noreferrer">Portal de Transparencia UNAP</a>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500">Fuentes: Portal de Transparencia UNAP (enlaces externos).</div>
    </div>
  );
}

export default InstitucionalPoliticas;

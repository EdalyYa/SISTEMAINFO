import React from 'react';

function InstitucionalTransparencia() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transparencia INFOUNA / UNAP</h1>
        <p className="text-gray-600 mt-2">Accede a los portales oficiales de transparencia de la Universidad Nacional del Altiplano y a recursos institucionales relacionados. La información publicada es gestionada por las áreas responsables de la UNAP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">Portal de Transparencia UNAP</h2>
          <p className="text-sm text-gray-600 mt-2">Secciones de normativa, presupuesto, contrataciones, planeamiento, directorio institucional y más.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://transparencia.unap.edu.pe/web/" target="_blank" rel="noreferrer">transparencia.unap.edu.pe</a>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">Portal Nacional de Transparencia</h2>
          <p className="text-sm text-gray-600 mt-2">Enlace de la UNAP en el Portal de Transparencia Económica del Estado Peruano.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://www.transparencia.gob.pe/enlaces/pte_transparencia_enlaces.aspx?id_entidad=10449" target="_blank" rel="noreferrer">transparencia.gob.pe − UNAP</a>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">InfoUNA − Sitio institucional</h2>
          <p className="text-sm text-gray-600 mt-2">Información general del Instituto de Informática de la UNAP (programas, cursos y avisos).</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://infouna.unap.edu.pe/" target="_blank" rel="noreferrer">infouna.unap.edu.pe</a>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900">Solicitudes de acceso a la información</h2>
          <p className="text-sm text-gray-600 mt-2">Para tramitar solicitudes, utiliza los canales oficiales indicados por la UNAP.</p>
          <a className="inline-block mt-3 text-blue-600 hover:underline" href="https://transparencia.unap.edu.pe/web/" target="_blank" rel="noreferrer">Ver guía en Transparencia UNAP</a>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500">Fuentes: Transparencia UNAP y Portal Nacional de Transparencia (enlaces externos).</div>
    </div>
  );
}

export default InstitucionalTransparencia;

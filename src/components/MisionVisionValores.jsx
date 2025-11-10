import React from 'react';

const MisionVisionValores = () => (
  <section className="my-12 max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-800 mb-4">Misión, Visión y Valores</h2>
    <div className="grid md:grid-cols-2 gap-8 mb-8">
      <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col items-center">
        <svg className="w-12 h-12 text-yellow-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
        <h3 className="font-semibold text-2xl mb-2">Misión</h3>
        <p className="text-gray-600 text-center">Formar profesionales íntegros y competentes en informática, promoviendo la innovación y el desarrollo tecnológico en la región.</p>
      </div>
      <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col items-center">
        <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h-1v-4h-1m-4 4h-1v-4h-1"/></svg>
        <h3 className="font-semibold text-2xl mb-2">Visión</h3>
        <p className="text-gray-600 text-center">Ser el instituto líder en educación tecnológica y certificación profesional, reconocido por su excelencia y compromiso social.</p>
      </div>
    </div>
    <div className="grid md:grid-cols-4 gap-6">
      <div className="bg-blue-100 rounded-lg p-6 shadow flex flex-col items-center">
        <svg className="w-10 h-10 text-blue-700 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2h5"/></svg>
        <h4 className="font-semibold text-lg mb-1">Comunidad</h4>
        <p className="text-gray-600 text-center text-sm">Fomentamos el trabajo colaborativo y el sentido de pertenencia.</p>
      </div>
      <div className="bg-blue-100 rounded-lg p-6 shadow flex flex-col items-center">
        <svg className="w-10 h-10 text-green-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2"/></svg>
        <h4 className="font-semibold text-lg mb-1">Crecimiento</h4>
        <p className="text-gray-600 text-center text-sm">Impulsamos el desarrollo personal, académico y profesional.</p>
      </div>
      <div className="bg-blue-100 rounded-lg p-6 shadow flex flex-col items-center">
        <svg className="w-10 h-10 text-yellow-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        <h4 className="font-semibold text-lg mb-1">Innovación</h4>
        <p className="text-gray-600 text-center text-sm">Promovemos la creatividad y la adopción de nuevas tecnologías.</p>
      </div>
      <div className="bg-blue-100 rounded-lg p-6 shadow flex flex-col items-center">
        <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.866 0-7 2.239-7 5v3h14v-3c0-2.761-3.134-5-7-5z"/></svg>
        <h4 className="font-semibold text-lg mb-1">Sostenibilidad</h4>
        <p className="text-gray-600 text-center text-sm">Trabajamos por el desarrollo sostenible y la responsabilidad social.</p>
      </div>
    </div>
  </section>
);

export default MisionVisionValores;

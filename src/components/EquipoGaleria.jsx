import React from 'react';

const EquipoGaleria = () => (
  <section className="my-12 max-w-5xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-800 mb-4">Nuestro Equipo</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="flex flex-col items-center">
        <img src="/equipo1.jpg" alt="Docente 1" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 mb-2" />
        <span className="font-semibold text-blue-700">Ing. Rosa Mamani</span>
        <span className="text-sm text-gray-500">Especialista en Redes</span>
      </div>
      <div className="flex flex-col items-center">
        <img src="/equipo2.jpg" alt="Docente 2" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 mb-2" />
        <span className="font-semibold text-blue-700">Lic. Pedro Quispe</span>
        <span className="text-sm text-gray-500">Desarrollo Web</span>
      </div>
      <div className="flex flex-col items-center">
        <img src="/equipo3.jpg" alt="Docente 3" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 mb-2" />
        <span className="font-semibold text-blue-700">MSc. Ana Torres</span>
        <span className="text-sm text-gray-500">Inteligencia Artificial</span>
      </div>
      <div className="flex flex-col items-center">
        <img src="/equipo4.jpg" alt="Docente 4" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 mb-2" />
        <span className="font-semibold text-blue-700">Dr. Luis Huanca</span>
        <span className="text-sm text-gray-500">Bases de Datos</span>
      </div>
    </div>
  </section>
);

export default EquipoGaleria;

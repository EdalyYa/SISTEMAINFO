import React from 'react';
import MisionVisionValores from '../components/MisionVisionValores';
import DirectorBio from '../components/DirectorBio';
import EquipoGaleria from '../components/EquipoGaleria';
import Timeline from '../components/Timeline';

function Nosotros() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-white to-blue-50 border border-blue-100 p-5 mb-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Nosotros</h1>
          </div>
          <p className="text-gray-700 text-sm md:text-base font-mono">Conoce nuestra misión, equipo y trayectoria institucional</p>
        </div>
      </div>
      <MisionVisionValores />
      <DirectorBio />
      <EquipoGaleria />
      <Timeline />
    </div>
  );
}

export default Nosotros;

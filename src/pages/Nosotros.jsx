import React from 'react';
import MisionVisionValores from '../components/MisionVisionValores';
import DirectorBio from '../components/DirectorBio';
import EquipoGaleria from '../components/EquipoGaleria';
import Timeline from '../components/Timeline';

function Nosotros() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-blue-900 mb-8">Nosotros</h1>
      <MisionVisionValores />
      <DirectorBio />
      <EquipoGaleria />
      <Timeline />
    </div>
  );
}

export default Nosotros;

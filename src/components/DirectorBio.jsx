import React from 'react';
import directorImg from '../Imagenes/people/Director.jpg';

const DirectorBio = () => (
  <section className="my-12 bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-800 mb-4">Biografía del Director</h2>
    <div className="flex flex-col md:flex-row items-center gap-6">
      <img src={directorImg} alt="Director INFOUNA" className="w-32 h-32 rounded-full object-cover border-4 border-blue-200" />
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-2">Dr. Juan Pérez Quispe</h3>
        <p className="text-gray-700 mb-2">Director General del Instituto de Informática INFOUNA</p>
        <p className="text-gray-600 text-sm">Doctor en Ciencias de la Computación, con más de 20 años de experiencia en educación superior y gestión de proyectos tecnológicos. Apasionado por la innovación educativa y el desarrollo profesional de los jóvenes de la región.</p>
      </div>
    </div>
  </section>
);

export default DirectorBio;

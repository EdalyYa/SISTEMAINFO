import React from 'react';

const Timeline = () => (
  <div className="my-12">
    <h2 className="text-2xl font-bold text-blue-800 mb-4">Historia INFOUNA</h2>
    <ol className="relative border-l-4 border-blue-200 ml-4">
      <li className="mb-10 ml-6">
        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>
        </span>
        <h3 className="font-semibold text-lg text-blue-700">2005 - Fundación</h3>
        <p className="text-gray-600">Se crea el Instituto de Informática INFOUNA con el objetivo de impulsar la educación tecnológica en la región.</p>
      </li>
      <li className="mb-10 ml-6">
        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>
        </span>
        <h3 className="font-semibold text-lg text-blue-700">2012 - Modernización</h3>
        <p className="text-gray-600">Actualización de infraestructura y programas académicos para responder a los retos del siglo XXI.</p>
      </li>
      <li className="mb-10 ml-6">
        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>
        </span>
        <h3 className="font-semibold text-lg text-blue-700">2020 - Innovación Digital</h3>
        <p className="text-gray-600">Implementación de plataformas virtuales y nuevos cursos en tecnologías emergentes.</p>
      </li>
      <li className="ml-6">
        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>
        </span>
        <h3 className="font-semibold text-lg text-blue-700">2025 - Referente Regional</h3>
        <p className="text-gray-600">INFOUNA se consolida como referente en educación tecnológica y certificación profesional en la región.</p>
      </li>
    </ol>
  </div>
);

export default Timeline;

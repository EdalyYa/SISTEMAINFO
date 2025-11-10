import React from 'react';
import { Link } from 'react-router-dom';

function HeroBanner() {
  return (
    <section className="bg-gradient-to-br from-blue-900 to-indigo-700 text-white py-8 md:py-10 px-4 text-center rounded-xl shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">Impulsa tu futuro con INFOUNA</h1>
      <p className="text-sm md:text-base mb-5 max-w-3xl mx-auto opacity-90">
        Formación tecnológica y certificaciones oficiales para la comunidad UNA y público en general.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          to="/programas"
          className="rounded-full bg-white text-blue-900 font-semibold px-4 py-2 text-sm shadow hover:shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Explorar Programas
        </Link>
        <Link
          to="/cursos"
          className="rounded-full bg-blue-600 text-white font-semibold px-4 py-2 text-sm shadow hover:shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Ver Cursos
        </Link>
      </div>
    </section>
  );
}

export default HeroBanner;

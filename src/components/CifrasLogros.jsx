import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

function CifrasLogros({ embedded = false }) {
  const [cifras, setCifras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCifras = async () => {
      try {
        const response = await fetch(`${API_BASE}/cifras-logros`);
        if (!response.ok) {
          throw new Error('Error al cargar las cifras de logros');
        }
        const data = await response.json();
        // Filter out "Convenios Empresariales"
        const filteredData = data.filter(cifra => cifra.label !== 'Convenios Empresariales');
        setCifras(filteredData);
      } catch (err) {
        console.error('Error fetching cifras:', err);
        setError(err.message);
        // Fallback a datos estáticos en caso de error
        setCifras([
          { id: 1, label: 'Estudiantes Certificados', valor: '2000+' },
          { id: 2, label: 'Programas Especializados', valor: '15+' },
          { id: 3, label: 'Docentes Calificados', valor: '30+' },
          { id: 4, label: 'Años Formando Profesionales', valor: '15+' },
          { id: 5, label: 'Laboratorios Modernos', valor: '8' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCifras();
  }, []);

  const Wrapper = embedded ? 'div' : 'section';
  const wrapperClass = embedded ? '' : 'py-6 bg-white';
  const containerClass = embedded ? '' : 'max-w-6xl mx-auto px-4';
  const titleClass = embedded
    ? 'text-base md:text-lg font-bold text-blue-900 mb-2 text-center'
    : 'text-xl md:text-2xl font-bold text-blue-900 mb-4 text-center';
  const gridClass = embedded
    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3'
    : 'grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4';

  if (loading) {
    return (
      <Wrapper className={wrapperClass}>
        <div className={containerClass}>
          <h2 className={titleClass}>Logros INFOUNA</h2>
          <div className={gridClass}>
            {[...Array(4)].map((_, index) => (
            <div key={index} className={`bg-white border rounded-xl ${embedded ? 'p-2.5' : 'p-4'} shadow-sm animate-pulse`}>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        </div>
      </Wrapper>
    );
  }

  if (error && cifras.length === 0) {
    return (
      <Wrapper className={wrapperClass}>
        <div className={`${containerClass} text-center`}>
          <h2 className={titleClass}>Logros INFOUNA</h2>
          <p className="text-red-600 text-sm">Error al cargar los logros. Por favor, intente más tarde.</p>
        </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper className={wrapperClass}>
      <div className={containerClass}>
        <h2 className={titleClass}>Logros INFOUNA</h2>
        <div className={gridClass}>
          {cifras.map((c, i) => (
            <div
              key={i}
              className={`bg-white border rounded-xl ${embedded ? 'p-2.5' : 'p-4'} shadow-sm hover:shadow-md transition duration-200`}
            >
              <div className={`${embedded ? 'text-lg md:text-xl' : 'text-2xl'} font-bold text-blue-900`}>{c.valor}</div>
              <div className={`${embedded ? 'text-[11px] md:text-xs' : 'text-sm'} text-gray-700`}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

export default CifrasLogros;

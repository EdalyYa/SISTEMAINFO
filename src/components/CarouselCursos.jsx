import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config/api';
import { Link } from 'react-router-dom';
import courseImg1 from '../Imagenes/cursos/course1.jpg';
import courseImg2 from '../Imagenes/cursos/course2.jpg';
import courseImg3 from '../Imagenes/cursos/course3.jpg';
import courseImg4 from '../Imagenes/cursos/course4.jpg';

function CarouselCursos({ cursos: cursosProp, title = 'Cursos Destacados', hideHeader = false, verMasTo = '/cursos-libres', compact = false, align = 'center', direction = 'left' }) {
  const [cursos, setCursos] = useState(cursosProp || []);
  const [loading, setLoading] = useState(!cursosProp);
  const [isPaused, setIsPaused] = useState(false);

  // Carrusel multi-item (al menos 5 visibles)
  const [itemsPerView, setItemsPerView] = useState(5); // Desktop: 5 visibles
  const trackRef = useRef(null);
  const itemRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Si recibimos cursos por props, usamos esos y evitamos fetch
    if (Array.isArray(cursosProp) && cursosProp.length > 0) {
      setCursos(cursosProp);
      setLoading(false);
      return;
    }

    const fetchCursos = async () => {
      try {
        const response = await fetch(`${API_BASE}/cursos-libres`);
        if (response.ok) {
          const data = await response.json();
          // Mostrar más cursos para que se vean 5 con movimiento
          setCursos(data.slice(0, 12));
        } else {
          console.error('Error al obtener cursos libres:', response.statusText);
          setCursos([
            { nombre: 'AutoCAD I - Básico', descripcion: 'Diseño asistido por computadora - Modalidad presencial, 72 horas' },
            { nombre: 'Programación en Python', descripcion: 'Lenguaje de programación versátil - Modalidad presencial, 96 horas' },
            { nombre: 'Excel Avanzado', descripcion: 'Análisis de datos y dashboards - Modalidad presencial, 60 horas' },
            { nombre: 'Bases de Datos SQL', descripcion: 'Administración y consultas de BD - Modalidad virtual, 80 horas' },
            { nombre: 'Power BI', descripcion: 'Visualización y BI - Presencial, 40h' },
            { nombre: 'Estadística Aplicada', descripcion: 'Fundamentos para análisis de datos - Presencial, 40h' },
            { nombre: 'Redes Básico', descripcion: 'Conceptos y conectividad - Presencial, 40h' },
            { nombre: 'Oracle', descripcion: 'BD empresarial - Presencial, 40h' },
            { nombre: 'MongoDB', descripcion: 'Base de datos NoSQL - Presencial, 40h' },
            { nombre: 'SQL Avanzado', descripcion: 'Consultas complejas - Virtual, 60h' },
            { nombre: 'Big Data', descripcion: 'Análisis de grandes volúmenes - Virtual, 40h' },
            { nombre: 'Software Stata', descripcion: 'Estadística y econometría - Presencial, 40h' },
          ]);
        }
      } catch (error) {
        console.error('Error al conectar con el backend (cursos libres):', error);
        setCursos([
          { nombre: 'AutoCAD I - Básico', descripcion: 'Diseño asistido por computadora - Modalidad presencial, 72 horas' },
          { nombre: 'Programación en Python', descripcion: 'Lenguaje de programación versátil - Modalidad presencial, 96 horas' },
          { nombre: 'Excel Avanzado', descripcion: 'Análisis de datos y dashboards - Modalidad presencial, 60 horas' },
          { nombre: 'Bases de Datos SQL', descripcion: 'Administración y consultas de BD - Modalidad virtual, 80 horas' },
          { nombre: 'Power BI', descripcion: 'Visualización y BI - Presencial, 40h' },
          { nombre: 'Estadística Aplicada', descripcion: 'Fundamentos para análisis de datos - Presencial, 40h' },
          { nombre: 'Redes Básico', descripcion: 'Conceptos y conectividad - Presencial, 40h' },
          { nombre: 'Oracle', descripcion: 'BD empresarial - Presencial, 40h' },
          { nombre: 'MongoDB', descripcion: 'Base de datos NoSQL - Presencial, 40h' },
          { nombre: 'SQL Avanzado', descripcion: 'Consultas complejas - Virtual, 60h' },
          { nombre: 'Big Data', descripcion: 'Análisis de grandes volúmenes - Virtual, 40h' },
          { nombre: 'Software Stata', descripcion: 'Estadística y econometría - Presencial, 40h' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [cursosProp]);

  // Responsivo: ajustar items visibles por ancho
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerView(1);
      else if (w < 768) setItemsPerView(2);
      else if (w < 1024) setItemsPerView(3);
      else if (w < 1280) setItemsPerView(4);
      else setItemsPerView(5);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Calcular ancho del item para transición precisa
  useEffect(() => {
    const measure = () => {
      const el = itemRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        // Sumamos un margen derecho usado en el item (16px)
        setItemWidth(rect.width + 16);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [cursos, itemsPerView]);

  // Inicializar offset según dirección
  useEffect(() => {
    if (loading || cursos.length === 0 || itemWidth === 0) return;
    const total = cursos.length;
    const maxOffset = Math.max(0, (total * itemWidth) - (itemsPerView * itemWidth));
    setOffset(direction === 'right' ? maxOffset : 0);
  }, [direction, loading, cursos.length, itemWidth, itemsPerView]);

  // Auto movimiento continuo (dirección configurable)
  useEffect(() => {
    if (loading || cursos.length === 0) return;
    const id = setInterval(() => {
      if (!isPaused) {
        setOffset((prev) => {
          const total = cursos.length;
          const maxOffset = Math.max(0, (total * itemWidth) - (itemsPerView * itemWidth));
          if (direction === 'left') {
            const next = prev + itemWidth;
            return next > maxOffset ? 0 : next;
          } else {
            const next = prev - itemWidth;
            return next < 0 ? maxOffset : next;
          }
        });
      }
    }, 2500);
    return () => clearInterval(id);
  }, [loading, cursos.length, itemWidth, isPaused, direction, itemsPerView]);

  // Helpers para mostrar imagen real del curso
  const ASSET_BASE = API_BASE.replace('/api', '');
  const esImagen = (valor) => /\.(png|jpg|jpeg|gif|webp)$/i.test(String(valor || ''));
  const obtenerImagenPorCategoria = (categoria) => {
    const mapping = {
      'programacion': courseImg1,
      'analisis': courseImg2,
      'diseno': courseImg3,
      'sistemas': courseImg4,
      'bases-datos': courseImg2,
      'redes': courseImg4,
      'tecnologia': courseImg1,
      'ia': courseImg3,
      'seguridad': courseImg4,
      'cloud': courseImg1,
      'gis': courseImg2,
      'documentos': courseImg3,
      'oficina': courseImg2,
    };
    return mapping[categoria] || courseImg1;
  };
  const resolverImagenCurso = (curso) => {
    const v = curso?.icono || '';
    if (!v) return obtenerImagenPorCategoria(curso.categoria);
    if (String(v).startsWith('http')) return v;
    if (String(v).includes('/uploads')) {
      const path = String(v).startsWith('/') ? String(v) : `/${String(v)}`;
      return `${ASSET_BASE}${path}`;
    }
    if (esImagen(v)) {
      return `${ASSET_BASE}/uploads/cursos_libres/${v}`;
    }
    return obtenerImagenPorCategoria(curso.categoria);
  };

  if (loading) {
    return (
      <section className="bg-blue-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">{title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 border rounded-xl shadow bg-white animate-pulse">
                <div className="h-28 bg-gray-200 rounded mb-3"></div>
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (cursos.length === 0) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">{title}</h2>
          <div className="p-6 border rounded-xl shadow-lg bg-white">
            <p className="text-gray-600">No hay cursos disponibles en este momento.</p>
          </div>
        </div>
      </section>
    );
  }

  const outerClasses = compact
    ? "py-2"
    : "bg-gradient-to-br from-blue-50 to-indigo-50 py-10 px-6";

  const containerAlignClass = align === 'right'
    ? 'ml-auto'
    : align === 'left'
      ? 'mr-auto'
      : 'mx-auto';

  return (
    <div className={outerClasses}>
      <div className={`max-w-6xl ${containerAlignClass}`}>
        {!hideHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-900">{title}</h2>
            <div className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">{cursos.length} cursos</div>
          </div>
        )}

        {/* Carrusel de tarjetas: 5 visibles, autodesplazamiento */}
        <div
          className="relative p-4 border border-gray-100 rounded-3xl bg-white shadow-xl overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Track */}
          <div
            ref={trackRef}
            className="flex will-change-transform transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {cursos.map((curso, i) => (
              <div
                key={`curso-${i}`}
                ref={i === 0 ? itemRef : null}
                className="mr-4"
                style={{ flex: `0 0 ${100 / itemsPerView}%` }}
              >
                <div className="h-full bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="relative">
                    {resolverImagenCurso(curso) ? (
                      <div className="h-28 rounded-xl mb-3 overflow-hidden ring-1 ring-gray-200">
                        <img
                          src={resolverImagenCurso(curso)}
                          alt={`Imagen ${curso.nombre}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl mb-3 flex items-center justify-center">
                        <span className="text-3xl text-blue-600">📘</span>
                      </div>
                    )}
                    {curso.categoria && (
                      <span className="absolute -top-2 left-0 inline-block text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {String(curso.categoria).replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1 truncate">{curso.nombre}</h3>
                  <p className="text-gray-700 text-xs md:text-sm overflow-hidden max-h-10">
                    {curso.descripcion || `${curso.modalidad || 'Modalidad presencial'} - ${curso.duracion || 'Duración por definir'}`}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                      {curso.horas ? `${curso.horas}h` : '40h'}
                    </span>
                    <Link to={`${verMasTo}${curso.id ? `?id=${curso.id}` : ''}`} className="text-[12px] font-medium text-blue-700 hover:text-blue-900">Ver más</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles opcionales */}
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-between pointer-events-none">
            <button
              className="pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-2 shadow hover:from-blue-700 hover:to-indigo-700 transition"
              onClick={() => setOffset((prev) => Math.max(0, prev - itemWidth))}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              className="pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-2 shadow hover:from-blue-700 hover:to-indigo-700 transition"
              onClick={() => {
                const total = cursos.length;
                const maxOffset = Math.max(0, (total * itemWidth) - (itemsPerView * itemWidth));
                setOffset((prev) => (prev + itemWidth > maxOffset ? 0 : prev + itemWidth));
              }}
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarouselCursos;

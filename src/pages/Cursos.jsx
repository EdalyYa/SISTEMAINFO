import React, { useState, useMemo, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { resolveAssetUrl } from '../utils/assetUrl';
import { FaFilter, FaSearch } from 'react-icons/fa';
import infoLogo from '../logo.png';

// Datos estáticos como fallback
const staticPrograms = [
  {
    id: 1,
    title: 'Especialista en Diseño Multimedia',
    description: 'Dirigido a creativos que buscan dominar herramientas para el diseño multimedia',
    courses: [
      {
        name: 'Adobe Photoshop CC 2024',
        modality: 'Presencial',
        schedule: 'Lunes y Miércoles 6-8pm',
        image: '/program1.jpg',
        duration: '72 horas',
        instructor: 'Prof. Juan Pérez',
        level: 'Intermedio',
        program: 'Diseño Multimedia'
      },
      {
        name: 'Adobe Illustrator Avanzado',
        modality: 'Virtual',
        schedule: 'Martes y Jueves 7-9pm',
        image: '/program1.jpg',
        duration: '48 horas',
        instructor: 'Prof. María López',
        level: 'Avanzado',
        program: 'Diseño Multimedia'
      },
    ],
  },
  {
    id: 2,
    title: 'Especialista en Excel',
    description: 'Profesionales que desean mejorar sus habilidades en Excel',
    courses: [
      {
        name: 'Excel Básico a Intermedio',
        modality: 'Presencial',
        schedule: 'Lunes y Miércoles 4-6pm',
        image: '/program2.jpg',
        duration: '60 horas',
        instructor: 'Prof. Carlos Rodríguez',
        level: 'Básico',
        program: 'Excel'
      },
    ],
  },
  {
    id: 3,
    title: 'Especialista en Programación Web',
    description: 'Aprende a desarrollar aplicaciones web modernas y responsivas',
    courses: [
      {
        name: 'HTML5, CSS3 y JavaScript',
        modality: 'Presencial',
        schedule: 'Lunes y Miércoles 6-8pm',
        image: '/program3.jpg',
        duration: '72 horas',
        instructor: 'Prof. Luis Martínez',
        level: 'Intermedio',
        program: 'Programación Web'
      },
      {
        name: 'React y Node.js',
        modality: 'Virtual',
        schedule: 'Martes y Jueves 7-9pm',
        image: '/program3.jpg',
        duration: '60 horas',
        instructor: 'Prof. Carmen Díaz',
        level: 'Avanzado',
        program: 'Programación Web'
      },
    ],
  },
  {
    id: 4,
    title: 'Especialista en Redes y Seguridad',
    description: 'Formación en administración de redes y seguridad informática',
    courses: [
      {
        name: 'Redes Cisco',
        modality: 'Presencial',
        schedule: 'Lunes y Miércoles 6-8pm',
        image: '/program4.jpg',
        duration: '80 horas',
        instructor: 'Prof. Roberto Sánchez',
        level: 'Intermedio',
        program: 'Redes y Seguridad'
      },
      {
        name: 'Seguridad Informática',
        modality: 'Virtual',
        schedule: 'Martes y Jueves 7-9pm',
        image: '/program4.jpg',
        duration: '70 horas',
        instructor: 'Prof. Ana García',
        level: 'Avanzado',
        program: 'Redes y Seguridad'
      },
    ],
  },
  {
    id: 5,
    title: 'Especialista en Inteligencia Artificial',
    description: 'Introducción y aplicaciones prácticas de IA y aprendizaje automático',
    courses: [
      {
        name: 'Machine Learning Básico',
        modality: 'Presencial',
        schedule: 'Lunes y Miércoles 6-8pm',
        image: '/program5.jpg',
        duration: '90 horas',
        instructor: 'Prof. David Torres',
        level: 'Intermedio',
        program: 'Inteligencia Artificial'
      },
      {
        name: 'Deep Learning Avanzado',
        modality: 'Virtual',
        schedule: 'Martes y Jueves 7-9pm',
        image: '/program5.jpg',
        duration: '100 horas',
        instructor: 'Prof. Elena Ruiz',
        level: 'Avanzado',
        program: 'Inteligencia Artificial'
      },
    ],
  },
  {
    id: 6,
    title: 'Especialista en Bases de Datos',
    description: 'Diseño, administración y optimización de bases de datos',
    courses: [
      {
        name: 'MySQL y PostgreSQL',
        modality: 'Presencial',
        schedule: 'Lunes y Miércoles 6-8pm',
        image: '/program6.jpg',
        duration: '75 horas',
        instructor: 'Prof. Miguel Herrera',
        level: 'Intermedio',
        program: 'Bases de Datos'
      },
      {
        name: 'MongoDB y NoSQL',
        modality: 'Virtual',
        schedule: 'Martes y Jueves 7-9pm',
        image: '/program6.jpg',
        duration: '65 horas',
        instructor: 'Prof. Laura Vega',
        level: 'Avanzado',
        program: 'Bases de Datos'
      },
    ],
  },
];

function Cursos() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  // Utilidades para normalizar textos y unificar filtros
  const normalize = (val) => (val || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const displayModality = (m) => {
    const n = normalize(m);
    if (n === 'virtual') return 'Virtual';
    if (n === 'presencial') return 'Presencial';
    return m || 'Otro';
  };

  const displayLevel = (l) => {
    const n = normalize(l);
    if (n === 'basico') return 'Básico';
    if (n === 'intermedio') return 'Intermedio';
    if (n === 'avanzado') return 'Avanzado';
    return l || 'Nivel';
  };

  const esNombreDeImagen = (v) => typeof v === 'string' && /\.(png|jpg|jpeg|gif|webp)$/i.test(v);
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    const v = String(path);
    if (v.startsWith('http')) return v;
    // Si viene como "/uploads/..." o "/src/Imagenes/..." usar backend
    if (v.includes('/uploads') || v.includes('/src/Imagenes')) {
      return resolveAssetUrl(v);
    }
    // Si sólo es nombre de archivo, asumir carpeta conocida en backend
    if (esNombreDeImagen(v)) {
      return resolveAssetUrl(`/uploads/cursos/${v}`);
    }
    return null;
  };

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch(`${API_BASE}/cursos`);
        if (response.ok) {
          const cursos = await response.json();
          
          // Agrupar cursos por programa
          const programsMap = {};
          cursos.forEach(curso => {
            const programName = curso.programa_nombre || 'Otros Cursos';
            if (!programsMap[programName]) {
              programsMap[programName] = {
                id: curso.programa_id || 0,
                title: programName,
                description: `Cursos especializados en ${programName}`,
                courses: []
              };
            }
            const rawImage = curso.icono || curso.imagen;
            programsMap[programName].courses.push({
              id: curso.id,
              name: curso.nombre,
              modality: displayModality(curso.modalidad || 'Presencial'),
              schedule: curso.horario || 'Por definir',
              duration: curso.duracion || 'Por definir',
              instructor: curso.instructor || 'Por asignar',
              level: displayLevel(curso.nivel || 'Básico'),
              program: programName,
              price: curso.precio || 0,
              description: curso.descripcion || '',
              image: resolveImageUrl(rawImage) || infoLogo,
            });
          });
          
          setPrograms(Object.values(programsMap));
        } else {
          console.error('Error al obtener cursos:', response.statusText);
          // Fallback a datos estáticos
          // Aseguramos normalización también en fallback
          setPrograms(
            staticPrograms.map(p => ({
              ...p,
              courses: p.courses.map(c => ({
                ...c,
                modality: displayModality(c.modality),
                level: displayLevel(c.level)
              }))
            }))
          );
        }
      } catch (error) {
        console.error('Error al conectar con el backend:', error);
        // Fallback a datos estáticos
        setPrograms(
          staticPrograms.map(p => ({
            ...p,
            courses: p.courses.map(c => ({
              ...c,
              modality: displayModality(c.modality),
              level: displayLevel(c.level)
            }))
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  // Flatten all courses from all programs
  const allCourses = useMemo(() => {
    return programs.flatMap(program =>
      program.courses.map(course => ({
        ...course,
        programId: program.id,
        programTitle: program.title
      }))
    );
  }, [programs]);

  // Valores únicos para filtros (normalizados y ordenados)
  const modalities = useMemo(() => {
    const set = new Set();
    allCourses.forEach(c => {
      const d = displayModality(c.modality);
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allCourses]);

  const levels = useMemo(() => {
    const set = new Set();
    allCourses.forEach(c => {
      const d = displayLevel(c.level);
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allCourses]);

  const programNames = useMemo(() => {
    const map = new Map();
    allCourses.forEach(c => {
      const n = normalize(c.program);
      const display = (c.program || '').trim();
      if (!map.has(n) && display) map.set(n, display);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [allCourses]);

  // Conteos por opción (para mostrar en los selects)
  const modalityCounts = useMemo(() => {
    const counts = {};
    allCourses.forEach(c => {
      const k = displayModality(c.modality);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [allCourses]);

  const levelCounts = useMemo(() => {
    const counts = {};
    allCourses.forEach(c => {
      const k = displayLevel(c.level);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [allCourses]);

  const programCounts = useMemo(() => {
    const counts = {};
    allCourses.forEach(c => {
      const k = (c.program || '').trim();
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [allCourses]);

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    const q = normalize(searchTerm);
    return allCourses.filter(course => {
      const matchesSearch = !q ||
        normalize(course.name).includes(q) ||
        normalize(course.program).includes(q) ||
        normalize(course.instructor).includes(q);

      const matchesModality = !selectedModality || normalize(course.modality) === normalize(selectedModality);
      const matchesLevel = !selectedLevel || normalize(course.level) === normalize(selectedLevel);
      const matchesProgram = !selectedProgram || normalize(course.program) === normalize(selectedProgram);

      return matchesSearch && matchesModality && matchesLevel && matchesProgram;
    });
  }, [allCourses, searchTerm, selectedModality, selectedLevel, selectedProgram]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedModality('');
    setSelectedLevel('');
    setSelectedProgram('');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-blue-900 mb-1">Todos los Cursos</h1>
            <p className="text-sm text-gray-600">Cargando cursos...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-3 animate-pulse">
                <div className="h-5 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Todos los Cursos</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Catálogo completo de cursos con opciones de filtrado y búsqueda para encontrar el curso perfecto.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-100 p-2 mb-4">
          <div className="flex flex-col lg:flex-row gap-2 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos, programas o instructores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Todas las modalidades</option>
                {modalities.map(modality => (
                  <option key={modality} value={modality}>{modality} ({modalityCounts[modality] || 0})</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Todos los niveles</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level} ({levelCounts[level] || 0})</option>
                ))}
              </select>

              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Todos los programas</option>
                {programNames.map(program => (
                  <option key={program} value={program}>{program} ({programCounts[program] || 0})</option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1.5 text-sm"
              >
                <FaFilter />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-2">
          <p className="text-gray-600 text-sm">
            Mostrando {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} 
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-500 mb-4">
              Intenta ajustar tus filtros o términos de búsqueda
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver todos los cursos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredCourses.map((course, index) => (
              <div key={`${course.programId}-${index}`} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-24 bg-gray-100">
                  <img src={course.image || coursePlaceholder} alt={course.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {course.name}
                    </h3>
                    <span className={`px-1.5 py-0.5 text-[11px] rounded-full ${
                      course.modality === 'Virtual' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {course.modality}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 mb-2">
                    <p><strong>Programa:</strong> {course.program}</p>
                    <p><strong>Instructor:</strong> {course.instructor}</p>
                    <p><strong>Duración:</strong> {course.duration}</p>
                    <p><strong>Horario:</strong> {course.schedule}</p>
                    <p><strong>Nivel:</strong> 
                      <span className={`ml-2 px-1.5 py-0.5 text-[11px] rounded-full ${
                        course.level === 'Básico' ? 'bg-green-100 text-green-800' :
                        course.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-blue-600">
                      {course.price ? `$${course.price}` : 'Consultar precio'}
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cursos;

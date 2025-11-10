import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE } from '../config/api';
import courseImg1 from '../Imagenes/cursos/course1.jpg';
import courseImg2 from '../Imagenes/cursos/course2.jpg';
import courseImg3 from '../Imagenes/cursos/course3.jpg';
import courseImg4 from '../Imagenes/cursos/course4.jpg';

const CursosLibres = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCourses, setVisibleCourses] = useState(12);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cursosLibres, setCursosLibres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch(`${API_BASE}/cursos-libres`);
        if (response.ok) {
          const cursos = await response.json();
          
          // Los datos ya vienen en el formato correcto de la API de cursos-libres
          setCursosLibres(cursos);
        } else {
          console.error('Error al obtener cursos:', response.statusText);
          // Fallback a datos estáticos
          setCursosLibres(getStaticCursos());
        }
      } catch (error) {
        console.error('Error al conectar con el backend:', error);
        // Fallback a datos estáticos
        setCursosLibres(getStaticCursos());
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  // Abrir modal de detalles si llega query ?id= desde otra página (p.ej., carrusel)
  useEffect(() => {
    if (loading) return;
    try {
      const params = new URLSearchParams(location.search || '');
      const idParam = params.get('id');
      if (idParam) {
        const found = cursosLibres.find(c => String(c.id) === String(idParam));
        if (found) {
          setSelectedCourse(found);
          setIsModalOpen(true);
        }
      }
    } catch (_) {}
  }, [loading, location.search, cursosLibres]);

  const mapearCategoria = (programaNombre) => {
    const mapeo = {
      'Diseño Multimedia': 'diseno',
      'Excel': 'analisis',
      'Programación Web': 'programacion',
      'Redes y Seguridad': 'redes',
      'Inteligencia Artificial': 'ia',
      'Bases de Datos': 'bases-datos'
    };
    return mapeo[programaNombre] || 'tecnologia';
  };

  const obtenerIconoPorCategoria = (categoria) => {
    const iconos = {
      'programacion': '💻',
      'diseno': '🎨',
      'analisis': '📊',
      'sistemas': '🖥️',
      'bases-datos': '🗄️',
      'redes': '🌐',
      'tecnologia': '🚀',
      'ia': '🤖',
      'seguridad': '🔒',
      'cloud': '☁️',
      'gis': '🗺️',
      'documentos': '📄',
      'oficina': '📊'
    };
    return iconos[categoria] || '🎯';
  };

  // Imágenes pequeñas por categoría (placeholders)
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

  const ASSET_BASE = API_BASE.replace('/api', '');
  const esImagen = (valor) => typeof valor === 'string' && /\.(png|jpg|jpeg|gif)$/i.test(valor);
  // Corrige problemas de codificación (mojibake) en textos con acentos
  const fixMojibake = (s) => {
    if (!s) return '';
    try {
      const bytes = new Uint8Array([...s].map(ch => ch.charCodeAt(0)));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      if (decoded && decoded !== s && !decoded.includes('\uFFFD')) return decoded;
    } catch {}
    return s;
  };
  const resolverImagenCurso = (curso) => {
    const v = curso?.icono || '';
    if (!v) return obtenerImagenPorCategoria(curso.categoria);
    if (v.startsWith('http')) return v;
    if (v.includes('/uploads')) {
      const path = v.startsWith('/') ? v : `/${v}`;
      return `${ASSET_BASE}${path}`;
    }
    if (esImagen(v) || v.length > 0) {
      return `${ASSET_BASE}/uploads/cursos_libres/${v}`;
    }
    return obtenerImagenPorCategoria(curso.categoria);
  };

  const obtenerColorPorCategoria = (categoria) => {
    const colores = {
      'programacion': 'from-blue-500 to-blue-700',
      'diseno': 'from-purple-500 to-pink-500',
      'analisis': 'from-green-500 to-green-700',
      'sistemas': 'from-gray-500 to-gray-700',
      'bases-datos': 'from-orange-500 to-orange-700',
      'redes': 'from-cyan-500 to-blue-500',
      'tecnologia': 'from-yellow-500 to-orange-500',
      'ia': 'from-purple-600 to-indigo-600',
      'seguridad': 'from-red-600 to-gray-800',
      'cloud': 'from-blue-400 to-cyan-500'
    };
    return colores[categoria] || 'from-gray-400 to-gray-600';
  };

  const getStaticCursos = () => [
    { id: 1, nombre: "Bases de datos y Lenguaje SQL", categoria: "bases-datos", icono: "🗄️", color: "from-blue-500 to-blue-700", descripcion: "Aprende a gestionar bases de datos con SQL" },
    { id: 2, nombre: "Programación R y RStudio avanzado", categoria: "programacion", icono: "📊", color: "from-green-500 to-green-700", descripcion: "Análisis estadístico avanzado con R" },
    { id: 3, nombre: "Programación Python básico", categoria: "programacion", icono: "🐍", color: "from-yellow-500 to-yellow-700", descripcion: "Fundamentos de programación en Python" },
    { id: 4, nombre: "Power BI", categoria: "analisis", icono: "📈", color: "from-orange-500 to-orange-700", descripcion: "Visualización de datos empresariales" },
    { id: 5, nombre: "Servidores en Linux básico", categoria: "sistemas", icono: "🐧", color: "from-gray-500 to-gray-700", descripcion: "Administración básica de servidores Linux" },
    { id: 6, nombre: "Servidores en Linux avanzado", categoria: "sistemas", icono: "🖥️", color: "from-gray-600 to-gray-800", descripcion: "Administración avanzada de servidores Linux" },
    { id: 7, nombre: "Servidores en Windows básico", categoria: "sistemas", icono: "🪟", color: "from-blue-400 to-blue-600", descripcion: "Administración básica de servidores Windows" },
    { id: 8, nombre: "Servidores en Windows avanzado", categoria: "sistemas", icono: "💻", color: "from-blue-500 to-blue-700", descripcion: "Administración avanzada de servidores Windows" },
    { id: 9, nombre: "Corel Draw", categoria: "diseno", icono: "🎨", color: "from-red-500 to-red-700", descripcion: "Diseño gráfico vectorial profesional" },
    { id: 10, nombre: "Adobe Photoshop", categoria: "diseno", icono: "🖼️", color: "from-blue-600 to-purple-600", descripcion: "Edición y retoque fotográfico" },
    { id: 11, nombre: "Adobe Illustrator", categoria: "diseno", icono: "✏️", color: "from-orange-600 to-red-600", descripcion: "Ilustración vectorial profesional" },
    { id: 12, nombre: "Adobe After Effects", categoria: "diseno", icono: "🎬", color: "from-purple-600 to-pink-600", descripcion: "Animación y efectos visuales" },
    { id: 13, nombre: "Adobe Premiere", categoria: "diseno", icono: "🎥", color: "from-purple-500 to-purple-700", descripcion: "Edición de video profesional" },
    { id: 14, nombre: "Adobe InDesign", categoria: "diseno", icono: "📄", color: "from-pink-500 to-pink-700", descripcion: "Maquetación editorial profesional" },
    { id: 15, nombre: "Matlab", categoria: "analisis", icono: "🔢", color: "from-indigo-500 to-indigo-700", descripcion: "Computación técnica y análisis numérico" },
    { id: 16, nombre: "Programación en C#", categoria: "programacion", icono: "⚡", color: "from-purple-500 to-purple-700", descripcion: "Desarrollo con Microsoft .NET" },
    { id: 17, nombre: "Programación en C++", categoria: "programacion", icono: "🔧", color: "from-blue-500 to-blue-700", descripcion: "Programación de sistemas y aplicaciones" },
    { id: 18, nombre: "Programación en Java", categoria: "programacion", icono: "☕", color: "from-red-500 to-orange-500", descripcion: "Desarrollo de aplicaciones empresariales" },
    { id: 19, nombre: "Programación en Python intermedio", categoria: "programacion", icono: "🐍", color: "from-green-500 to-blue-500", descripcion: "Python para desarrollo web y datos" },
    { id: 20, nombre: "Programación en Python avanzado", categoria: "programacion", icono: "🚀", color: "from-blue-500 to-purple-500", descripcion: "Python avanzado y machine learning" },
    { id: 21, nombre: "Programación en Laravel", categoria: "programacion", icono: "🌐", color: "from-red-500 to-red-700", descripcion: "Framework PHP para desarrollo web" },
    { id: 22, nombre: "Programación Google Colab", categoria: "programacion", icono: "📓", color: "from-yellow-500 to-orange-500", descripcion: "Notebooks colaborativos en la nube" },
    { id: 23, nombre: "Programación en Go", categoria: "programacion", icono: "🏃", color: "from-cyan-500 to-blue-500", descripcion: "Lenguaje moderno para sistemas" },
    { id: 24, nombre: "Programación Kotlin", categoria: "programacion", icono: "📱", color: "from-purple-500 to-pink-500", descripcion: "Desarrollo Android moderno" },
    { id: 25, nombre: "Big Data", categoria: "analisis", icono: "📊", color: "from-green-600 to-teal-600", descripcion: "Análisis de grandes volúmenes de datos" },
    { id: 26, nombre: "Statistica", categoria: "analisis", icono: "📈", color: "from-blue-600 to-indigo-600", descripcion: "Software estadístico avanzado" },
    { id: 27, nombre: "Software Minitab", categoria: "analisis", icono: "📉", color: "from-teal-500 to-teal-700", descripcion: "Análisis estadístico y control de calidad" },
    { id: 28, nombre: "Software SAS", categoria: "analisis", icono: "📋", color: "from-indigo-500 to-indigo-700", descripcion: "Análisis estadístico empresarial" },
    { id: 29, nombre: "Software Epidat, Epinfo", categoria: "analisis", icono: "🏥", color: "from-green-500 to-green-700", descripcion: "Epidemiología y salud pública" },
    { id: 30, nombre: "Software Stata", categoria: "analisis", icono: "📊", color: "from-blue-500 to-blue-700", descripcion: "Análisis estadístico y econométrico" },
    { id: 31, nombre: "Software Eviews", categoria: "analisis", icono: "💹", color: "from-purple-500 to-purple-700", descripcion: "Análisis econométrico y forecasting" },
    { id: 32, nombre: "Cisco Packet Tracert básico", categoria: "redes", icono: "🌐", color: "from-blue-600 to-cyan-600", descripcion: "Simulación de redes básica" },
    { id: 33, nombre: "Cisco Packet Tracert avanzado", categoria: "redes", icono: "🔗", color: "from-cyan-600 to-blue-600", descripcion: "Simulación de redes avanzada" },
    { id: 34, nombre: "Internet de las cosas", categoria: "tecnologia", icono: "🌍", color: "from-green-500 to-teal-500", descripcion: "IoT y dispositivos conectados" },
    { id: 35, nombre: "Administración de Moodle I", categoria: "sistemas", icono: "🎓", color: "from-orange-500 to-orange-700", descripcion: "Plataforma educativa básica" },
    { id: 36, nombre: "Administración de Moodle II", categoria: "sistemas", icono: "🏫", color: "from-orange-600 to-red-600", descripcion: "Plataforma educativa avanzada" },
    { id: 37, nombre: "Scratch", categoria: "programacion", icono: "🧩", color: "from-yellow-500 to-orange-500", descripcion: "Programación visual para principiantes" },
    { id: 38, nombre: "ArcGIS", categoria: "gis", icono: "🗺️", color: "from-green-600 to-blue-600", descripcion: "Sistemas de información geográfica" },
    { id: 39, nombre: "Oracle", categoria: "bases-datos", icono: "🏛️", color: "from-red-600 to-red-800", descripcion: "Base de datos empresarial" },
    { id: 40, nombre: "MariaDB", categoria: "bases-datos", icono: "🐬", color: "from-blue-500 to-teal-500", descripcion: "Base de datos open source" },
    { id: 41, nombre: "MongoDB", categoria: "bases-datos", icono: "🍃", color: "from-green-600 to-green-800", descripcion: "Base de datos NoSQL" },
    { id: 42, nombre: "Latex", categoria: "documentos", icono: "📝", color: "from-gray-600 to-gray-800", descripcion: "Composición tipográfica profesional" },
    { id: 43, nombre: "Microsoft Excel Avanzado", categoria: "oficina", icono: "📊", color: "from-green-500 to-green-700", descripcion: "Análisis de datos con Excel" },
    { id: 44, nombre: "Microsoft Word Avanzado", categoria: "oficina", icono: "📝", color: "from-blue-500 to-blue-700", descripcion: "Documentos profesionales" },
    { id: 45, nombre: "Microsoft PowerPoint", categoria: "oficina", icono: "📽️", color: "from-orange-500 to-orange-700", descripcion: "Presentaciones impactantes" },
    { id: 46, nombre: "Google Workspace", categoria: "oficina", icono: "🌐", color: "from-blue-400 to-green-400", descripcion: "Productividad en la nube" },
    { id: 47, nombre: "Programación en JavaScript", categoria: "programacion", icono: "⚡", color: "from-yellow-400 to-orange-500", descripcion: "Desarrollo web interactivo" },
    { id: 48, nombre: "React.js", categoria: "programacion", icono: "⚛️", color: "from-cyan-400 to-blue-500", descripcion: "Interfaces de usuario modernas" },
    { id: 49, nombre: "Node.js", categoria: "programacion", icono: "🟢", color: "from-green-400 to-green-600", descripcion: "Backend con JavaScript" },
    { id: 50, nombre: "Vue.js", categoria: "programacion", icono: "💚", color: "from-green-500 to-teal-500", descripcion: "Framework progresivo" },
    { id: 51, nombre: "Angular", categoria: "programacion", icono: "🅰️", color: "from-red-500 to-red-700", descripcion: "Aplicaciones web robustas" },
    { id: 52, nombre: "Docker", categoria: "sistemas", icono: "🐳", color: "from-blue-400 to-cyan-500", descripcion: "Contenedores y virtualización" },
    { id: 53, nombre: "Kubernetes", categoria: "sistemas", icono: "☸️", color: "from-blue-600 to-purple-600", descripcion: "Orquestación de contenedores" },
    { id: 54, nombre: "AWS Cloud", categoria: "cloud", icono: "☁️", color: "from-orange-400 to-yellow-500", descripcion: "Servicios en la nube" },
    { id: 55, nombre: "Azure Cloud", categoria: "cloud", icono: "☁️", color: "from-blue-500 to-blue-700", descripcion: "Plataforma Microsoft Cloud" },
    { id: 56, nombre: "Google Cloud", categoria: "cloud", icono: "☁️", color: "from-blue-400 to-green-400", descripcion: "Infraestructura Google" },
    { id: 57, nombre: "Cyberseguridad", categoria: "seguridad", icono: "🔒", color: "from-red-600 to-gray-800", descripcion: "Protección de sistemas" },
    { id: 58, nombre: "Ethical Hacking", categoria: "seguridad", icono: "🕵️", color: "from-gray-600 to-black", descripcion: "Hacking ético y pentesting" },
    { id: 59, nombre: "Machine Learning", categoria: "ia", icono: "🤖", color: "from-purple-500 to-pink-500", descripcion: "Aprendizaje automático" },
    { id: 60, nombre: "Deep Learning", categoria: "ia", icono: "🧠", color: "from-indigo-500 to-purple-600", descripcion: "Redes neuronales profundas" },
    { id: 61, nombre: "Inteligencia Artificial", categoria: "ia", icono: "🤖", color: "from-cyan-500 to-purple-500", descripcion: "IA y algoritmos inteligentes" },
    { id: 62, nombre: "Blockchain", categoria: "tecnologia", icono: "⛓️", color: "from-yellow-500 to-orange-600", descripcion: "Tecnología blockchain y criptomonedas" }
  ];

  const categorias = [
    { id: 'todos', nombre: 'Todos los Cursos', icono: '🎯', count: cursosLibres.length },
    { id: 'programacion', nombre: 'Programación', icono: '💻', count: cursosLibres.filter(c => c.categoria === 'programacion').length },
    { id: 'diseno', nombre: 'Diseño', icono: '🎨', count: cursosLibres.filter(c => c.categoria === 'diseno').length },
    { id: 'analisis', nombre: 'Análisis de Datos', icono: '📊', count: cursosLibres.filter(c => c.categoria === 'analisis').length },
    { id: 'sistemas', nombre: 'Sistemas', icono: '🖥️', count: cursosLibres.filter(c => c.categoria === 'sistemas').length },
    { id: 'bases-datos', nombre: 'Bases de Datos', icono: '🗄️', count: cursosLibres.filter(c => c.categoria === 'bases-datos').length },
    { id: 'redes', nombre: 'Redes', icono: '🌐', count: cursosLibres.filter(c => c.categoria === 'redes').length },
    { id: 'tecnologia', nombre: 'Tecnología', icono: '🚀', count: cursosLibres.filter(c => c.categoria === 'tecnologia').length },
    { id: 'ia', nombre: 'Inteligencia Artificial', icono: '🤖', count: cursosLibres.filter(c => c.categoria === 'ia').length },
    { id: 'seguridad', nombre: 'Seguridad', icono: '🔒', count: cursosLibres.filter(c => c.categoria === 'seguridad').length },
    { id: 'cloud', nombre: 'Cloud Computing', icono: '☁️', count: cursosLibres.filter(c => c.categoria === 'cloud').length },
    { id: 'gis', nombre: 'GIS', icono: '🗺️', count: cursosLibres.filter(c => c.categoria === 'gis').length },
    { id: 'documentos', nombre: 'Documentos', icono: '📄', count: cursosLibres.filter(c => c.categoria === 'documentos').length },
    { id: 'oficina', nombre: 'Oficina', icono: '📊', count: cursosLibres.filter(c => c.categoria === 'oficina').length }
  ];

  const cursosFiltrados = cursosLibres.filter(curso => {
    const matchesCategory = selectedCategory === 'todos' || curso.categoria === selectedCategory;
    const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cursosVisibles = cursosFiltrados.slice(0, visibleCourses);

  // (Carrusel eliminado) Limpieza: sin navegación automática ni observers

  const loadMore = () => {
    setVisibleCourses(prev => Math.min(prev + 12, cursosFiltrados.length));
  };

  const handleVerMas = (curso) => {
    setSelectedCourse(curso);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <section className="pt-4 pb-8 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Cursos Libres
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cargando cursos especializados...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4 pb-8 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header compacto */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Cursos Libres
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Cursos cortos y especializados para impulsar tus habilidades.
          </p>
        </div>

        {/* Barra de búsqueda compacta */}
        <div className="max-w-md md:max-w-none md:w-96 mb-3 mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Barra de categorías eliminada para un diseño más minimal (solo búsqueda) */}

        {/* Primer Carrusel - Todos los cursos hacia la derecha */}
        <div className="relative">
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Cursos Libres - Oferta Completa</h3>
              <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {cursosFiltrados.length} cursos disponibles
              </span>
            </div>

            <div className="relative">
              {/* Divisor vertical entre columnas (solo cuando hay 2 columnas) */}
              <div className="hidden md:block lg:hidden absolute inset-y-0 left-1/2 w-px bg-gray-300"></div>
              {/* Divisores para 3 columnas en pantallas grandes */}
              <div className="hidden lg:block absolute inset-y-0 left-[33.333%] w-px bg-gray-300"></div>
              <div className="hidden lg:block absolute inset-y-0 left-[66.666%] w-px bg-gray-300"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {cursosVisibles.map((curso, index) => (
                  <div key={`list-${curso.id}-${index}`} className="group bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow">
                  <div className="flex gap-4 items-start">
                    <div className="w-28 h-20 md:w-36 md:h-24 bg-white ring-1 ring-gray-200 rounded-xl overflow-hidden shadow-sm group-hover:scale-[1.01] transition-transform duration-300">
                      <img
                        src={resolverImagenCurso(curso)}
                        alt={`Imagen ${curso.nombre}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = obtenerImagenPorCategoria(curso.categoria); }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-blue-700 transition-colors duration-300">
                          {fixMojibake(curso.nombre)}
                        </h3>
                        <button 
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm px-2 py-1 rounded hover:bg-blue-50 transition-all duration-200"
                          onClick={() => handleVerMas(curso)}
                        >
                          Ver más
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mt-1 line-clamp-2 md:line-clamp-3">
                        {fixMojibake(curso.descripcion)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {categorias.find(c => c.id === curso.categoria)?.icono} {categorias.find(c => c.id === curso.categoria)?.nombre}
                        </span>
                        <span className="text-xs text-blue-700 font-medium">{curso.horas ? `${curso.horas}h` : '40h'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>

            {visibleCourses < cursosFiltrados.length && (
              <div className="text-center mt-4">
                <button
                  onClick={loadMore}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Ver más cursos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fin de lista */}
      </div>

      <style>{`
        /* Animaciones del carrusel eliminadas */

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Modal de detalles */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-28 h-28 md:w-32 md:h-32 bg-white/90 ring-1 ring-gray-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                    <img
                      src={resolverImagenCurso(selectedCourse)}
                      alt={`Imagen ${selectedCourse.nombre}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = obtenerImagenPorCategoria(selectedCourse.categoria); }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{fixMojibake(selectedCourse.nombre)}</h3>
                    <p className="text-gray-600">{categorias.find(c => c.id === selectedCourse.categoria)?.nombre}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 text-lg leading-relaxed">{fixMojibake(selectedCourse.descripcion)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h5 className="font-semibold text-gray-800 mb-2">📚 Modalidad</h5>
                  <p className="text-gray-600 text-sm">Curso libre presencial</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h5 className="font-semibold text-gray-800 mb-2">⏱️ Duración</h5>
                  <p className="text-gray-600 text-sm">40 horas académicas</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h5 className="font-semibold text-gray-800 mb-2">🎯 Nivel</h5>
                  <p className="text-gray-600 text-sm">Básico a intermedio</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h5 className="font-semibold text-gray-800 mb-2">📜 Certificación</h5>
                  <p className="text-gray-600 text-sm">Certificado de participación</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">¿Qué aprenderás?</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 text-sm">Fundamentos teóricos y prácticos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 text-sm">Ejercicios prácticos y casos reales</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 text-sm">Herramientas y técnicas actualizadas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 text-sm">Proyecto final aplicado</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className={`flex-1 bg-gradient-to-r ${selectedCourse.color} text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                  Inscribirse ahora
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300">
                  Más información
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CursosLibres;

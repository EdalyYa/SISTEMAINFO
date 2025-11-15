import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { resolveAssetUrl } from '../utils/assetUrl';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaSearch, 
  FaPalette, 
  FaChartBar, 
  FaLaptopCode, 
  FaShieldAlt, 
  FaBrain, 
  FaDatabase,
  FaFilter,
  FaClock,
  FaMapMarkerAlt,
  FaDesktop
} from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Excel from '../Imagenes/Excel.png';
import InteligenciaArtificial from '../Imagenes/InteligenciaArtificial.png';
import BasedeDatos from '../Imagenes/BasedeDatos.png';

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow custom-prev-arrow`}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    >
      <FaArrowLeft className="text-white text-xl" />
    </div>
  );
}

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow custom-next-arrow`}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    >
      <FaArrowRight className="text-white text-xl" />
    </div>
  );
}

function ProgramCatalog() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalidad, setModalidad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const handleImgError = (e) => { e.currentTarget.src = Excel; };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Fallback local para verificar el diseño cuando la API falla
  const defaultPrograms = [
    { id: 1, title: 'Especialista en Excel', description: 'Mejora tus habilidades en hojas de cálculo y análisis de datos', duration: '4 meses', modality: 'virtual', price: '180', image: Excel, color: 'from-blue-500 to-indigo-600', icon: <FaChartBar className="text-3xl" /> },
    { id: 2, title: 'Ciberseguridad y Redes', description: 'Administra redes y refuerza la seguridad informática', duration: '6 meses', modality: 'presencial', price: '250', image: BasedeDatos, color: 'from-blue-500 to-indigo-600', icon: <FaShieldAlt className="text-3xl" /> },
    { id: 3, title: 'Inteligencia Artificial', description: 'Introducción y aplicaciones prácticas de IA', duration: '5 meses', modality: 'virtual', price: '220', image: InteligenciaArtificial, color: 'from-blue-500 to-indigo-600', icon: <FaBrain className="text-3xl" /> },
  ];

  const fetchPrograms = async () => {
    try {
      const BASE = API_BASE.replace('/api', '');
      const response = await fetch(`${BASE}/admin/programas/public`);
      const data = await response.json();
      const esImagen = (v) => /\.(png|jpe?g|webp|gif|svg)$/i.test(String(v || ''));
      const resolverImagenPrograma = (v) => {
        if (!v) return Excel;
        const val = String(v);
        if (val.startsWith('http')) return val;
        // Reescribir rutas del backend o del frontend estático
        if (val.startsWith('/src/') || val.startsWith('/assets/') || val.includes('/uploads')) {
          return resolveAssetUrl(val);
        }
        // Si parece nombre de archivo simple (desde BD), construir ruta en uploads
        if (esImagen(val)) return resolveAssetUrl(`/uploads/programas/${val}`);
        return Excel;
      };
      
      // Los programas ya vienen filtrados como activos desde el backend
      // Si la respuesta no es un array, usar el fallback local para mantener el layout funcional
      const source = Array.isArray(data) ? data : defaultPrograms;

      // Mapear los datos de la API (o fallback) al formato esperado por el componente
      const mappedPrograms = source.map(program => ({
        id: program.id,
        title: program.nombre || program.title,
        description: program.descripcion || program.description,
        duration: program.duracion || program.duration,
        modality: program.modalidad || program.modality,
        price: program.precio || program.price,
        // Resolver correctamente tanto rutas absolutas, relativas con /uploads, como nombres de archivo sueltos
        image: resolverImagenPrograma(program.imagen || program.image),
        color: program.color || 'from-blue-500 to-indigo-600',
        icon: program.icon || getIconByProgram(program.nombre || program.title)
      }));
      
      setPrograms(mappedPrograms);
    } catch (error) {
      console.error('Error al cargar programas:', error);
      setPrograms(defaultPrograms); // Fallback para mantener el catálogo visible
    } finally {
      setLoading(false);
    }
  };

  const getIconByProgram = (programName) => {
    const name = programName.toLowerCase();
    if (name.includes('excel')) return <FaChartBar className="text-3xl" />;
    if (name.includes('datos') || name.includes('data')) return <FaDatabase className="text-3xl" />;
    if (name.includes('software') || name.includes('programacion')) return <FaLaptopCode className="text-3xl" />;
    if (name.includes('ciberseguridad') || name.includes('redes')) return <FaShieldAlt className="text-3xl" />;
    if (name.includes('inteligencia') || name.includes('robotica')) return <FaBrain className="text-3xl" />;
    if (name.includes('autocad') || name.includes('diseño')) return <FaPalette className="text-3xl" />;
    return <FaDesktop className="text-3xl" />; // Icono por defecto
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    mobileFirst: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    adaptiveHeight: true,
    swipeToSlide: true,
    touchMove: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    // Mobile-first: aumentamos cantidad de slides en anchos mayores
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: true,
          centerMode: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          arrows: true,
          centerMode: false,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          arrows: true,
          centerMode: false,
        },
      },
    ],
  };

  const handleDetailsClick = (id) => {
    navigate(`/detalles/${id}`);
  };

  // Filtrado por modalidad y búsqueda
  let filteredPrograms = programs.filter((program) => {
    // Modalidad
    if (modalidad && program.modality && program.modality.toLowerCase() !== modalidad.toLowerCase()) {
      return false;
    }
    // Búsqueda
    if (busqueda) {
      const search = busqueda.toLowerCase();
      if (!program.title.toLowerCase().includes(search) &&
          !program.description.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Programas Modulares INFOUNA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cargando programas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Programas Modulares INFOUNA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No hay programas disponibles en este momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="catalogo" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Programas Modulares INFOUNA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre una amplia variedad de módulos y programas de alto nivel para potenciar tu carrera profesional.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-lg" />
            <select
              value={modalidad}
              onChange={e => setModalidad(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-blue-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">Todas las modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-lg" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar programa..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-blue-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Carrusel de programas en todos los tamaños */}
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-gray-500 text-xl mb-4">No se encontraron programas con los filtros seleccionados.</div>
            <button 
              onClick={() => { setModalidad(''); setBusqueda(''); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="relative program-slider px-2">
            <Slider {...settings}>
              {filteredPrograms.map((program) => (
                <div key={program.id} className="px-2 md:px-4 focus:outline-none">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={program.image}
                        onError={handleImgError}
                        alt={`Imagen de ${program.title}`} 
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        {program.icon}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-bold text-xl text-blue-900 mb-2 text-center">{program.title}</h3>
                      <p className="text-gray-600 mb-4 text-center flex-grow">{program.description}</p>
                      
                      <div className="mb-5">
                        <div className="text-sm text-gray-500 mb-2 font-medium">Información del programa:</div>
                        <div className="text-sm mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Duración:</span>
                            <span className="font-medium text-blue-900">{program.duration}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Modalidad:</span>
                            <div className="flex items-center">
                              {program.modality === 'presencial' ? (
                                <FaMapMarkerAlt className="mr-2 text-sm text-blue-600" />
                              ) : (
                                <FaDesktop className="mr-2 text-sm text-blue-600" />
                              )}
                              <span className="text-xs font-medium capitalize">{program.modality}</span>
                            </div>
                          </div>
                          {program.price && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Precio:</span>
                              <span className="font-bold text-green-600">${program.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDetailsClick(program.id)}
                        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                      >
                        Ver detalles
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProgramCatalog;

import React from "react";
import { API_BASE } from "../config/api";
import { useNavigate, Link } from 'react-router-dom';
import ProgramCatalog from "../components/ProgramCatalog";
import FAQAccordion from "../components/FAQAccordion";
import Notification from "../components/Notification";
import CarouselCursos from "../components/CarouselCursos";
import VideosInformativos from "../components/VideoTestimonios";
import BlogNoticias from "../components/BlogNoticias";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";
import CalendarioEventos from "../components/CalendarioEventos";
import Chatbot from "../components/Chatbot";
import HeroBanner from "../components/HeroBanner";
import CifrasLogros from "../components/CifrasLogros";
 
import ContactoRapido from "../components/ContactoRapido";
import VideoModal from "../components/VideoModal";
import ScrollDownIndicator from "../components/ScrollDownIndicator";
import WhatsAppButton from "../components/WhatsAppButton";
// import CursosLibres from "../components/CursosLibres"; // Removido del Home en favor de dos carruseles
import videoFile from "../videos/Video.mp4";
import SocialHub from "../components/SocialHub";
import ImageOptimized from "../components/ImageOptimized";
import edificioInfouna from '../Imagenes/edificio-infouna.jpg';

function HomePage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [showNotif, setShowNotif] = React.useState(true);
  const navigate = useNavigate();

  // Traer cursos libres y dividir en dos mitades para mostrar en carruseles
  const [cursosLibresAll, setCursosLibresAll] = React.useState([]);
  const [loadingCursosLibres, setLoadingCursosLibres] = React.useState(true);

  React.useEffect(() => {
    const fetchLibres = async () => {
      try {
        const res = await fetch(`${API_BASE}/cursos-libres`);
        if (res.ok) {
          const data = await res.json();
          setCursosLibresAll(Array.isArray(data) ? data : []);
        } else {
          // Fallback estático si falla API
          setCursosLibresAll([
            { nombre: 'AutoCAD I - Básico', descripcion: 'Diseño asistido por computadora - Presencial, 72h' },
            { nombre: 'Programación en Python', descripcion: 'Lenguaje versátil - Presencial, 96h' },
            { nombre: 'Excel Avanzado', descripcion: 'Dashboards y análisis - Presencial, 60h' },
            { nombre: 'Bases de Datos SQL', descripcion: 'Consultas y administración - Virtual, 80h' },
            { nombre: 'Power BI', descripcion: 'Visualización y BI - Presencial, 40h' },
            { nombre: 'Estadística Aplicada', descripcion: 'Fundamentos para análisis de datos - Presencial, 40h' },
            { nombre: 'Redes Básico', descripcion: 'Conceptos y conectividad - Presencial, 40h' },
            { nombre: 'Oracle', descripcion: 'BD empresarial - Presencial, 40h' },
          ]);
        }
      } catch (err) {
        console.error('Error cargando cursos libres en Home:', err);
        setCursosLibresAll([
          { nombre: 'AutoCAD I - Básico', descripcion: 'Diseño asistido por computadora - Presencial, 72h' },
          { nombre: 'Programación en Python', descripcion: 'Lenguaje versátil - Presencial, 96h' },
          { nombre: 'Excel Avanzado', descripcion: 'Dashboards y análisis - Presencial, 60h' },
          { nombre: 'Bases de Datos SQL', descripcion: 'Consultas y administración - Virtual, 80h' },
          { nombre: 'Power BI', descripcion: 'Visualización y BI - Presencial, 40h' },
          { nombre: 'Estadística Aplicada', descripcion: 'Fundamentos para análisis de datos - Presencial, 40h' },
          { nombre: 'Redes Básico', descripcion: 'Conceptos y conectividad - Presencial, 40h' },
          { nombre: 'Oracle', descripcion: 'BD empresarial - Presencial, 40h' },
        ]);
      } finally {
        setLoadingCursosLibres(false);
      }
    };
    fetchLibres();
  }, []);

  const handleJoinINFOUNA = () => {
    navigate('/matricula');
  };

  const handleExploreCourses = () => {
    navigate('/cursos');
  };
  return (
    <div className="min-h-screen flex flex-col">
      {showNotif && (
        <Notification type="success" message="¡Bienvenido al Instituto de Informática INFOUNA - Universidad Nacional del Altiplano de Puno! Descubre nuestros cursos y certificaciones." onClose={() => setShowNotif(false)} />
      )}
      <AnimatedBackground />
      <Chatbot />
      {/* Topbar institucional y contacto */}
      {/* Hero principal */}
      <section className="relative h-[600px] md:h-[700px] pt-16 md:pt-20 overflow-hidden animate-fade-in shadow-2xl rounded-xl">
        {/* ...video, overlay, contenido principal, scroll indicator, modal... */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={videoFile}
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => {
            console.log('Error loading video:', e);
            e.target.style.display = 'none';
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 flex flex-col justify-center items-start px-6 md:px-10 lg:px-20 xl:px-32 space-y-4 md:space-y-6 z-20">
          <p className="text-white uppercase text-xs md:text-sm tracking-widest flex items-center space-x-2 animate-fade-in">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.175 0l-3.388 2.462c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" /></svg>
            <span>Innovando el mañana, hoy</span>
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 md:mb-4 leading-tight drop-shadow-lg animate-slide-up">
            Instituto de <span className="text-blue-400">Informática</span> <span className="underline decoration-yellow-400">INFOUNA</span>
          </h1>
          <p className="text-white max-w-xl mb-4 md:mb-6 text-sm md:text-base font-semibold drop-shadow-md animate-fade-in">
            Formando profesionales en informática y computación con educación de calidad en la Universidad Nacional del Altiplano de Puno.
          </p>
          {/* Badge llamativo de Inscripciones abiertas */}
          <div className="mb-2 md:mb-3 flex items-center gap-3" role="status" aria-live="polite">
            <button
              onClick={handleJoinINFOUNA}
              className="inline-flex items-center px-3 md:px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs md:text-sm font-semibold shadow-lg ring-2 ring-white/40 hover:scale-105 transition animate-pulse"
              aria-label="Inscripciones abiertas, ir a matrícula"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.175 0l-3.388 2.462c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z"/></svg>
              <span>Inscripciones abiertas</span>
            </button>
            <span className="text-emerald-200 text-xs md:text-sm font-medium">Cupos limitados</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-4xl">
            <button onClick={handleJoinINFOUNA} className="bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 transition duration-300 font-semibold uppercase tracking-wide flex items-center justify-center space-x-2 md:space-x-3 animate-fade-in text-sm md:text-base">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <span>Únete a INFOUNA</span>
            </button>
            <button onClick={handleExploreCourses} className="bg-yellow-400 text-black px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-yellow-300 hover:scale-105 transition duration-300 font-semibold uppercase tracking-wide flex items-center justify-center space-x-2 md:space-x-3 animate-fade-in text-sm md:text-base">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" /></svg>
              <span>Explora cursos INFOUNA</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-white/80 text-blue-900 px-4 md:px-6 py-3 rounded-lg shadow hover:bg-white font-semibold transition animate-fade-in text-sm md:text-base flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0020 7.382V6.618a1 1 0 00-.447-.842L15 3.5M9 21V3.5m0 0L4.447 5.776A1 1 0 004 6.618v.764a1 1 0 00.447.842L9 10m0 11l4.553-2.276A1 1 0 0014 18.618v-.764a1 1 0 00-.447-.842L9 14" /></svg>
              <span className="hidden sm:inline">Ver video institucional</span>
              <span className="sm:hidden">Video</span>
            </button>
          </div>
        </div>
        <ScrollDownIndicator />
        <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </section>
      <WhatsAppButton />
      {/* Logros + Instituto en dos columnas */}
      <section className="bg-white py-4 md:py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
          {/* Columna 1: Logros (embebido, muestra todos) */}
          <div className="animate-fade-in-up duration-700 space-y-4">
            <CifrasLogros embedded />
            {/* Beneficios compactos debajo de Logros en la misma columna */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              <div className="p-3 border rounded-lg shadow-sm hover:shadow-md transition duration-200">
                <svg className="mx-auto mb-2 h-7 w-7 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                <h3 className="font-semibold text-sm mb-1">Convalidación UNAP</h3>
                <p className="text-gray-700 text-xs md:text-sm">Convalida tus créditos con los cursos INFOUNA</p>
              </div>
              <div className="p-3 border rounded-lg shadow-sm hover:shadow-md transition duration-200">
                <svg className="mx-auto mb-2 h-7 w-7 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /><path d="M12 14v7" /><path d="M8 21h8" /></svg>
                <h3 className="font-semibold text-sm mb-1">Docentes Calificados</h3>
                <p className="text-gray-700 text-xs md:text-sm">Docentes para todos los campos de estudio</p>
              </div>
              <div className="p-3 border rounded-lg shadow-sm hover:shadow-md transition duration-200">
                <svg className="mx-auto mb-2 h-7 w-7 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                <h3 className="font-semibold text-sm mb-1">Cursos Especializados INFOUNA</h3>
                <p className="text-gray-700 text-xs md:text-sm">Programas y cursos certificados por la UNAP</p>
              </div>
              <div className="p-3 border rounded-lg shadow-sm hover:shadow-md transition duration-200">
                <svg className="mx-auto mb-2 h-7 w-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                <h3 className="font-semibold text-sm mb-1">Certificados UNAP</h3>
                <p className="text-gray-700 text-xs md:text-sm">Certificados físicos y digitales con aval UNAP</p>
              </div>
            </div>
          </div>
          {/* Columna 2: Instituto (imagen + texto + valores) */}
          <div className="rounded-2xl border bg-gradient-to-r from-white to-blue-50/60 p-3 md:p-5 shadow-sm">
            <div className="space-y-3">
              {/* Imagen superior, responsiva con altura limitada */}
              <div className="rounded-2xl overflow-hidden border aspect-video relative">
                <ImageOptimized
                  src={edificioInfouna}
                  alt="Edificio del Instituto de Informática INFOUNA - Universidad Nacional del Altiplano"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {/* Texto y valores */}
              <div>
                <div className="flex items-center mb-1.5">
                  <span className="inline-block w-1.5 h-6 bg-blue-600 rounded mr-2" aria-hidden="true"></span>
                  <h2 className="text-lg md:text-xl font-bold text-blue-900">Instituto de Informática – INFOUNA</h2>
                </div>
                <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                  Somos parte de la Universidad Nacional del Altiplano de Puno. Modernizamos la formación en sistemas con laboratorios de innovación, tecnología y conectividad de última generación.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 md:gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-medium">Compromiso</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-medium">Excelencia</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 text-xs font-medium">Innovación</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-900 text-xs font-medium">Servicio</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <Link to="/nosotros/mision-vision" className="text-xs md:text-sm font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4">
                    Nuestra misión y visión
                  </Link>
                  <Link to="/nosotros/historia" className="text-xs md:text-sm font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4">
                    Conoce nuestra historia
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Servicios y beneficios movidos a la sección anterior */}

      {/* Laboratorios modernos INFOUNA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 md:py-10 px-4 md:px-6 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
            Laboratorios de Última Generación
          </h2>
          <p className="text-sm md:text-base mb-4 md:mb-6 max-w-3xl mx-auto leading-relaxed">
            La Universidad Nacional del Altiplano de Puno da un paso significativo hacia la modernización tecnológica con nuevos laboratorios de innovación, tecnología y conectividad Huawei.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 hover:bg-white/20 transition duration-300">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">🔬</div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Laboratorios de Innovación</h3>
              <p className="text-blue-100 text-xs md:text-sm">Espacios equipados con tecnología de vanguardia para proyectos innovadores</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 hover:bg-white/20 transition duration-300">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">💻</div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Tecnología Avanzada</h3>
              <p className="text-blue-100 text-xs md:text-sm">Equipos de última generación para formación práctica en sistemas informáticos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 hover:bg-white/20 transition duration-300">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">🌐</div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Conectividad Total</h3>
              <p className="text-blue-100 text-xs md:text-sm">Infraestructura de red moderna que garantiza conectividad óptima para el aprendizaje</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de programas */}
      <ProgramCatalog />

      {/* Carruseles de Cursos Libres (dos mitades, título único) */}
      {!loadingCursosLibres && (() => {
        const total = cursosLibresAll.length;
        const mid = Math.ceil(total / 2);
        const primeraMitad = cursosLibresAll.slice(0, mid);
        const segundaMitad = cursosLibresAll.slice(mid);
        return (
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center mb-4">
                <div className="hidden sm:block"></div>
                <h2 className="text-2xl font-bold text-blue-900 text-center">Cursos Libres</h2>
                <div className="justify-self-end flex items-center gap-4">
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">{total} cursos</span>
                  <Link to="/cursos-libres" className="text-sm font-medium text-blue-700 hover:text-blue-900">Ver más</Link>
                </div>
              </div>
              <div className="space-y-3">
                <CarouselCursos direction="right" align="right" compact hideHeader={true} verMasTo="/cursos-libres" cursos={primeraMitad} />
                <CarouselCursos direction="left" align="left" compact hideHeader={true} verMasTo="/cursos-libres" cursos={segundaMitad} />
              </div>
            </div>
          </section>
        );
      })()}
      {/* Sección de Próximos cursos eliminada a solicitud del usuario */}
      
      {/* Sección de Testimonios eliminada a solicitud del usuario */}
      {/* Videos informativos */}
      <VideosInformativos />

      {/* Social Hub: fanpages y botones */}
      <SocialHub />

      {/* Blog/Noticias animado */}
      <BlogNoticias />
      
      {/* Calendario de cursos y eventos */}
      <CalendarioEventos />
      
      {/* FAQ Section */}
      <FAQAccordion />

      {/* Contacto rápido */}
      <div className="animate-fade-in-up duration-1000 delay-600">
        <ContactoRapido />
      </div>

      {/* Mapa institucional */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <iframe
            title="Ubicación Instituto de Informática"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239.91230102813435!2d-70.01299015126003!3d-15.82519946642741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915d699d3cbe57b3%3A0x4df91ab3edb0bcb5!2sEdificio%20de%2015%20pisos%20UNA%20Puno!5e0!3m2!1ses!2spe!4v1757639614491!5m2!1ses!2spe"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
      {/* Footer institucional */}
      <Footer />
    </div>
  );
}

export default HomePage;
 

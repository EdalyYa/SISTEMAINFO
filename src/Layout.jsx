import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Loader from "./components/Loader";
import ScrollProgressBar from "./components/ScrollProgressBar";
import { FaFacebookF, FaTiktok, FaWhatsapp, FaYoutube, FaArrowUp } from "react-icons/fa";

export default function Layout({ children }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownStatic, setDropdownStatic] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [ctaPulse, setCtaPulse] = useState(false);
  const isNosotrosActive = location.pathname.startsWith('/nosotros');
  const isCatalogoActive = location.pathname.startsWith('/programas') || location.pathname.startsWith('/cursos');
  const isTramitesActive = location.pathname.startsWith('/tramites') || location.pathname.startsWith('/certificados') || location.pathname.startsWith('/matricula') || location.pathname.startsWith('/reclamaciones');
  const isRedesActive = location.pathname.startsWith('/redes');
  const isInstitucionalActive = (
    location.pathname.startsWith('/institucional/transparencia') ||
    location.pathname.startsWith('/institucional/acreditacion') ||
    location.pathname.startsWith('/institucional/politicas')
  );
  const isMasActive = (
    location.pathname.startsWith('/noticias') ||
    location.pathname.startsWith('/calendario') ||
    location.pathname.startsWith('/faq') ||
    location.pathname.startsWith('/descargables') ||
    location.pathname.startsWith('/documentos')
  );

  useEffect(() => {
    const handleScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      setShowScrollTop(y > 300);
      setHasScrolled(y > 4);
    };
    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => setLoading(false), 1200);
    // Pulso inicial del CTA por unos segundos si no estamos en /matricula
    setCtaPulse(true);
    const pulseTimer = setTimeout(() => setCtaPulse(false), 6000);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, []);

  // Cerrar menús desplegables y buscador al cambiar de ruta
  useEffect(() => {
    setDropdownOpen(null);
    setDropdownStatic(null);
    setSearchOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMouseEnter = (menu) => {
    if (!dropdownStatic) {
      setDropdownOpen(menu);
    }
  };

  const handleMouseLeave = () => {
    if (!dropdownStatic) {
      setDropdownOpen(null);
    }
  };

  const handleDropdownClick = (menu) => {
    if (dropdownStatic === menu) {
      setDropdownStatic(null);
      setDropdownOpen(null);
    } else {
      setDropdownStatic(menu);
      setDropdownOpen(menu);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ScrollProgressBar />
      {loading && <Loader />}
      <div style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.5s' }}>
  {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/922737322"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors duration-300 z-50"
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors duration-300 z-50"
          aria-label="Volver arriba"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-blue-900 text-white text-sm z-50">
        <div className="hidden md:flex justify-between items-center px-4 py-2">
          <div>
            <span>Edificio de 15 pisos 7mo piso - Ciudad Universitaria, Puno</span>
            <span className="mx-4">|</span>
            <a href="mailto:info@infouna.edu.pe" className="underline">info@infouna.edu.pe</a>
          </div>
          <div className="flex items-center space-x-5">
            <span>Escríbenos: 970 709 787  |   998 685 199 </span>
            <span className="text-white mx-2">|</span>
            <a href="https://www.facebook.com/infouna" target="_blank" rel="noreferrer" className="hover:text-yellow-400" aria-label="Facebook">
              <FaFacebookF className="inline h-5 w-5 text-white hover:text-yellow-400" />
            </a>
            <a href="https://www.tiktok.com/@infouna" target="_blank" rel="noreferrer" className="hover:text-yellow-400" aria-label="TikTok">
              <FaTiktok className="inline h-5 w-5 text-white hover:text-yellow-400" />
            </a>
            <a href="https://wa.me/51970709787" target="_blank" rel="noreferrer" className="hover:text-yellow-400" aria-label="WhatsApp">
              <FaWhatsapp className="inline h-5 w-5 text-white hover:text-yellow-400" />
            </a>
            <a href="https://www.youtube.com/@infouna" target="_blank" rel="noreferrer" className="hover:text-yellow-400" aria-label="YouTube">
              <FaYoutube className="inline h-5 w-5 text-white hover:text-yellow-400" />
            </a>
          </div>
        </div>
        {/* Mobile top bar - simplified */}
        <div className="md:hidden flex justify-center items-center px-4 py-2">
          <span className="text-xs">INFOUNA - Universidad Nacional del Altiplano</span>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-10 left-0 w-full bg-white ${hasScrolled ? 'shadow-sm' : 'shadow'} z-40 transition-shadow`}>
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center space-x-4">
            <img src="/src/logo.png" alt="Instituto de Informática Logo" className="h-10 md:h-12" />
            <div className="flex flex-col text-sm">
              <span className="text-gray-600 text-xs md:text-sm">Centro de cómputo InfoUna</span>
              <span className="font-bold text-blue-900 text-sm md:text-base">infoUNA <small className="text-gray-500 font-normal">Domina la tecnología</small></span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center font-semibold">
          <NavLink to="/" className={({ isActive }) => `hover:text-blue-700 ${isActive ? 'text-blue-700' : 'text-blue-900'}`}>Inicio</NavLink>
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('nosotros')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`inline-flex items-center hover:text-blue-700 focus:outline-none ${isNosotrosActive ? 'text-blue-700' : 'text-blue-900'}`}
              onClick={() => handleDropdownClick('nosotros')}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen === 'nosotros'}
            >
              Nosotros
              <svg className="ml-1 w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
            </button>
            {dropdownOpen === 'nosotros' && (
              <div
                className="absolute bg-white shadow-lg rounded mt-2 py-2 w-40 z-10"
                onMouseEnter={() => handleMouseEnter('nosotros')}
                onMouseLeave={handleMouseLeave}
              >
                <NavLink to="/nosotros/mision-vision" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Misión y Visión</NavLink>
                <NavLink to="/nosotros/equipo" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Equipo</NavLink>
                <NavLink to="/nosotros/historia" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Historia</NavLink>
              </div>
            )}
          </div>
          {/* Catálogo antes que Horarios/Documentos según orden solicitado */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('catalogo')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`inline-flex items-center hover:text-blue-700 focus:outline-none ${isCatalogoActive ? 'text-blue-700' : 'text-blue-900'}`}
              onClick={() => handleDropdownClick('catalogo')}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen === 'catalogo'}
            >
              Catálogo
              <svg className="ml-1 w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
            </button>
              {dropdownOpen === 'catalogo' && (
              <div className="absolute bg-white shadow-lg rounded mt-2 py-2 w-40 z-10">
                <NavLink to="/programas" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Programas</NavLink>
                <NavLink to="/cursos" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Cursos</NavLink>
                <NavLink to="/cursos-libres" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Cursos libres</NavLink>
              </div>
              )}
            </div>
          {/* Enlaces directos: Horarios */}
          <NavLink to="/horarios" className={({ isActive }) => `hover:text-blue-700 ${isActive ? 'text-blue-700' : 'text-blue-900'}`}>Horarios</NavLink>

          {/* Trámites */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('tramites')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`inline-flex items-center hover:text-blue-700 focus:outline-none ${isTramitesActive ? 'text-blue-700' : 'text-blue-900'}`}
              onClick={() => handleDropdownClick('tramites')}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen === 'tramites'}
            >
              Trámites
              <svg className="ml-1 w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
            </button>
            {dropdownOpen === 'tramites' && (
              <div className="absolute bg-white shadow-lg rounded mt-2 py-2 w-48 z-10">
                <NavLink to="/tramites" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 font-semibold ${isActive ? 'text-blue-700' : 'text-blue-800'}`}>Trámites y Solicitudes</NavLink>
                <hr className="my-1" />
                <NavLink to="/certificados" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Certificados</NavLink>
                <NavLink to="/matricula" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Matrícula</NavLink>
                <NavLink to="/reclamaciones" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Reclamaciones</NavLink>
              </div>
            )}
          </div>

          {/* Institucional */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('institucional')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`inline-flex items-center hover:text-blue-700 focus:outline-none ${isInstitucionalActive ? 'text-blue-700' : 'text-blue-900'}`}
              onClick={() => handleDropdownClick('institucional')}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen === 'institucional'}
            >
              Institucional
              <svg className="ml-1 w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
            </button>
            {dropdownOpen === 'institucional' && (
              <div className="absolute bg-white shadow-lg rounded mt-2 py-2 w-64 z-10">
                <NavLink to="/institucional/transparencia" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Transparencia</NavLink>
                <NavLink to="/institucional/acreditacion" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Acreditación</NavLink>
                <NavLink to="/institucional/politicas" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Políticas y Reglamentos</NavLink>
              </div>
            )}
          </div>

          {/* Redes sociales */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('redes')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`inline-flex items-center hover:text-blue-700 focus:outline-none ${isRedesActive ? 'text-blue-700' : 'text-blue-900'}`}
              onClick={() => handleDropdownClick('redes')}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen === 'redes'}
            >
              Redes
              <svg className="ml-1 w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
            </button>
            {dropdownOpen === 'redes' && (
              <div className="absolute bg-white shadow-lg rounded mt-2 py-2 w-56 z-10">
                <NavLink to="/redes" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Ver todas</NavLink>
                <hr className="my-1" />
                <div className="flex items-center gap-3 px-4 py-2">
                  <a href="https://www.facebook.com/infouna" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-600 hover:text-blue-800">
                    <FaFacebookF className="w-4 h-4" />
                  </a>
                  <a href="https://www.tiktok.com/@infouna" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-black hover:text-gray-700">
                    <FaTiktok className="w-4 h-4" />
                  </a>
                  <a href="https://wa.me/51970709787" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-green-600 hover:text-green-700">
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                  <a href="https://www.youtube.com/@infouna" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-red-600 hover:text-red-700">
                    <FaYoutube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Más al final del navbar */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('mas')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`inline-flex items-center hover:text-blue-700 focus:outline-none ${isMasActive ? 'text-blue-700' : 'text-blue-900'}`}
              onClick={() => handleDropdownClick('mas')}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen === 'mas'}
            >
              Más
              <svg className="ml-1 w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
            </button>
            {dropdownOpen === 'mas' && (
              <div className="absolute bg-white shadow-lg rounded mt-2 py-2 w-48 z-10">
                <NavLink to="/noticias" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Noticias</NavLink>
                <NavLink to="/calendario" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Calendario</NavLink>
                <NavLink to="/faq" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>FAQ</NavLink>
                <NavLink to="/descargables" className={({isActive}) => `block px-4 py-2 hover:bg-gray-100 ${isActive ? 'text-blue-700 font-semibold' : ''}`}>Descargables</NavLink>
              </div>
            )}
          </div>
          {/* Acceso directo a Certificados */}
          {/* Enlace directo a Certificados se mantiene dentro de Trámites para reducir ruido */}
          {/* CTA Matricúlate */}
          <NavLink
            to="/matricula"
            aria-label="Ir a matrícula"
            className={`ml-2 rounded-full px-6 py-2 text-white shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 ${ctaPulse && location.pathname !== '/matricula' ? 'animate-pulse' : ''}`}
          >
            Matricúlate
          </NavLink>

          {/* Portal informativo: sin menú de cuenta */}

          {/* Buscador expandible */}
          <div className="ml-4 flex items-center">
            {!searchOpen && (
              <button aria-label="Buscar" className="p-2 hover:bg-gray-200 rounded-full" onClick={() => setSearchOpen(true)}>
                <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            {searchOpen && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setSearchOpen(false);
                    if (e.key === 'Enter') {
                      const q = encodeURIComponent(searchTerm.trim());
                      if (q) navigate(`/cursos?search=${q}`);
                      }
                  }}
                  placeholder="Buscar cursos"
                  className="border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-32 md:w-48 focus:w-40 md:focus:w-64"
                  aria-label="Buscar cursos"
                  onBlur={(e) => {
                    // Cerrar buscador si se pierde el foco y no hay texto
                    // Evita cerrar cuando se hace clic en el botón de cerrar
                    const related = e.relatedTarget;
                    if (!related || (related && !related.dataset?.searchClose)) {
                      if (!searchTerm) setSearchOpen(false);
                    }
                  }}
                />
                <button
                  className="p-2 hover:bg-gray-200 rounded-full"
                  aria-label="Cerrar buscador"
                  onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                  data-search-close="true"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          </nav>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 text-blue-900 hover:text-blue-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        </div>
        
          {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <nav className="px-6 py-4 space-y-4">
              <NavLink to="/" className="block text-blue-900 hover:text-blue-700 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Inicio</NavLink>
              
              <div className="space-y-2">
                <button 
                  className="w-full text-left text-blue-900 hover:text-blue-700 font-semibold py-2 flex items-center justify-between"
                  onClick={() => setDropdownStatic(dropdownStatic === 'nosotros' ? null : 'nosotros')}
                >
                  Nosotros 
                  <svg className={`w-3 h-3 fill-current transform transition-transform ${dropdownStatic === 'nosotros' ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
                </button>
                {dropdownStatic === 'nosotros' && (
                  <div className="pl-4 space-y-2">
                    <NavLink to="/nosotros/mision-vision" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Misión y Visión</NavLink>
                    <NavLink to="/nosotros/equipo" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Equipo</NavLink>
                    <NavLink to="/nosotros/historia" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Historia</NavLink>
                  </div>
                )}
              </div>
              
              {/* Catálogo: mover antes de Horarios y Documentos */}
              <div className="space-y-2">
                <button 
                  className="w-full text-left text-blue-900 hover:text-blue-700 font-semibold py-2 flex items-center justify-between"
                  onClick={() => setDropdownStatic(dropdownStatic === 'catalogo' ? null : 'catalogo')}
                >
                  Catálogo 
                  <svg className={`w-3 h-3 fill-current transform transition-transform ${dropdownStatic === 'catalogo' ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
                </button>
                {dropdownStatic === 'catalogo' && (
                  <div className="pl-4 space-y-2">
                    <NavLink to="/programas" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Programas</NavLink>
                    <NavLink to="/cursos" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Cursos</NavLink>
                    <NavLink to="/cursos-libres" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Cursos libres</NavLink>
                  </div>
                )}
              </div>
              
              <NavLink to="/horarios" className="block text-blue-900 hover:text-blue-700 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Horarios</NavLink>
              
              
              <div className="space-y-2">
                <button 
                  className="w-full text-left text-blue-900 hover:text-blue-700 font-semibold py-2 flex items-center justify-between"
                  onClick={() => setDropdownStatic(dropdownStatic === 'tramites' ? null : 'tramites')}
                >
                  Trámites 
                  <svg className={`w-3 h-3 fill-current transform transition-transform ${dropdownStatic === 'tramites' ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
                </button>
                {dropdownStatic === 'tramites' && (
                  <div className="pl-4 space-y-2">
                    <NavLink to="/tramites" className="block text-blue-800 hover:text-blue-600 py-1 font-semibold" onClick={() => setMobileMenuOpen(false)}>Trámites y Solicitudes</NavLink>
                    <hr className="my-2" />
                    <NavLink to="/certificados" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Certificados</NavLink>
                    <NavLink to="/matricula" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Matrícula</NavLink>
                    <NavLink to="/reclamaciones" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Reclamaciones</NavLink>
                  </div>
                )}
              </div>

              {/* Institucional */}
              <div className="space-y-2">
                <button 
                  className="w-full text-left text-blue-900 hover:text-blue-700 font-semibold py-2 flex items-center justify-between"
                  onClick={() => setDropdownStatic(dropdownStatic === 'institucional' ? null : 'institucional')}
                >
                  Institucional 
                  <svg className={`w-3 h-3 fill-current transform transition-transform ${dropdownStatic === 'institucional' ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
                </button>
                {dropdownStatic === 'institucional' && (
                  <div className="pl-4 space-y-2">
                    <NavLink to="/institucional/transparencia" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Transparencia</NavLink>
                    <NavLink to="/institucional/acreditacion" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Acreditación</NavLink>
                    <NavLink to="/institucional/politicas" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Políticas y Reglamentos</NavLink>
                  </div>
                )}
              </div>

              {/* Redes en móvil */}
              
              <div className="space-y-2">
                <button 
                  className="w-full text-left text-blue-900 hover:text-blue-700 font-semibold py-2 flex items-center justify-between"
                  onClick={() => setDropdownStatic(dropdownStatic === 'redes' ? null : 'redes')}
                >
                  Redes 
                  <svg className={`w-3 h-3 fill-current transform transition-transform ${dropdownStatic === 'redes' ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
                </button>
                {dropdownStatic === 'redes' && (
                  <div className="pl-4 space-y-2">
                    <NavLink to="/redes" className="block text-blue-800 hover:text-blue-600 py-1 font-semibold" onClick={() => setMobileMenuOpen(false)}>Ver todas</NavLink>
                    <div className="flex items-center gap-4 py-2">
                      <a href="https://www.facebook.com/infouna" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-600">
                        <FaFacebookF className="w-5 h-5" />
                      </a>
                      <a href="https://www.tiktok.com/@infouna" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-black">
                        <FaTiktok className="w-5 h-5" />
                      </a>
                      <a href="https://wa.me/51970709787" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-green-600">
                        <FaWhatsapp className="w-5 h-5" />
                      </a>
                      <a href="https://www.youtube.com/@infouna" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-red-600">
                        <FaYoutube className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Más al final */}
              <div className="space-y-2">
                <button 
                  className="w-full text-left text-blue-900 hover:text-blue-700 font-semibold py-2 flex items-center justify-between"
                  onClick={() => setDropdownStatic(dropdownStatic === 'mas' ? null : 'mas')}
                >
                  Más 
                  <svg className={`w-3 h-3 fill-current transform transition-transform ${dropdownStatic === 'mas' ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z"/></svg>
                </button>
                {dropdownStatic === 'mas' && (
                  <div className="pl-4 space-y-2">
                    <NavLink to="/documentos" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Documentos</NavLink>
                    <NavLink to="/noticias" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Noticias</NavLink>
                    <NavLink to="/calendario" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Calendario</NavLink>
                    <NavLink to="/faq" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>FAQ</NavLink>
                    <NavLink to="/descargables" className="block text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Descargables</NavLink>
                  </div>
                )}
              </div>
              
              {/* Enlace directo a Certificados en móvil */}
              {/* Certificados accesible desde Trámites; Documentos enlace directo */}
              
              {/* Mobile CTA Section */}
              <div className="pt-4 border-t border-gray-200">
                <NavLink
                  to="/matricula"
                  aria-label="Ir a matrícula"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full inline-block text-center rounded-full px-6 py-2 text-white mb-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 ${ctaPulse && location.pathname !== '/matricula' ? 'animate-pulse' : ''}`}
                >
                  Matricúlate
                </NavLink>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-grow pt-[130px]">
        {children}
      </main>
      </div>
    </div>
  );
}

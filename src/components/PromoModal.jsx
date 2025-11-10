import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../config/api';
import { Modal, Button } from './ui/index';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CalendarDays, Megaphone, Info, AlertTriangle, ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import logoFallback from '../logo.png';

const PromoModal = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [embeddableMap, setEmbeddableMap] = useState({});
  const [isPaused, setPaused] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState(false);
  // Control de ancho dinámico para el embed de Facebook
  const [fbWidth, setFbWidth] = useState(700);
  const fbContainerRef = useRef(null);
  
  // Estado para cronograma (público)
  const [cronogramaItems, setCronogramaItems] = useState([]);
  const [cronogramaLoading, setCronogramaLoading] = useState(false);
  const [cronogramaError, setCronogramaError] = useState(null);

  // Obtener modales promocionales de la API (solo cuando el modal está abierto)
  useEffect(() => {
    if (!isOpen) {
      // Evitar llamadas de red cuando el modal está cerrado
      setLoading(false);
      return;
    }
    const fetchPromos = async () => {
      try {
        const response = await fetch(`${API_BASE}/modal-promocional`);
        if (response.ok) {
          const data = await response.json();
          let finalPromos = Array.isArray(data) ? data : [];
          // Respetar orden del admin; si el backend envía flags, ordenarlos
          finalPromos = finalPromos.sort((a, b) => {
            // Primero por mostrar_en_primer_modal true
            const aFirst = a?.mostrar_en_primer_modal ? -1 : 0;
            const bFirst = b?.mostrar_en_primer_modal ? -1 : 0;
            if (aFirst !== bFirst) return aFirst - bFirst;
            // Luego por orden numérico si existe
            const aOrden = typeof a?.orden === 'number' ? a.orden : Number.MAX_SAFE_INTEGER;
            const bOrden = typeof b?.orden === 'number' ? b.orden : Number.MAX_SAFE_INTEGER;
            return aOrden - bOrden;
          });
          const allowed = new Set(['facebook', 'video', 'flyer', 'cronograma', 'avisos', 'noticias']);
          finalPromos = finalPromos.filter(p => allowed.has(String(p?.tipo)));
          setPromos(finalPromos);
        } else {
          // Fallback a datos por defecto si hay error
          setPromos([]);
        }
      } catch (error) {
        // Silenciar errores de red para evitar ruido en consola
        setPromos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, [isOpen]);

  // Si no hay promociones después de cargar, cerrar el modal automáticamente
  useEffect(() => {
    if (!loading && isOpen && promos.length === 0) {
      try {
        onClose && onClose();
      } catch (_) {}
    }
  }, [loading, isOpen, promos]);

  // Auto-slide cada 5 segundos (pausa cuando el cursor está sobre el modal)
  useEffect(() => {
    if (!isOpen || promos.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, promos.length, isPaused]);

  // Debug: Log promos when loaded
  useEffect(() => {
    if (!loading) {
      console.log('Promociones cargadas:', promos);
    }
  }, [loading, promos]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
    setMediaIndex(0);
  }, [promos.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
    setMediaIndex(0);
  }, [promos.length]);

  // Navegación con teclado dentro del modal: ← → para cambiar de slide
  useEffect(() => {
    if (!isOpen || promos.length <= 1) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, promos.length, prevSlide, nextSlide]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Extraer ID de TikTok desde una URL de video
  const extractTikTokId = (url) => {
    if (!url) return null;
    const match = String(url).match(/video\/(\d+)/);
    return match ? match[1] : null;
  };

  // Extrae un nombre de página aproximado desde una URL de Facebook
  const extractFacebookPageName = (url) => {
    try {
      const u = new URL(String(url));
      if (!/facebook\.com$/i.test(u.hostname) && !/\.facebook\.com$/i.test(u.hostname)) return 'Facebook';
      const firstSeg = (u.pathname || '/').split('/').filter(Boolean)[0] || '';
      const special = ['story.php', 'permalink.php', 'photo.php', 'share'];
      if (!firstSeg || special.includes(firstSeg)) {
        const idParam = u.searchParams.get('id') || u.searchParams.get('page_id');
        return idParam ? `ID ${idParam}` : 'Facebook';
      }
      return decodeURIComponent(firstSeg).replace(/[-_]/g, ' ');
    } catch {
      return 'Facebook';
    }
  };

  const getFacebookFavicon = () => 'https://www.facebook.com/favicon.ico';

  const checkTikTokEmbeddable = async (url) => {
    try {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const validateVideos = async () => {
      const results = {};
      await Promise.all(promos.map(async (promo, idx) => {
        const id = extractTikTokId(promo?.video_tiktok_url);
        if (id) {
          results[idx] = await checkTikTokEmbeddable(promo.video_tiktok_url);
        } else {
          results[idx] = false;
        }
      }));
      setEmbeddableMap(results);
    };
    if (promos.length > 0) {
      validateVideos();
    }
  }, [promos]);

  // Control de carga y fallback para Facebook
  useEffect(() => {
    const promo = promos[currentSlide];
    const facebook = promo && String(promo?.tipo) === 'facebook' && typeof promo?.facebook_url === 'string' && /facebook\.com\//i.test(promo.facebook_url);
    let timer;
    if (facebook) {
      setFbLoading(true);
      setFbError(false);
      timer = setTimeout(() => {
        setFbError(true);
        setFbLoading(false);
      }, 10000); // 10s sin onLoad => fallback
    } else {
      setFbLoading(false);
      setFbError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentSlide, promos]);

  // Medir y establecer el ancho del contenedor del embed de Facebook
  useEffect(() => {
    const measure = () => {
      const el = fbContainerRef.current;
      if (el) {
        const w = Math.max(320, Math.min(el.clientWidth, 1300));
        setFbWidth(w);
      }
    };
    // Medir inmediatamente y en resize
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // Re-medimos cuando cambian las promos o el slide actual
  }, [currentSlide, promos, isOpen]);

  // Mapear los tipos de la base de datos a las etiquetas del frontend
  const getTypeLabel = (tipo) => {
    switch (tipo) {
      case 'cronograma': return 'CRONOGRAMA';
      case 'flyer': return 'FLYER';
      case 'video': return 'TIKTOK';
      case 'facebook': return 'FACEBOOK';
      case 'avisos': return 'AVISOS';
      case 'noticias': return 'NOTICIAS';
      default: return tipo ? tipo.toUpperCase() : 'PROMOCIÓN';
    }
  };
  // Mapeo de estado del cronograma a estilos y etiquetas
  const getCronoEstado = (estado) => {
    const key = String(estado || '').toLowerCase();
    switch (key) {
      case 'pendiente':
        return { label: 'Pendiente', classes: 'text-amber-700 bg-amber-50 border-amber-300', icon: <AlertCircle className="w-4 h-4" /> };
      case 'en_proceso':
      case 'proceso':
      case 'en-proceso':
        return { label: 'En proceso', classes: 'text-blue-700 bg-blue-50 border-blue-300', icon: <Clock className="w-4 h-4" /> };
      case 'finalizado':
      case 'completado':
        return { label: 'Finalizado', classes: 'text-emerald-700 bg-emerald-50 border-emerald-300', icon: <CheckCircle className="w-4 h-4" /> };
      default:
        return { label: 'Estado', classes: 'text-gray-700 bg-gray-50 border-gray-300', icon: <Info className="w-4 h-4" /> };
    }
  };
  const getCronoColorClasses = (color) => {
    const key = String(color || '').toLowerCase();
    switch (key) {
      case 'blue': return 'border-blue-300';
      case 'cyan': return 'border-cyan-300';
      case 'teal': return 'border-teal-300';
      case 'orange': return 'border-orange-300';
      case 'amber': return 'border-amber-300';
      case 'red': return 'border-red-300';
      case 'rose': return 'border-rose-300';
      case 'green': return 'border-green-300';
      case 'emerald': return 'border-emerald-300';
      case 'indigo': return 'border-indigo-300';
      case 'purple': return 'border-purple-300';
      default: return 'border-gray-300';
    }
  };
  const getCronoIcon = (icono) => {
    const key = String(icono || '').toLowerCase();
    switch (key) {
      case 'calendar':
      case 'calendario':
        return <CalendarDays className="w-4 h-4" />;
      case 'clipboard':
      case 'lista':
        return <ClipboardList className="w-4 h-4" />;
      case 'clock':
      case 'reloj':
        return <Clock className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };
  // Paleta dinámica por tipo (para badge y CTA)
  const getTypeClasses = (tipo) => {
    switch (tipo) {
      case 'cronograma': return 'from-teal-500 to-cyan-500';
      case 'flyer': return 'from-pink-500 to-rose-600';
      case 'video': return 'from-gray-900 to-gray-700';
      case 'facebook': return 'from-blue-600 to-blue-400';
      case 'avisos': return 'from-orange-600 to-amber-500';
      case 'noticias': return 'from-emerald-600 to-green-500';
      default: return 'from-indigo-500 to-cyan-500';
    }
  };
  // Icono por tipo
  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'cronograma': return <CalendarDays className="w-4 h-4" />;
      case 'flyer': return <Megaphone className="w-4 h-4" />;
      case 'avisos': return <AlertTriangle className="w-4 h-4" />;
      case 'noticias': return <Info className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  // Texto por defecto para CTA según tipo cuando no hay configuración
  const getDefaultPrimaryText = (tipo) => {
    switch (String(tipo)) {
      case 'avisos': return 'Más detalles';
      case 'cronograma': return 'Ver cronograma';
      case 'noticias': return 'Leer noticia';
      default: return 'Ver más';
    }
  };

  // Si está cargando, no mostrar nada para evitar un parpadeo
  // Cargar cronograma cuando el slide actual sea de tipo cronograma
  useEffect(() => {
    if (!isOpen) return; // Evitar llamadas si el modal está cerrado
    const promo = promos[currentSlide];
    if (promo && String(promo?.tipo) === 'cronograma' && promo?.id) {
      const fetchCronograma = async () => {
        try {
          setCronogramaLoading(true);
          setCronogramaError(null);
          const res = await fetch(`${API_BASE}/modal-promocional/${promo.id}/cronograma`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setCronogramaItems(Array.isArray(data) ? data : []);
        } catch (e) {
          // Silenciar el error de red y mostrar un estado amable
          setCronogramaError('No se pudo cargar el cronograma');
          setCronogramaItems([]);
        } finally {
          setCronogramaLoading(false);
        }
      };
      fetchCronograma();
    } else {
      setCronogramaItems([]);
      setCronogramaError(null);
      setCronogramaLoading(false);
    }
  }, [currentSlide, promos, isOpen]);

  // Asegurar que los hooks se ejecuten siempre antes de cualquier return condicional
  if (loading) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full" // Usar ancho fijo consistente
      allowOverflow={true}
      className="promo-modal-content relative max-w-[92vw] md:max-w-[920px] lg:max-w-[920px]" // Tamaño uniforme del contenido
      overlayClassName="promo-modal-backdrop fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-300"
      showCloseButton={false}
      closeOnOverlayClick={true}
    >
      {promos.length === 0 ? (
        // Estado cuando no hay promociones
        <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-lg shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="bg-white/30 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
              aria-label="Cerrar modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <svg className="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <h2 className="text-3xl font-bold mb-2">No hay promociones activas</h2>
          <p className="text-blue-200 max-w-sm">
            Vuelve más tarde para descubrir nuevas ofertas y cursos. ¡Siempre estamos preparando algo nuevo para ti!
          </p>
        </div>
      ) : (() => {
        // Renderizar el carrusel de promociones si existen
        const currentPromo = promos[currentSlide];
        // Mostrar video si existe un ID válido de TikTok.
        // No dependemos del oEmbed para permitir que el iframe intente cargar.
        const hasTikTokId = Boolean(extractTikTokId(currentPromo?.video_tiktok_url));
        const isVideo = hasTikTokId;
        const isFacebook = String(currentPromo?.tipo) === 'facebook' && typeof currentPromo?.facebook_url === 'string' && /facebook\.com\//i.test(currentPromo.facebook_url);
        // Tratar como visual tipo flyer los gráficos: flyer, avisos, noticias y cronograma
        const isFlyer = ['flyer', 'avisos', 'noticias', 'cronograma'].includes(String(currentPromo?.tipo));
        // Para etiquetar y estilos: si hay URL de TikTok válida, usar apariencia de tipo "video".
        const visualTipo = hasTikTokId ? 'video' : currentPromo.tipo;
        const buildFacebookEmbed = (url) => {
          try {
            const href = encodeURIComponent(String(url || ''));
            const w = Math.round(fbWidth || 700);
            return `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true&width=${w}`;
          } catch { return null; }
        };
        return (
          <div
            key={currentSlide}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`
            relative overflow-visible rounded-lg shadow-2xl bg-white w-full
            transform transition-all duration-500 ease-in-out
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}> 
            
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={onClose}
                className="bg-gray-800/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-gray-700/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className={`${(isVideo || isFlyer || isFacebook) ? 'md:max-h-[80vh]' : 'md:flex md:max-h-[80vh]'}`}>
              {/* Media column: TikTok o imagen */}
              <div className={`${(isVideo || isFlyer || isFacebook) ? 'w-full' : 'md:w-1/2'}`}>
                {isVideo ? (
                  <div className="w-full h-[70vh] md:h-[80vh] bg-black flex items-center justify-center overflow-y-auto">
                    <iframe
                      title={`TikTok: ${currentPromo?.nombre_curso || 'Video'}`}
                      className="w-full h-full"
                      src={`https://www.tiktok.com/embed/v2/${extractTikTokId(currentPromo.video_tiktok_url)}?lang=es-ES`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : isFacebook ? (
                  <>
                    <div ref={fbContainerRef} className="relative w-full h-[70vh] md:h-[80vh] bg-white flex items-center justify-center overflow-y-auto">
                      {fbError ? (
                        <div className="p-6 text-center text-gray-700">
                          <p className="mb-2">No se pudo cargar la publicación de Facebook.</p>
                          <p className="text-sm text-gray-500">Puedes abrirla directamente en Facebook.</p>
                        </div>
                      ) : (
                        <iframe
                          title={`Facebook: ${currentPromo?.titulo || 'Publicación'}`}
                          key={fbWidth}
                          className="w-full h-full"
                          width={fbWidth}
                          src={buildFacebookEmbed(currentPromo.facebook_url)}
                          style={{ border: 'none', overflow: 'hidden' }}
                          scrolling="no"
                          frameBorder="0"
                          allowFullScreen={true}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          onLoad={() => setFbLoading(false)}
                        />
                      )}
                      {fbLoading && !fbError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {/* Botón de respaldo para abrir en Facebook */}
                    <div className="w-full flex justify-center mt-2">
                      <a
                        href={currentPromo?.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => console.log('Click Ver en Facebook', currentPromo?.facebook_url)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <img src={getFacebookFavicon()} alt="Facebook" className="w-4 h-4 rounded-sm" />
                        <span className="text-white/90 text-xs">{extractFacebookPageName(currentPromo?.facebook_url)}</span>
                        <span>Ver en Facebook</span>
                      </a>
                    </div>
                   </>
                ) : (
                  (() => {
                    // Construir lista de imágenes: principal + adicionales
                    let extras = [];
                    try {
                      extras = currentPromo?.imagenes_extra ? JSON.parse(currentPromo.imagenes_extra) : [];
                    } catch { extras = []; }
                    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
                    const hasValidExt = (p) => {
                      if (!p || typeof p !== 'string') return false;
                      const lower = p.toLowerCase();
                      return allowedExt.some(ext => lower.endsWith(ext));
                    };
                    const toPath = (p) => {
                      if (!p) return null;
                      // Usar rutas relativas para que Vite proxy maneje /uploads
                      // Si ya es absoluta (http/https), respetarla
                      return p.startsWith('http') ? p : p.startsWith('/') ? p : `/${p}`;
                    };
                    const imageList = [currentPromo?.imagen, ...extras]
                      .filter(Boolean)
                      .filter(hasValidExt)
                      .map(toPath);
                    const currentImage = imageList[mediaIndex] || toPath(currentPromo?.imagen);
                    // Rama de cronograma: manejar carga, error, datos y vacío
                    const isCronograma = false; // Tratamos cronograma igual que flyer
                    if (isCronograma) {
                      // Estado: cargando
                      if (cronogramaLoading) {
                        return (
                          <div className="relative h-[70vh] md:h-[80vh] w-full flex items-stretch justify-center">
                            <div className="relative bg-white rounded-lg shadow-md w-[92%] h-full overflow-hidden border border-gray-200">
                              <div className="absolute inset-0 pt-10 pb-6 px-4 md:px-6">
                                <div className="animate-pulse space-y-3">
                                  <div className="h-3 w-32 bg-gray-200 rounded" />
                                  <div className="h-5 w-3/5 bg-gray-200 rounded" />
                                  <div className="space-y-2">
                                    <div className="h-16 bg-gray-100 rounded" />
                                    <div className="h-16 bg-gray-100 rounded" />
                                    <div className="h-16 bg-gray-100 rounded" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      // Estado: error
                      if (cronogramaError) {
                        return (
                          <div className="relative h-[70vh] md:h-[80vh] w-full flex items-stretch justify-center">
                            <div className="relative bg-white rounded-lg shadow-md w-[92%] h-full overflow-hidden border border-gray-200">
                              <div className="absolute inset-0 pt-10 pb-6 px-4 md:px-6">
                                <div className="flex items-center gap-3 p-4 rounded-lg border border-red-300 bg-red-50">
                                  <div className="text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                                  <div className="flex-1">
                                    <p className="text-sm md:text-base text-red-800 font-medium">No se pudo cargar el cronograma.</p>
                                    <p className="text-xs md:text-sm text-red-700">Intenta nuevamente o comunícate con administración.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      // Estado: con datos
                      if (cronogramaItems && cronogramaItems.length > 0) {
                        return (
                          <div className="relative h-[70vh] md:h-[80vh] w-full flex items-stretch justify-center">
                            <div className="relative bg-white rounded-lg shadow-md w-[92%] h-full overflow-hidden border border-gray-200">
                              <div className={`absolute top-0 left-0 right-0 h-2 md:h-3 bg-gradient-to-r ${getTypeClasses(currentPromo?.tipo)} rounded-t-lg`} />
                              <div className={`absolute top-3 left-3 z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeClasses(currentPromo?.tipo)} shadow-md`}>
                                {getTypeIcon(currentPromo?.tipo)}
                                <span>{getTypeLabel(currentPromo?.tipo)}</span>
                              </div>
                              <div className="absolute inset-0 pt-10 pb-6 px-4 md:px-6 overflow-y-auto">
                                <div className="mb-3">
                                  <h3 className="text-base md:text-lg font-semibold text-gray-900">{currentPromo?.titulo || 'Cronograma de matrículas'}</h3>
                                  {currentPromo?.descripcion && (
                                    <p className="text-sm text-gray-600 mt-1">{String(currentPromo.descripcion).trim()}</p>
                                  )}
                                </div>
                                <div className="space-y-3">
                                  {cronogramaItems.map((item) => {
                                    const estado = getCronoEstado(item.estado);
                                    const colorBorder = getCronoColorClasses(item.color);
                                    return (
                                      <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border ${colorBorder} bg-white/80`}>
                                        <div className="mt-0.5 text-gray-700">{getCronoIcon(item.icono)}</div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm md:text-base font-semibold text-gray-900 truncate">{item.fase}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${estado.classes} text-[11px] md:text-xs font-medium`}>{estado.icon}<span>{estado.label}</span></span>
                                          </div>
                                          <div className="mt-0.5 text-xs md:text-sm text-gray-700">
                                            <span>{formatDate(item.fecha_inicio)}</span>
                                            <span className="mx-1">—</span>
                                            <span>{formatDate(item.fecha_fin)}</span>
                                          </div>
                                          {item.descripcion && (
                                            <p className="mt-1 text-xs md:text-sm text-gray-600 line-clamp-2">{String(item.descripcion).trim()}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {currentPromo?.url_accion && (
                                  <div className="mt-4 flex justify-end">
                                    <a
                                      href={currentPromo.url_accion}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold"
                                    >
                                      {currentPromo?.texto_boton_primario || getDefaultPrimaryText(currentPromo?.tipo)}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      // Estado: vacío (placeholder elegante)
                      return (
                        <div className="relative h-[70vh] md:h-[80vh] w-full flex items-stretch justify-center">
                          <div className="relative bg-white rounded-lg shadow-md w-[92%] h-full overflow-hidden border border-gray-200">
                            <div className={`absolute top-0 left-0 right-0 h-2 md:h-3 bg-gradient-to-r ${getTypeClasses(currentPromo?.tipo)} rounded-t-lg`} />
                            <div className={`absolute top-3 left-3 z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeClasses(currentPromo?.tipo)} shadow-md`}>
                              {getTypeIcon(currentPromo?.tipo)}
                              <span>{getTypeLabel(currentPromo?.tipo)}</span>
                            </div>
                            <div className="absolute inset-0 pt-10 pb-6 px-4 md:px-6 overflow-y-auto">
                              <div className="mb-3">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900">{currentPromo?.titulo || 'Cronograma de matrículas'}</h3>
                                {currentPromo?.descripcion && (
                                  <p className="text-sm text-gray-600 mt-1">{String(currentPromo.descripcion).trim()}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
                                <div className="text-gray-700"><ClipboardList className="w-5 h-5" /></div>
                                <div className="flex-1">
                                  <p className="text-sm md:text-base text-gray-800 font-medium">El cronograma está en preparación.</p>
                                  <p className="text-xs md:text-sm text-gray-600">Pronto publicaremos las fases y fechas de este ciclo.</p>
                                  {(currentPromo?.fecha_inicio || currentPromo?.fecha_fin) && (
                                    <p className="mt-1 text-xs md:text-sm text-gray-700">
                                      {formatDate(currentPromo?.fecha_inicio)} — {formatDate(currentPromo?.fecha_fin)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {currentPromo?.url_accion && (
                                <div className="mt-4 flex justify-end">
                                  <a
                                    href={currentPromo.url_accion}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold"
                                  >
                                    {currentPromo?.texto_boton_primario || getDefaultPrimaryText(currentPromo?.tipo)}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    // Fallback a imagen (comportamiento previo)
                    return (
                      <div className="relative flex items-center justify-center h-[70vh] md:h-[80vh]">
                        <img 
                          src={currentImage || logoFallback} 
                          alt={currentPromo.titulo || 'Promoción'}
                          className={`${
                            isFlyer
                              ? 'w-full h-full object-contain bg-white rounded-lg'
                              : 'object-cover w-full h-64 md:h-full'
                          }`}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => { if (e?.target) e.target.src = logoFallback; }}
                        />
                        {isFlyer && (
                          <>
                            {/* Barra superior tipo card para reforzar el estilo por tipo */}
                            <div className={`absolute top-0 left-0 right-0 h-2 md:h-3 bg-gradient-to-r ${getTypeClasses(currentPromo?.tipo)} rounded-t-lg`} />
                            {/* Badge del tipo */}
                            <div className={`absolute top-3 left-3 z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeClasses(currentPromo?.tipo)} shadow-md`}>
                              {getTypeIcon(currentPromo?.tipo)}
                              <span>{getTypeLabel(currentPromo?.tipo)}</span>
                            </div>
                            {/* Descripción y CTA opcional */}
                            {(currentPromo?.descripcion || currentPromo?.url_accion) && (
                              <div className="absolute left-0 right-0 bottom-3 mx-3 md:mx-6 flex flex-col md:flex-row md:items-center gap-3 p-3 md:p-4 bg-black/40 text-white rounded-lg backdrop-blur-sm">
                                {currentPromo?.descripcion && (
                                  <p className="flex-1 text-sm md:text-base leading-relaxed">
                                    {String(currentPromo.descripcion).trim()}
                                  </p>
                                )}
                                {currentPromo?.url_accion && (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={currentPromo.url_accion}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-2 rounded-md bg-white text-gray-900 hover:bg-gray-100 text-sm font-semibold"
                                    >
                                      {currentPromo?.texto_boton_primario || getDefaultPrimaryText(currentPromo?.tipo)}
                                    </a>
                                    {currentPromo?.texto_boton_secundario && (
                                      <a
                                        href={currentPromo.url_accion}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 rounded-md bg-white/20 text-white hover:bg-white/30 text-sm"
                                      >
                                        {currentPromo.texto_boton_secundario}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        {isFlyer && imageList.length > 1 && (
                          <>
                            <button
                              onClick={() => setMediaIndex((mediaIndex - 1 + imageList.length) % imageList.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-2 text-white hover:bg-black/50"
                              aria-label="Imagen anterior"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button
                              onClick={() => setMediaIndex((mediaIndex + 1) % imageList.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-2 text-white hover:bg-black/50"
                              aria-label="Siguiente imagen"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/20 rounded-full px-2 py-1">
                              {imageList.map((_, i) => (
                                <span key={i} className={`w-2 h-2 rounded-full ${i === mediaIndex ? 'bg-white' : 'bg-white/50'}`}></span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Content column: solo cuando no es video, flyer ni Facebook */}
              {!isVideo && !isFlyer && !isFacebook && (
              <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
                <div className="flex-grow">
                  {(() => {
                    const descriptionText = String(
                      currentPromo?.descripcion ||
                      currentPromo?.descripcion_publicacion ||
                      currentPromo?.descripcion_post ||
                      currentPromo?.titulo ||
                      ''
                    ).trim();
                    const lines = descriptionText ? descriptionText.split('\n') : [];
                    return (
                      <div className="text-gray-800">
                        {lines.length > 0 ? (
                          lines.map((line, i) => (
                            <p key={i} className="mb-3 leading-relaxed">{line.trim()}</p>
                          ))
                        ) : (
                          <p className="text-gray-500">Sin descripción disponible.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
                {isFacebook && (
                  <div className="mt-6">
                    <a
                      href={currentPromo?.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <img src={getFacebookFavicon()} alt="Facebook" className="w-4 h-4 rounded-sm" />
                      <span className="text-white/90 text-xs">{extractFacebookPageName(currentPromo?.facebook_url)}</span>
                      <span>Ver en Facebook</span>
                    </a>
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Slide navigation */}
            {promos.length > 1 && (
              <>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 z-20">
                  {promos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${ 
                        index === currentSlide
                          ? 'bg-white shadow-lg scale-125'
                          : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                      }`}
                      aria-label={`Ir a la promoción ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={prevSlide}
                  className="absolute left-1 md:-left-14 lg:-left-16 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-md rounded-full p-2 md:p-3 text-white hover:bg-black/50 transition-all duration-200 shadow-lg border border-white/10 hover:scale-110 z-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
                  aria-label="Promoción anterior"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-1 md:-right-14 lg:-right-16 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-md rounded-full p-2 md:p-3 text-white hover:bg-black/50 transition-all duration-200 shadow-lg border border-white/10 hover:scale-110 z-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
                  aria-label="Siguiente promoción"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        );
      })()
    }
    </Modal>
  );
};

export default PromoModal;

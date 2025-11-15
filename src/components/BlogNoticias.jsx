import React, { useState, useEffect } from 'react';
import NewsAPIService from '../services/NewsAPIService';
import { Button } from '@/components/ui';

function BlogNoticias({ compact = false }) {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const loadTechNews = async () => {
      try {
        setLoading(true);
        const maxItems = compact ? 4 : 6;
        const news = await NewsAPIService.fetchTechNews(null, maxItems);
        setNoticias(Array.isArray(news) ? news.slice(0, maxItems) : []);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading tech news:', error);
        const maxItems = compact ? 4 : 6;
        setNoticias(NewsAPIService.getFallbackNews().slice(0, maxItems));
        setLastUpdate(new Date());
      } finally {
        setLoading(false);
      }
    };

    // Cargar noticias al inicio
    loadTechNews();

    // Auto-refresh cada 6 horas (21,600,000 ms)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Actualizando noticias automáticamente...');
      loadTechNews();
    }, 6 * 60 * 60 * 1000);

    // Limpiar interval al desmontar componente
    return () => clearInterval(refreshInterval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 110) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleNewsClick = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      programming: '💻',
      ai_ml: '🤖',
      cybersecurity: '🔒',
      cloud: '☁️',
      data_analysis: '📊',
      design: '🎨'
    };
    return icons[category] || '🌐';
  };

  const getCategoryName = (category) => {
    const names = {
      programming: 'Programación',
      ai_ml: 'IA & ML',
      cybersecurity: 'Ciberseguridad',
      cloud: 'Cloud',
      data_analysis: 'Datos',
      design: 'Diseño'
    };
    return names[category] || 'Tecnología';
  };

  const getDefaultImageByCategory = (category) => {
    const defaultImages = {
      programming: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      ai_ml: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      cybersecurity: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      cloud: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      data_analysis: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      design: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80';
  };

  const isRecentNews = (publishedAt) => {
    const newsDate = new Date(publishedAt);
    const now = new Date();
    const diffHours = (now - newsDate) / (1000 * 60 * 60);
    return diffHours < 24; // Noticias de las últimas 24 horas
  };

  if (loading) {
    return (
      <section className={compact ? "bg-gray-50 py-4 px-3" : "bg-gray-50 py-6 px-4"}>
        <div className="max-w-7xl mx-auto">
          {!compact && (
            <div className="text-center mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px bg-gray-300 flex-1"></div>
                <h2 className="text-2xl font-bold text-gray-900 mx-6 font-serif">Noticias Tecnológicas</h2>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <p className="text-gray-600 text-sm max-w-3xl mx-auto font-light">Cargando las últimas noticias del mundo tecnológico...</p>
            </div>
          )}
          
        <div className={compact ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {[...Array(compact ? 4 : 6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 animate-pulse">
              <div className={compact ? "h-36 bg-gradient-to-br from-gray-200 to-gray-300" : "h-40 bg-gradient-to-br from-gray-200 to-gray-300"}></div>
                
                <div className={compact ? "p-3" : "p-4"}>
                  <div className={compact ? "flex items-center justify-between mb-3" : "flex items-center justify-between mb-4"}>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>

                  <div className={compact ? "space-y-2 mb-2" : "space-y-2 mb-3"}>
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                  </div>

                  <div className={compact ? "space-y-2 mb-3" : "space-y-2 mb-4"}>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const itemsCompact = compact ? (noticias.slice(0, 4)) : (noticias.slice(0, 6));
  let itemsToRender = itemsCompact;
  if (compact && itemsCompact.length < 4) {
    const fallback = NewsAPIService.getFallbackNews();
    const needed = 4 - itemsCompact.length;
    itemsToRender = itemsCompact.concat(fallback.slice(0, needed));
  }

  return (
    <section className={compact ? "bg-gray-50 py-4 px-3" : "bg-gray-50 py-12 px-6"}>
      <div className="max-w-7xl mx-auto">
        {!compact && (
          <div className="text-center mb-10 border-b border-gray-200 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h2 className="text-3xl font-bold text-gray-900 mx-6 font-serif">Noticias Tecnológicas</h2>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <p className="text-gray-600 text-base max-w-3xl mx-auto font-light">Últimas noticias del mundo tecnológico • Actualizado diariamente • Fuentes verificadas</p>
            <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lastUpdate ? (
                <>
                  Última actualización: {lastUpdate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </>
              ) : (
                'Cargando información de actualización...'
              )}
            </div>
          </div>
        )}
        {compact && (
          <div className="text-center mb-4 border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-gray-900 font-serif">Noticias Tecnológicas</h2>
            <p className="text-gray-600 text-xs max-w-2xl mx-auto">Últimas noticias del mundo tecnológico • Actualizado diariamente • Fuentes verificadas</p>
            <div className="flex items-center justify-center mt-2 text-[11px] text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lastUpdate ? (
                <>
                  Última actualización: {lastUpdate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })} {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </>
              ) : (
                'Actualizando...'
              )}
            </div>
          </div>
        )}
        
        <div className={compact ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {itemsToRender.map((noticia, i) => (
            <article 
              key={(noticia.url && noticia.url !== '#') ? noticia.url : `${noticia.id || noticia.title || 'news'}-${i}`} 
              className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleNewsClick(noticia.url)}
            >
              {/* Imagen de la noticia */}
              <div className={compact ? "relative h-32 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100" : "relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100"}>
                {noticia.imageUrl && noticia.imageUrl !== '#' ? (
                  <img 
                    src={noticia.imageUrl} 
                    alt={noticia.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => {
                      // Si falla la imagen, mostrar imagen de respaldo por categoría
                      e.target.src = getDefaultImageByCategory(noticia.category);
                    }}
                  />
                ) : (
                  // Imagen de respaldo si no hay imageUrl
                  <img 
                    src={getDefaultImageByCategory(noticia.category)} 
                    alt={noticia.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge de categoría sobre la imagen */}
                <div className="absolute top-3 left-3">
                  <span className={compact ? "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm" : "inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm"}>
                    <span className="mr-1">{getCategoryIcon(noticia.category)}</span>
                    {getCategoryName(noticia.category).toUpperCase()}
                  </span>
                </div>

                {/* Indicador de noticia reciente */}
                {isRecentNews(noticia.publishedAt) && (
                  <div className={compact ? "absolute top-3 right-3" : "absolute top-4 right-4"}>
                    <span className={compact ? "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-sm animate-pulse" : "inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm animate-pulse"}>
                      <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                      NUEVO
                    </span>
                  </div>
                )}
              </div>
              
              <div className={compact ? "p-3" : "p-6"}>
                {/* Fecha y fuente estilo periódico */}
                <div className={compact ? "flex items-center justify-between mb-3 text-[11px] text-gray-500 uppercase tracking-wide" : "flex items-center justify-between mb-4 text-xs text-gray-500 uppercase tracking-wide"}>
                  <time className="font-medium">
                    {new Date(noticia.publishedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </time>
                  <span className="flex items-center font-medium">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    </svg>
                    {noticia.source || 'Fuente desconocida'}
                  </span>
                </div>

                {/* Título estilo periódico */}
                <h3 className={compact ? "font-bold text-sm mb-2 text-gray-900 leading-tight group-hover:text-blue-700 transition-colors duration-200 font-serif line-clamp-2" : "font-bold text-lg mb-3 text-gray-900 leading-tight group-hover:text-blue-700 transition-colors duration-200 font-serif line-clamp-2"}>
                  {noticia.title}
                </h3>

                {/* Descripción */}
                <p className={compact ? "text-gray-700 text-[11px] mb-2 leading-relaxed line-clamp-2" : "text-gray-700 text-sm mb-3 leading-relaxed line-clamp-3"}>
                  {truncateText(noticia.description, 150)}
                </p>

                {/* Separador */}
                <div className={compact ? "border-t border-gray-100 pt-3" : "border-t border-gray-100 pt-4"}>
                  {/* Cursos relacionados */}
                  {noticia.relatedCourses && noticia.relatedCourses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                        Cursos INFOUNA relacionados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {noticia.relatedCourses.slice(0, 2).map((course, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 font-medium"
                            title={course}
                          >
                            {course.length > 25 ? course.substring(0, 25) + '...' : course}
                          </span>
                        ))}
                        {noticia.relatedCourses.length > 2 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{noticia.relatedCourses.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botón de leer más */}
                  <div className={compact ? "flex items-center justify-between" : "flex items-center justify-between"}>
                    <span className="text-xs text-gray-500">
                      Hace {Math.max(0, Math.floor((Date.now() - new Date(noticia.publishedAt)) / (1000 * 60 * 60 * 24)))} días
                    </span>
                    <Button 
                      variant="outline" 
                      size="xs"
                      className="text-blue-700 border-blue-600 hover:bg-blue-50"
                      onClick={(e) => { e.stopPropagation(); handleNewsClick(noticia.url); }}
                      aria-label="Leer artículo completo"
                    >
                      Leer artículo completo
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!compact && (
          <div className="mt-6 text-center border-t border-gray-200 pt-4">
            <div className="bg-blue-50 rounded-lg p-4 max-w-3xl mx-auto">
              <p className="text-gray-700 text-sm mb-3">¿Te interesan estas tecnologías? Explora nuestros cursos INFOUNA.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="primary" size="xs">Ver Catálogo</Button>
                <Button variant="outline" size="xs">Solicitar Información</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogNoticias;

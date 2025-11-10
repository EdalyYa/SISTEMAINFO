import React, { useState, useEffect } from 'react';
import NewsAPIService from '../services/NewsAPIService';

function BlogNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const loadTechNews = async () => {
      try {
        setLoading(true);
        const news = await NewsAPIService.fetchTechNews(null, 6);
        // Asegurar que solo se muestren 6 ítems como máximo
        setNoticias(Array.isArray(news) ? news.slice(0, 6) : []);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading tech news:', error);
        // Usar noticias de respaldo
        setNoticias(NewsAPIService.getFallbackNews().slice(0, 6));
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

  const truncateText = (text, maxLength = 120) => {
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
      <section className="bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header estilo periódico */}
          <div className="text-center mb-10 border-b border-gray-200 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h2 className="text-3xl font-bold text-gray-900 mx-6 font-serif">Noticias Tecnológicas</h2>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <p className="text-gray-600 text-base max-w-3xl mx-auto font-light">
              Cargando las últimas noticias del mundo tecnológico...
            </p>
          </div>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 animate-pulse">
              {/* Imagen skeleton */}
              <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                
                <div className="p-6">
                  {/* Fecha y fuente skeleton */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>

                  {/* Título skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                  </div>

                  {/* Descripción skeleton */}
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>

                  {/* Footer skeleton */}
                  <div className="border-t border-gray-100 pt-4">
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

  return (
    <section className="bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header estilo periódico */}
        <div className="text-center mb-10 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <h2 className="text-3xl font-bold text-gray-900 mx-6 font-serif">Noticias Tecnológicas</h2>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          <p className="text-gray-600 text-base max-w-3xl mx-auto font-light">
            Últimas noticias del mundo tecnológico • Actualizado diariamente • Fuentes verificadas
          </p>
          <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {lastUpdate ? (
              <>
                Última actualización: {lastUpdate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} a las {lastUpdate.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </>
            ) : (
              'Cargando información de actualización...'
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.slice(0, 6).map((noticia, i) => (
            <article 
              key={(noticia.url && noticia.url !== '#') ? noticia.url : `${noticia.id || noticia.title || 'news'}-${i}`} 
              className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleNewsClick(noticia.url)}
            >
              {/* Imagen de la noticia */}
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
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
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                    <span className="mr-1">{getCategoryIcon(noticia.category)}</span>
                    {getCategoryName(noticia.category).toUpperCase()}
                  </span>
                </div>

                {/* Indicador de noticia reciente */}
                {isRecentNews(noticia.publishedAt) && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                      NUEVO
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {/* Fecha y fuente estilo periódico */}
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500 uppercase tracking-wide">
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
                <h3 className="font-bold text-xl mb-4 text-gray-900 leading-tight group-hover:text-blue-700 transition-colors duration-200 font-serif line-clamp-3">
                  {noticia.title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-700 text-base mb-6 leading-relaxed line-clamp-4">
                  {truncateText(noticia.description, 150)}
                </p>

                {/* Separador */}
                <div className="border-t border-gray-100 pt-4">
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Hace {Math.max(0, Math.floor((Date.now() - new Date(noticia.publishedAt)) / (1000 * 60 * 60 * 24)))} días
                    </span>
                    <button 
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold group-hover:underline transition-all duration-200"
                      onClick={(e) => { e.stopPropagation(); handleNewsClick(noticia.url); }}
                      aria-label="Leer artículo completo"
                    >
                      <span>Leer artículo completo</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer con información adicional */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <div className="bg-blue-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              ¿Te interesan estas tecnologías?
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Mantente a la vanguardia tecnológica con nuestros cursos especializados en INFOUNA. 
              Desarrolla las habilidades que demanda el mercado actual.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Ver Catálogo de Cursos
              </button>
              <button className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Solicitar Información
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogNoticias;

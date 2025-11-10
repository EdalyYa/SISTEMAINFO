import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { Play, BookOpen, Users, Award } from 'lucide-react';

function VideosInformativos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_BASE}/videos-informativos`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError('Error al cargar los videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case 'tutorial':
        return <BookOpen className="w-4 h-4" />;
      case 'promocion':
        return <Award className="w-4 h-4" />;
      case 'informativo':
        return <Users className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case 'tutorial':
        return 'bg-green-100 text-green-700';
      case 'promocion':
        return 'bg-purple-100 text-purple-700';
      case 'informativo':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Videos Informativos</h2>
          <p className="text-blue-700 mb-8">Tutoriales, promociones y contenido educativo</p>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Videos Informativos</h2>
          <p className="text-blue-700 mb-8">Tutoriales, promociones y contenido educativo</p>
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Videos Informativos</h2>
          <p className="text-blue-700 mb-8">Tutoriales, promociones y contenido educativo</p>
          <div className="bg-white rounded-lg p-8 shadow-md">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Próximamente tendremos videos informativos disponibles.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-3 sm:mb-4">Videos Informativos</h2>
          <p className="text-blue-700 text-base sm:text-lg max-w-3xl mx-auto px-4">Tutoriales, promociones y contenido educativo para ayudarte</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 mx-auto max-w-sm sm:max-w-none">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtube_id}`}
                    title={video.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-40 sm:h-48 rounded-t-xl"
                  ></iframe>
                </div>
                
                {video.categoria && (
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.categoria)}`}>
                      {getCategoryIcon(video.categoria)}
                      {video.categoria}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-gray-900 line-clamp-2">{video.titulo}</h3>
                
                {video.descripcion && (
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3">{video.descripcion}</p>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {video.nombre_testimonio && (
                    <span className="text-blue-600 text-xs sm:text-sm font-medium">
                      Por: {video.nombre_testimonio}
                    </span>
                  )}
                  
                  <div className="flex items-center text-gray-500 text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Video
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Tutoriales</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Promociones</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Informativos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VideosInformativos;

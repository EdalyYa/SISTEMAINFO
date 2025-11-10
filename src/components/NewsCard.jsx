import React, { useState } from 'react';
import { getCategoryById, formatNewsDate, truncateText, getRelatedCourses } from '../utils/techNewsConfig';

const NewsCard = ({ newsItem, onCourseClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const category = getCategoryById(newsItem.category);
  const relatedCourses = getRelatedCourses(newsItem);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleNewsClick = () => {
    if (newsItem.url && newsItem.url !== '#') {
      window.open(newsItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCourseClick = (courseName, event) => {
    event.stopPropagation();
    if (onCourseClick) {
      onCourseClick(courseName);
    }
  };

  return (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-100 cursor-pointer">
      {/* Imagen de la noticia */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
            )}
            <img
              src={newsItem.imageUrl}
              alt={newsItem.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">{category.icon}</div>
              <p className="text-sm font-medium">{category.name}</p>
            </div>
          </div>
        )}
        
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de categoría */}
        <div className="absolute top-3 left-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${category.bgColor} ${category.textColor} backdrop-blur-sm border border-white/20`}>
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </div>
        </div>

        {/* Indicador de relevancia */}
        {newsItem.relevanceScore > 8 && (
          <div className="absolute top-3 right-3">
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.175 0l-3.388 2.462c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
              </svg>
              HOT
            </div>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5" onClick={handleNewsClick}>
        {/* Título */}
        <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {newsItem.title}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {truncateText(newsItem.description, 120)}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatNewsDate(newsItem.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="font-medium">{newsItem.source}</span>
          </div>
        </div>

        {/* Cursos relacionados */}
        {relatedCourses.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Cursos INFOUNA relacionados:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedCourses.map((course, index) => (
                <button
                  key={index}
                  onClick={(e) => handleCourseClick(course.name, e)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                    course.relevance === 'high'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  title={course.description}
                >
                  {course.relevance === 'high' && (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {course.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2">
            <span>Leer noticia completa</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

export default NewsCard;
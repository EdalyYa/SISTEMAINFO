import React from 'react';
import { getAllCategories, getCoursesByCategory } from '../utils/techNewsConfig';

const CategoryFilter = ({ 
  activeCategory = 'all', 
  onCategoryChange, 
  newsCount = {},
  showCourseCount = true 
}) => {
  const categories = getAllCategories();

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div className="mb-8">
      {/* Título de la sección */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Filtrar por categoría tecnológica
        </h3>
        <p className="text-sm text-gray-600">
          Descubre noticias relevantes para los cursos de INFOUNA
        </p>
      </div>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const count = newsCount[category.id] || 0;
          const courses = getCoursesByCategory(category.id);

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`group relative inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                isActive
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-${category.id}/25`
                  : `${category.bgColor} ${category.textColor} hover:shadow-md border border-gray-200 hover:border-gray-300`
              }`}
              title={`${category.name}${courses.length > 0 ? ` - ${courses.length} cursos relacionados` : ''}`}
            >
              {/* Icono de categoría */}
              <span className={`text-lg mr-2 transition-transform duration-300 ${
                isActive ? 'animate-bounce' : 'group-hover:scale-110'
              }`}>
                {category.icon}
              </span>
              
              {/* Nombre de categoría */}
              <span className="font-semibold">
                {category.name}
              </span>

              {/* Contador de noticias */}
              {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}

              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Información adicional de la categoría activa */}
      {activeCategory !== 'all' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getAllCategories().find(c => c.id === activeCategory)?.color} flex items-center justify-center text-white text-lg shadow-sm`}>
                {getAllCategories().find(c => c.id === activeCategory)?.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {getAllCategories().find(c => c.id === activeCategory)?.name}
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                Noticias relacionadas con esta área tecnológica y los cursos de INFOUNA
              </p>
              
              {/* Cursos relacionados */}
              {showCourseCount && (
                <div className="flex flex-wrap gap-1">
                  {getCoursesByCategory(activeCategory).slice(0, 4).map((course, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-white/80 text-xs text-gray-700 rounded-md border border-gray-200"
                      title={course.description}
                    >
                      {course.name}
                    </span>
                  ))}
                  {getCoursesByCategory(activeCategory).length > 4 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded-md">
                      +{getCoursesByCategory(activeCategory).length - 4} más
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Botón para limpiar filtro */}
            <button
              onClick={() => handleCategoryClick('all')}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Ver todas las categorías"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>
              {Object.values(newsCount).reduce((total, count) => total + count, 0)} noticias totales
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>
              {Object.keys(getAllCategories().reduce((acc, cat) => {
                getCoursesByCategory(cat.id).forEach(course => {
                  acc[course.name] = true;
                });
                return acc;
              }, {})).length} cursos INFOUNA relacionados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
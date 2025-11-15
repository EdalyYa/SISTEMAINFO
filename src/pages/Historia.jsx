import React from 'react';
import { FaCalendarAlt, FaGraduationCap, FaAward, FaUsers, FaLaptopCode, FaChartLine, FaBuilding, FaRocket, FaCertificate, FaGlobe, FaMicrochip } from 'react-icons/fa';

function Historia() {
  const timelineEvents = [
    {
      year: '1856',
      title: 'Fundación de la UNA Puno',
      description: 'El presidente Ramón Castilla funda la Universidad Nacional del Altiplano de Puno',
      icon: FaBuilding,
      color: 'blue'
    },
    {
      year: '1990',
      title: 'Creación del INFOUNA',
      description: 'Establecimiento del Instituto de Informática como unidad especializada de la UNA Puno',
      icon: FaLaptopCode,
      color: 'green'
    },
    {
      year: '2010',
      title: 'Modernización Digital',
      description: 'Implementación de laboratorios modernos y programas especializados en tecnología',
      icon: FaCertificate,
      color: 'purple'
    },
    {
      year: '2020',
      title: 'Transformación Virtual',
      description: 'Adaptación exitosa a educación híbrida y plataformas digitales avanzadas',
      icon: FaRocket,
      color: 'orange'
    },
    {
      year: '2024',
      title: 'Laboratorios Huawei',
      description: 'Apertura de nuevos laboratorios de innovación, tecnología y conectividad con Huawei',
      icon: FaAward,
      color: 'yellow'
    }
  ];

  const achievements = [
    { number: '168+', label: 'Años UNA Puno', icon: FaCalendarAlt, color: 'blue' },
    { number: '30+', label: 'Años INFOUNA', icon: FaGraduationCap, color: 'green' },
    { number: '95%', label: 'Empleabilidad', icon: FaChartLine, color: 'purple' },
    { number: '44', label: 'Programas UNA', icon: FaGlobe, color: 'orange' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
      orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative mb-3">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-3 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full ring-1 ring-blue-200 mb-1 font-mono">
                <FaMicrochip className="w-4 h-4" />
                <span className="text-xs font-semibold">INFO-TECH</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-900">Nuestra Historia</h1>
              <p className="text-xs md:text-sm text-gray-700 max-w-lg mx-auto font-mono">15 años formando líderes tecnológicos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Línea de Tiempo */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <h2 className="text-2xl font-bold text-blue-900">Evolución Institucional</h2>
            </div>
            <p className="text-gray-600 text-xs md:text-sm font-mono">Hitos importantes en nuestro crecimiento</p>
          </div>
          
          <div className="relative">
            {/* Línea central */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-blue-200 to-indigo-200"></div>
            
            {/* Eventos de la línea de tiempo */}
            <div className="space-y-3">
              {timelineEvents.map((event, index) => {
                const IconComponent = event.icon;
                const colorClasses = getColorClasses(event.color);
                const isLeft = index % 2 === 0;
                
                return (
                  <div key={event.year} className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Contenido */}
                    <div className={`w-5/12 ${isLeft ? 'text-right pr-5' : 'text-left pl-5'}`}> 
                      <div className="bg-white rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center mb-1">
                          <div className={`p-2 bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-lg mr-3`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-base font-bold text-gray-800">{event.year}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-0.5">{event.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                    
                    {/* Punto central */}
                    <div className="relative z-10">
                      <div className={`w-3 h-3 bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-full border-2 border-white shadow-lg`}></div>
                    </div>
                    
                    {/* Espacio vacío del otro lado */}
                    <div className="w-5/12"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Logros y Estadísticas */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5">
          <div className="text-center mb-2.5">
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Logros Destacados
            </h2>
            <p className="text-gray-600 text-sm">Resultados que nos enorgullecen</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              const colorClasses = getColorClasses(achievement.color);
              
              return (
                <div key={index} className="text-center group">
                  <div className={`p-2.5 ${colorClasses.split(' ')[2]} rounded-lg mb-1.5 group-hover:scale-105 transition-transform duration-200`}>
                    <IconComponent className={`w-6 h-6 ${colorClasses.split(' ')[1]} mx-auto`} />
                  </div>
                  <div className={`text-lg font-bold ${colorClasses.split(' ')[1]} mb-0.5`}>{achievement.number}</div>
                  <div className="text-xs text-gray-600">{achievement.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legado del INFOUNA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 text-white text-center">
          <FaUsers className="w-6 h-6 mx-auto mb-3 text-yellow-300" />
          <h3 className="text-lg font-bold mb-1.5">Legado del INFOUNA</h3>
          <p className="text-blue-100 mb-2 text-xs md:text-sm">Como parte de la histórica Universidad Nacional del Altiplano de Puno, fundada en 1856, el INFOUNA continúa la tradición de excelencia académica en la región altiplánica. Ubicados en Jr. Acora N° 235, Puno, formamos profesionales competentes en informática y tecnología, contribuyendo al desarrollo digital del altiplano peruano y la región sur del país.</p>
          <div className="flex justify-center space-x-3">
            <div className="flex items-center space-x-2 text-yellow-300">
              <FaLaptopCode className="w-4 h-4" />
              <span className="text-xs font-medium">Innovación</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-300">
              <FaGraduationCap className="w-4 h-4" />
              <span className="text-xs font-medium">Calidad</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-300">
              <FaAward className="w-4 h-4" />
              <span className="text-xs font-medium">Excelencia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Historia;

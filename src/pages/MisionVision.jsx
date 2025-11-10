import React from 'react';
import { FaLightbulb, FaRocket, FaAward, FaUsers, FaGraduationCap, FaChartLine, FaGlobe, FaHeart } from 'react-icons/fa';

function MisionVision() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Compact Header */}
      <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex p-2 bg-white/20 rounded-full backdrop-blur-sm mb-2">
            <FaGraduationCap className="w-6 h-6 text-yellow-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
            Misión y Visión
          </h1>
          <p className="text-base text-blue-100 max-w-2xl mx-auto">
            Formando líderes tecnológicos con excelencia
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Main Cards - Misión y Visión */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Misión Card */}
          <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-md mr-3">
                  <FaLightbulb className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Misión
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm mb-2">
                <strong className="text-yellow-700">Formar profesionales de excelencia</strong> en informática y tecnología, 
                comprometidos con la innovación y el desarrollo sostenible.
              </p>
              <p className="text-gray-600 text-xs">
                Educación superior que prepara líderes tecnológicos.
              </p>
            </div>
          </div>

          {/* Visión Card */}
          <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md mr-3">
                  <FaRocket className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Visión
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm mb-2">
                <strong className="text-blue-700">Ser el referente líder</strong> en educación tecnológica nacional e internacional, 
                reconocidos por nuestra excelencia académica.
              </p>
              <p className="text-gray-600 text-xs">
                Ecosistema de innovación tecnológica y social.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Values & Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Valores y Logros
            </h2>
            <p className="text-gray-600 text-sm">Principios y resultados</p>
          </div>
          
          {/* Values Grid */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center group">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-2 group-hover:scale-105 transition-transform duration-200">
                <FaAward className="w-4 h-4 text-purple-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-purple-800 text-xs">Excelencia</h3>
            </div>
            
            <div className="text-center group">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg mb-2 group-hover:scale-105 transition-transform duration-200">
                <FaLightbulb className="w-4 h-4 text-blue-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-blue-800 text-xs">Innovación</h3>
            </div>
            
            <div className="text-center group">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-2 group-hover:scale-105 transition-transform duration-200">
                <FaHeart className="w-4 h-4 text-green-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-green-800 text-xs">Integridad</h3>
            </div>
            
            <div className="text-center group">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-2 group-hover:scale-105 transition-transform duration-200">
                <FaUsers className="w-4 h-4 text-orange-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-orange-800 text-xs">Colaboración</h3>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 mb-1">15+</div>
              <div className="text-xs text-gray-600">Años</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 mb-1">5000+</div>
              <div className="text-xs text-gray-600">Graduados</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 mb-1">98%</div>
              <div className="text-xs text-gray-600">Empleabilidad</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600 mb-1">50+</div>
              <div className="text-xs text-gray-600">Convenios</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white text-center">
          <FaGlobe className="w-6 h-6 mx-auto mb-3 text-yellow-300" />
          <h3 className="text-xl font-bold mb-2">Únete a Nuestra Comunidad</h3>
          <p className="text-blue-100 mb-3 text-sm">Próxima generación de líderes tecnológicos</p>
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2 text-yellow-300">
              <FaChartLine className="w-4 h-4" />
              <span className="text-xs font-medium">Crecimiento</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-300">
              <FaGraduationCap className="w-4 h-4" />
              <span className="text-xs font-medium">Calidad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisionVision;

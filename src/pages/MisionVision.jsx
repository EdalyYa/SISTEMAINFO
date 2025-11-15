import React from 'react';
import { FaLightbulb, FaCode, FaAward, FaUsers, FaGraduationCap, FaChartLine, FaMicrochip, FaKeyboard, FaHeart } from 'react-icons/fa';

function MisionVision() {
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
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-900">Misión y Visión</h1>
              <p className="text-xs md:text-sm text-gray-700 max-w-lg mx-auto font-mono">Formación tecnológica con excelencia y enfoque computacional</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Main Cards - Misión y Visión */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Misión Card */}
          <div className="group relative bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-300">
            <div className="h-1 bg-indigo-500"></div>
            <div className="relative p-3">
            <div className="flex items-center mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-2" aria-hidden="true"></span>
              <div className="p-2 bg-blue-50 rounded-lg shadow-sm mr-3">
                <FaMicrochip className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-blue-900">Misión</h2>
            </div>
              <p className="text-gray-700 text-[13px] mb-1 font-mono line-clamp-2">
                <strong className="text-blue-800">Formar profesionales en informática y computación</strong> con liderazgo, ética y capacidad de innovación.
              </p>
              <p className="text-gray-600 text-[12px] font-mono line-clamp-2">Educación superior enfocada en tecnología aplicada.</p>
            </div>
          </div>

          {/* Visión Card */}
          <div className="group relative bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-300">
            <div className="h-1 bg-indigo-500"></div>
            <div className="relative p-3">
              <div className="flex items-center mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-2" aria-hidden="true"></span>
                <div className="p-2 bg-indigo-50 rounded-lg shadow-sm mr-3">
                  <FaCode className="w-5 h-5 text-indigo-700" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-indigo-900">Visión</h2>
              </div>
              <p className="text-gray-700 text-[13px] mb-1 font-mono line-clamp-2">
                <strong className="text-indigo-800">Ser el referente en educación informática</strong> con impacto nacional e internacional, integrando ciencia de la computación y tecnología.
              </p>
              <p className="text-gray-600 text-[12px] font-mono line-clamp-2">Ecosistema de innovación tecnológica y social.</p>
            </div>
          </div>
        </div>

        {/* Compact Values & Stats Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-3 mb-3">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <h2 className="text-2xl font-bold text-blue-900">Valores y Logros</h2>
            </div>
            <p className="text-gray-600 text-xs font-mono">Principios y resultados</p>
          </div>
          
          {/* Values Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="text-center group">
              <div className="p-2.5 bg-blue-50 rounded-lg mb-1.5 ring-1 ring-blue-100 group-hover:scale-105 transition-transform duration-200">
                <FaAward className="w-4 h-4 text-blue-700 mx-auto" />
              </div>
              <h3 className="font-semibold text-blue-800 text-xs font-mono">Excelencia</h3>
            </div>
            
            <div className="text-center group">
              <div className="p-2.5 bg-cyan-50 rounded-lg mb-1.5 ring-1 ring-cyan-100 group-hover:scale-105 transition-transform duration-200">
                <FaLightbulb className="w-4 h-4 text-cyan-700 mx-auto" />
              </div>
              <h3 className="font-semibold text-cyan-800 text-xs font-mono">Innovación</h3>
            </div>
            
            <div className="text-center group">
              <div className="p-2.5 bg-emerald-50 rounded-lg mb-1.5 ring-1 ring-emerald-100 group-hover:scale-105 transition-transform duration-200">
                <FaHeart className="w-4 h-4 text-emerald-700 mx-auto" />
              </div>
              <h3 className="font-semibold text-emerald-800 text-xs font-mono">Integridad</h3>
            </div>
            
            <div className="text-center group">
              <div className="p-2.5 bg-indigo-50 rounded-lg mb-1.5 ring-1 ring-indigo-100 group-hover:scale-105 transition-transform duration-200">
                <FaUsers className="w-4 h-4 text-indigo-700 mx-auto" />
              </div>
              <h3 className="font-semibold text-indigo-800 text-xs font-mono">Colaboración</h3>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-700 mb-1 font-mono tracking-wider">15+</div>
              <div className="text-xs text-gray-600 font-mono">Años</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-700 mb-1 font-mono tracking-wider">5000+</div>
              <div className="text-xs text-gray-600 font-mono">Graduados</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-700 mb-1 font-mono tracking-wider">98%</div>
              <div className="text-xs text-gray-600 font-mono">Empleabilidad</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-700 mb-1 font-mono tracking-wider">50+</div>
              <div className="text-xs text-gray-600 font-mono">Convenios</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-3 text-center border border-blue-200">
          <FaMicrochip className="w-6 h-6 mx-auto mb-2 text-blue-700" />
          <h3 className="text-lg md:text-xl font-bold mb-1.5 text-blue-900 font-mono">Únete a Nuestra Comunidad</h3>
          <p className="text-blue-800/80 mb-2 text-sm font-mono">Próxima generación de líderes informáticos</p>
          <div className="flex justify-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <FaChartLine className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">Crecimiento</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-700">
              <FaKeyboard className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">Computación</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisionVision;

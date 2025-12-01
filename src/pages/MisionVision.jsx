import React from 'react';
import { FaLightbulb, FaAward, FaUsers, FaGraduationCap, FaChartLine, FaKeyboard, FaHeart } from 'react-icons/fa';

function MisionVision() {
  return (
    <div className="px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="relative mb-4 md:mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900">Misión y Visión</h1>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">Formación tecnológica con excelencia y enfoque computacional</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Main Cards - Misión y Visión */}
        <div className="grid md:grid-cols-2 items-stretch gap-4">
          {/* Misión Card */}
          <div className="group relative bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col">
            <div className="h-1 bg-indigo-500"></div>
            <div className="relative p-4 flex-1">
            <div className="flex items-center mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-2" aria-hidden="true"></span>
              <h2 className="text-xl font-bold text-gray-900">Misión</h2>
            </div>
              <p className="text-gray-700 text-sm mb-1">
                <strong className="text-blue-800">Formar profesionales en informática y computación</strong> con liderazgo, ética y capacidad de innovación.
              </p>
              <p className="text-gray-600 text-sm">Educación superior enfocada en tecnología aplicada.</p>
              <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Calidad académica y evaluación continua</li>
                <li>Aprendizaje práctico con enfoque computacional</li>
                <li>Responsabilidad social y ética profesional</li>
              </ul>
            </div>
          </div>

          {/* Visión Card */}
          <div className="group relative bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col">
            <div className="h-1 bg-indigo-500"></div>
            <div className="relative p-4 flex-1">
              <div className="flex items-center mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-2" aria-hidden="true"></span>
                <h2 className="text-xl font-bold text-gray-900">Visión</h2>
              </div>
              <p className="text-gray-700 text-sm mb-1">
                <strong className="text-indigo-800">Ser el referente en educación informática</strong> con impacto nacional e internacional, integrando ciencia de la computación y tecnología.
              </p>
              <p className="text-gray-600 text-sm">Ecosistema de innovación tecnológica y social.</p>
              <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Vanguardia tecnológica y actualización permanente</li>
                <li>Red de colaboración académica y profesional</li>
                <li>Impacto regional con estándares internacionales</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Principios Institucionales */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 mb-6">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <h2 className="text-2xl font-bold text-gray-900">Principios Institucionales</h2>
            </div>
            <p className="text-gray-600 text-sm">Lineamientos que guían nuestra labor</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Académicos</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Calidad y evaluación permanente</li>
                <li>Actualización curricular continua</li>
                <li>Aprendizaje práctico y aplicado</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Institucionales</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Ética y responsabilidad social</li>
                <li>Servicio y compromiso público</li>
                <li>Colaboración con la comunidad</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-5 text-center border border-gray-200">
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Únete a Nuestra Comunidad</h3>
          <p className="text-gray-600 mb-2 text-sm">Próxima generación de líderes informáticos</p>
          <div className="flex justify-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <FaChartLine className="w-4 h-4" />
              <span className="text-xs font-medium">Crecimiento</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-700">
              <FaKeyboard className="w-4 h-4" />
              <span className="text-xs font-medium">Computación</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisionVision;

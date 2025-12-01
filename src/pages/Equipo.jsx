import React from 'react';
import { FaAward, FaGraduationCap } from 'react-icons/fa';
import DirectorImg from '../Imagenes/people/Director.jpg';
import AdministradorImg from '../Imagenes/people/Administrador.jpg';

function Equipo() {
  const teamMembers = [
    {
      name: "Dr. Alejando Apaza Tarqui",
      role: "Director del Instituto de Informática",
      photo: DirectorImg,
      description: "Líder en innovación educativa con más de 15 años de experiencia en formación tecnológica y gestión académica.",
      education: "Doctor en Educación",
      experience: "15+ años"
    },
    {
      name: "Ing. Joel Ramos Quispe",
      role: "Coordinador Académico",
      photo: AdministradorImg,
      description: "Especialista en coordinación académica y desarrollo de programas educativos en tecnología.",
      education: "Ingeniero en Sistemas",
      experience: "10+ años"
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative mb-4 md:mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900">Nuestro Equipo</h1>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">Profesionales comprometidos con la excelencia educativa</p>
              <div className="mt-1 text-sm md:text-base text-blue-700 font-medium">{teamMembers.length} miembros activos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Team Members - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="h-1 bg-indigo-500"></div>
              <div className="p-3">
                <div className="flex items-start space-x-4">
                  {/* Photo Section */}
                  <div className="flex-shrink-0">
                    <div className="w-36 h-36 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="w-full h-full object-cover" 
                        style={{objectPosition: 'center 20%'}} 
                      />
                    </div>
                  </div>
                  
                  {/* Information Section */}
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900 mb-1">
                      {member.name}
                    </h2>
                    <p className="text-blue-600 font-semibold text-xs mb-1">{member.role}</p>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">{member.description}</p>
                    
                    {/* Compact Credentials */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded">
                        <FaGraduationCap className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-800 font-medium">{member.education}</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded">
                        <FaAward className="w-3 h-3 text-green-600" />
                        <span className="text-green-800 font-medium">{member.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Principios Institucionales */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <h2 className="text-2xl font-bold text-gray-900">Principios Institucionales</h2>
            </div>
            <p className="text-gray-600 text-sm">Valores que guían nuestro compromiso educativo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Académicos</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Docencia de calidad y evaluación continua</li>
                <li>Excelencia académica y estándares elevados</li>
                <li>Actualización y mejora permanente</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Institucionales</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Trabajo colaborativo y servicio</li>
                <li>Apoyo integral al estudiante</li>
                <li>Responsabilidad y ética institucional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Equipo;

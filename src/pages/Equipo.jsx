import React from 'react';
import { FaChalkboardTeacher, FaUsers, FaAward, FaHandsHelping, FaGraduationCap } from 'react-icons/fa';
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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative mb-3">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-3 shadow-sm overflow-hidden">
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full ring-1 ring-blue-200 mb-1 font-mono">
                <FaUsers className="w-4 h-4" />
                <span className="text-xs font-semibold">INFO-TEAM</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-900">Nuestro Equipo</h1>
              <p className="text-xs md:text-sm text-gray-700 max-w-lg mx-auto font-mono">Profesionales comprometidos con la excelencia educativa</p>
              <div className="mt-1 text-xs text-blue-700 font-mono">{teamMembers.length} miembros activos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Team Members - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-all duration-300">
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

        {/* Compact Values Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <h2 className="text-xl font-bold text-blue-900">Nuestros Principios</h2>
            </div>
            <p className="text-gray-600 text-xs font-mono">Valores que guían nuestro compromiso educativo</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="text-center p-2.5">
              <div className="inline-flex p-2 bg-blue-50 rounded-lg mb-2">
                <FaChalkboardTeacher className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Docencia de Calidad</h3>
              <p className="text-gray-600 text-xs">
                Educación de excelencia
              </p>
            </div>
            
            <div className="text-center p-2.5">
              <div className="inline-flex p-2 bg-green-50 rounded-lg mb-2">
                <FaUsers className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Trabajo Colaborativo</h3>
              <p className="text-gray-600 text-xs">
                Ambiente de cooperación
              </p>
            </div>
            
            <div className="text-center p-2.5">
              <div className="inline-flex p-2 bg-yellow-50 rounded-lg mb-2">
                <FaAward className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Excelencia Académica</h3>
              <p className="text-gray-600 text-xs">
                Altos estándares educativos
              </p>
            </div>
            
            <div className="text-center p-2.5">
              <div className="inline-flex p-2 bg-purple-50 rounded-lg mb-2">
                <FaHandsHelping className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Apoyo Integral</h3>
              <p className="text-gray-600 text-xs">
                Desarrollo estudiantil
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Equipo;

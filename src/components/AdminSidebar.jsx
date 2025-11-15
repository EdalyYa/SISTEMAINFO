import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
 
function AdminSidebar({ onClose }) {
  // Menú principal
  const mainItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    }
  ];

  // Gestión Académica
  const academicItems = [
    {
      name: 'Programas INFOUNA',
      path: 'programas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Módulos INFOUNA',
      path: 'modulos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Cursos INFOUNA',
      path: 'cursos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253z" />
        </svg>
      )
    },
    {
      name: 'Cursos Libres',
      path: 'cursos-libres',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      name: 'Horarios INFOUNA',
      path: 'horarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Docentes INFOUNA',
      path: 'docentes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Matrículas INFOUNA',
      path: 'matriculas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  // Comunicación y Difusión
  const communicationItems = [
    {
      name: 'Modal Promocional',
      path: 'modal-promocional',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v11.586l-2-2V4a1 1 0 00-1-1H8a1 1 0 00-1 1v8.586l-2 2V4a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a1 1 0 101.414 1.414L9 12.172V19a1 1 0 001 1h4a1 1 0 001-1v-6.828l3.414 3.414a1 1 0 001.414-1.414l-4-4z" />
        </svg>
      )
    },
    {
      name: 'Biblioteca de Documentos',
      path: 'documentos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.21 0-4 1.79-4 4v4h8v-4c0-2.21-1.79-4-4-4z" />
        </svg>
      )
    },
    {
      name: 'Logros INFOUNA',
      path: 'cifras-logros',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    ,{
      name: 'Videos Informativos',
      path: 'videos-informativos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9.5l5 2.5-5 2.5v-5z" />
        </svg>
      )
    }
  ];

  const certificadosItems = [
    { 
      name: 'Reclamaciones', 
      path: 'reclamaciones', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
  ];

  const certificadosPreviewItems = [
    {
      name: 'Certificados V2',
      path: 'certificados-v2',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  // Administración (Usuarios y Configuración)
  const adminItems = [
    {
      name: 'Usuarios INFOUNA',
      path: 'users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      name: 'Configuración', 
      path: 'configuracion',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];



  const NavItem = ({ item }) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={() => onClose && onClose()}
      className={({ isActive }) =>
        `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 text-blue-700 shadow-sm border-l-2 border-blue-600' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <span className="w-5 h-5 flex-shrink-0">
        {item.icon}
      </span>
      <span className="flex-1">{item.name}</span>
    </NavLink>
  );

  const Section = ({ title, items, defaultOpen = true, first = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className={`${first ? 'mb-3 pb-2 border-b border-gray-200' : 'mt-4 pt-2 border-t border-gray-200'}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 ${first ? '' : 'mb-2'} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
        >
          <span>{title}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <nav className="space-y-0.5">
            {items.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen h-full overflow-y-auto shadow-lg lg:shadow-none">
      <div className="p-4">
        {/* Menú Principal primero */}
        <Section title="Menú Principal" items={mainItems} first defaultOpen={false} />

        {/* Luego Gestión Académica, Certificados, y Comunicación y Difusión abiertos por defecto */}
        <Section title="Gestión Académica" items={academicItems} defaultOpen />

        <Section title="Certificados" items={certificadosPreviewItems} defaultOpen />

        <Section title="Comunicación y Difusión" items={communicationItems} defaultOpen />

        {/* Resto de grupos */}
        <Section title="Reclamaciones" items={certificadosItems} defaultOpen={false} />

        <Section title="Administración" items={adminItems} defaultOpen={false} />

        {/* Footer del sidebar */}
        <div className="mt-4 pt-3 border-t border-gray-200 px-4">
          <p className="text-xs text-gray-500">
            © 2024 INFOUNA
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sistema de Gestión
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;

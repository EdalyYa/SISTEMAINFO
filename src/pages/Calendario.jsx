import React from 'react';
import CalendarioEventos from '../components/CalendarioEventos';
import { NavLink } from 'react-router-dom';

function CalendarioPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Calendario de Eventos</h1>
          <p className="text-gray-600 mt-2">Fechas clave y horarios de cursos y programas</p>
          <div className="mt-3 text-sm">
            <NavLink to="/horarios" className="text-blue-700 hover:underline">Ver tabla completa de horarios</NavLink>
          </div>
        </header>
        <CalendarioEventos />
      </section>
    </main>
  );
}

export default CalendarioPage;


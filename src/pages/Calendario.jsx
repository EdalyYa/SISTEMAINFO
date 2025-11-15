import React from 'react';
import CalendarioEventos from '../components/CalendarioEventos';
import { Link } from 'react-router-dom';
import { FaUniversity, FaCalendarAlt, FaExternalLinkAlt, FaMicrochip } from 'react-icons/fa';
import { Button } from '../components/ui';

function CalendarioPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border border-slate-800 p-4 mb-4 shadow-xl ring-1 ring-blue-300/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
          <div className="flex items-center gap-2 text-white">
            <FaMicrochip className="text-emerald-400 text-xl" />
            <FaUniversity className="text-blue-300 text-xl" />
            <h1 className="text-xl md:text-2xl font-bold">Calendario − Instituto de Informática INFOUNA</h1>
          </div>
          <p className="text-slate-200 mt-1 text-sm">Fechas clave y horarios de cursos y programas del Instituto de Informática INFOUNA.</p>
          <div className="mt-3">
            <Link to="/horarios"><Button variant="outline" size="xs" rightIcon={FaExternalLinkAlt} className="font-mono tracking-wider">Ver tabla completa de horarios</Button></Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/90 text-white font-mono tracking-wider">SCHEDULE</span>
            <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-600/90 text-white font-mono tracking-wider">UTC-5</span>
          </div>
        </div>
        <CalendarioEventos />
      </section>
    </main>
  );
}

export default CalendarioPage;

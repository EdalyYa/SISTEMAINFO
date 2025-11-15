import React from 'react';
import FAQAccordion from '../components/FAQAccordion';
import { FaUniversity, FaQuestionCircle, FaMicrochip } from 'react-icons/fa';

function FAQPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border border-slate-800 p-6 mb-6 shadow-xl ring-1 ring-blue-300/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
          <div className="flex items-center gap-3 text-white">
            <FaMicrochip className="text-emerald-400 text-2xl" />
            <FaUniversity className="text-blue-300 text-2xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Preguntas Frecuentes − INFOUNA</h1>
          </div>
          <p className="text-slate-200 mt-2">Respuestas rápidas sobre certificados, matrícula, pagos y horarios del Instituto de Informática INFOUNA.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/90 text-white font-mono tracking-wider">HELP</span>
            <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-600/90 text-white font-mono tracking-wider">FAQ</span>
          </div>
        </div>
        <FAQAccordion />
      </section>
    </main>
  );
}

export default FAQPage;

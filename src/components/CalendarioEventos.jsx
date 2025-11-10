import React, { useState } from 'react';

const eventos = [
  { fecha: '05/09/2025', titulo: 'Inicio curso Excel Básico', tipo: 'Curso' },
  { fecha: '10/09/2025', titulo: 'Charla sobre certificación digital', tipo: 'Evento' },
  { fecha: '15/09/2025', titulo: 'Inicio curso Autocad', tipo: 'Curso' },
];

function CalendarioEventos() {
  const [selected, setSelected] = useState(null);
  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Calendario de Cursos y Eventos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {eventos.map((e, i) => (
            <div key={i} className={`border rounded-xl shadow-lg p-6 cursor-pointer transition duration-300 ${selected === i ? 'bg-blue-50' : 'bg-white'}`}
              onClick={() => setSelected(i)}>
              <span className="text-xs text-gray-500 mb-2 block">{e.fecha}</span>
              <h3 className="font-semibold text-lg mb-2 text-blue-700">{e.titulo}</h3>
              <span className="text-sm text-gray-600">{e.tipo}</span>
              {selected === i && (
                <div className="mt-4 text-blue-900 animate-fade-in">
                  <b>¡No te lo pierdas!</b>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CalendarioEventos;

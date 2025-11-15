import React, { useState } from 'react';
import { FaCalendarAlt, FaBullhorn, FaLaptopCode } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Link } from 'react-router-dom';

const eventos = [
  { fecha: '05/09/2025', titulo: 'Inicio curso Excel Básico', tipo: 'Curso' },
  { fecha: '10/09/2025', titulo: 'Charla sobre certificación digital', tipo: 'Evento' },
  { fecha: '15/09/2025', titulo: 'Inicio curso Autocad', tipo: 'Curso' },
];

function getTipoConfig(tipo) {
  if (tipo === 'Curso') return {
    bg: 'from-blue-50 via-blue-100 to-indigo-50',
    ring: 'ring-blue-200',
    badge: 'bg-blue-600 text-white',
    icon: FaLaptopCode
  };
  if (tipo === 'Evento') return {
    bg: 'from-violet-50 via-fuchsia-100 to-pink-50',
    ring: 'ring-fuchsia-200',
    badge: 'bg-fuchsia-600 text-white',
    icon: FaBullhorn
  };
  return {
    bg: 'from-slate-50 via-gray-100 to-slate-50',
    ring: 'ring-gray-200',
    badge: 'bg-gray-600 text-white',
    icon: FaCalendarAlt
  };
}

function CalendarioEventos({ compact = true }) {
  const [selected, setSelected] = useState(null);
  return (
    <section className={compact ? "bg-white py-4 px-3" : "bg-white py-6 px-4"}>
      <div className="max-w-6xl mx-auto">
        <h2 className={compact ? "text-lg font-bold text-blue-900 mb-3 text-center" : "text-xl font-bold text-blue-900 mb-4 text-center"}>Calendario de Cursos y Eventos</h2>
        <div className={compact ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 w-fit mx-auto" : "grid grid-cols-1 md:grid-cols-3 gap-4 w-fit mx-auto"}>
          {eventos.map((e, i) => {
            const cfg = getTipoConfig(e.tipo);
            const Icon = cfg.icon;
            return (
              <Card
                key={i}
                className={`rounded-xl shadow-md hover:shadow-lg transition cursor-pointer ring-1 ${cfg.ring} bg-gradient-to-br ${cfg.bg}`}
                onClick={() => setSelected(i)}
              >
                <CardHeader className={compact ? "flex items-start justify-between px-2 py-1.5" : "flex items-start justify-between px-3 py-2"}>
                  <div className="flex items-center gap-2">
                    <Icon className={compact ? "text-blue-700 text-sm" : "text-blue-700"} />
                    <CardTitle className={compact ? "text-gray-900 text-xs" : "text-gray-900 text-sm"}>{e.titulo}</CardTitle>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badge}`}>{e.tipo}</span>
                </CardHeader>
                <CardContent className={compact ? "p-2" : "p-3"}>
                  <div className={compact ? "flex items-center justify-between text-[11px]" : "flex items-center justify-between text-xs"}>
                    <span className="text-gray-700">{e.fecha}</span>
                    <span className="text-gray-600">INFOUNA</span>
                  </div>
                  {selected === i && (
                    <div className={compact ? "mt-2 text-gray-900 animate-fade-in text-xs" : "mt-3 text-gray-900 animate-fade-in text-sm"}>
                      <b>¡No te lo pierdas!</b>
                    </div>
                  )}
                  <div className={compact ? "mt-2 flex items-center justify-end" : "mt-3 flex items-center justify-end"}>
                    {e.tipo === 'Curso' ? (
                      <Link to="/matricula"><Button variant="primary" size="xs">Matricúlate</Button></Link>
                    ) : (
                      <Link to="/blog"><Button variant="secondary" size="xs">Ver detalles</Button></Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CalendarioEventos;

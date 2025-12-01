import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { resolveAssetUrl } from '../utils/assetUrl';
import ExcelImg from '../Imagenes/Excel.png';
import IAImg from '../Imagenes/InteligenciaArtificial.png';
import BDImg from '../Imagenes/BasedeDatos.png';
import DefaultImg from '../Imagenes/edificio-infouna.jpg';

// Fallback local si la API no responde
const programsFallback = [
  { id: 1, title: 'Especialista en Diseño Multimedia', description: 'Dirigido a creativos que buscan dominar herramientas para el diseño multimedia', courses: [], image: DefaultImg },
  { id: 2, title: 'Especialista en Excel', description: 'Profesionales que desean mejorar sus habilidades en Excel', courses: [], image: ExcelImg },
  { id: 3, title: 'Especialista en Programación Web', description: 'Aprende a desarrollar aplicaciones web modernas y responsivas', courses: [], image: DefaultImg },
  { id: 4, title: 'Especialista en Redes y Seguridad', description: 'Formación en administración de redes y seguridad informática', courses: [], image: DefaultImg },
  { id: 5, title: 'Especialista en Inteligencia Artificial', description: 'Introducción y aplicaciones prácticas de IA y aprendizaje automático', courses: [], image: IAImg },
  { id: 6, title: 'Especialista en Bases de Datos', description: 'Diseño, administración y optimización de bases de datos', courses: [], image: BDImg },
];

function Programas() {
  const navigate = useNavigate();
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ASSET_BASE = API_BASE.replace('/api', '');
  const esImagen = (v) => /\.(png|jpe?g|webp|gif|svg)$/i.test(String(v || ''));
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    const v = String(path);
    if (v.startsWith('http')) return v;
    // Compatibilidad con datos antiguos y backend
    if (v.startsWith('/src/Imagenes') || v.includes('/uploads')) {
      return resolveAssetUrl(v);
    }
    if (esImagen(v)) {
      return resolveAssetUrl(`/uploads/programas/${v}`);
    }
    return v; // ya puede ser ruta relativa manejada por Vite
  };

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        setError("");
        const res = await fetch(`${ASSET_BASE}/admin/programas/public`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Normalizo campos a la UI actual
        const normalized = data.map(p => ({
          id: p.id,
          title: p.nombre,
          description: p.descripcion,
          courses: [],
          image: resolveImageUrl(p.imagen) || DefaultImg,
        }));
        setProgramas(normalized);
      } catch (e) {
        setError("No se pudieron cargar los programas. Mostrando datos de ejemplo.");
        setProgramas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramas();
  }, []);

  const handleDetailsClick = (id) => {
    navigate(`/programas/${id}`);
  };

  const list = programas.length ? programas : programsFallback;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-4 md:mb-6">
          <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 mb-1 justify-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Nuestros Programas</h1>
              </div>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
                Programas especializados para potenciar tu carrera profesional con cursos prácticos e instructores certificados.
              </p>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((program) => (
            <div key={program.id} className="rounded-xl border border-blue-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
              <div className="flex flex-col md:flex-row">
                {/* Imagen a un costado */}
                {program.image ? (
                  <div className="md:w-5/12 bg-white flex items-center justify-center p-2">
                    <img src={resolveImageUrl(program.image) || program.image} alt={program.title} className="w-full max-h-40 md:max-h-32 object-contain" />
                  </div>
                ) : (
                  <div className="md:w-5/12 h-36 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-blue-700 text-sm font-semibold">INFOUNA</span>
                  </div>
                )}

                {/* Información al otro costado */}
                <div className="md:w-7/12 p-3 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
                    <h3 className="text-base font-bold text-blue-900">{program.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-2 flex-grow text-sm">{program.description}</p>
                  <div className="mb-2">
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <button
                      onClick={() => handleDetailsClick(program.id)}
                      className="text-blue-700 hover:underline text-xs"
                    >
                      Ver detalles
                    </button>
                    <Link
                      to={`/programas/${program.id}`}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded text-xs shadow-sm hover:opacity-95"
                    >
                      Ver cursos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Programas;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
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
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    if (path.includes('/uploads')) {
      const fixed = path.startsWith('/') ? path : `/${path}`;
      return `${ASSET_BASE}${fixed}`;
    }
    return path; // ya puede ser ruta relativa manejada por Vite
  };

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        setError("");
        const res = await fetch('http://localhost:4001/admin/programas/public');
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
    navigate(`/detalles/${id}`);
  };

  const list = programas.length ? programas : programsFallback;

  return (
    <div className="bg-gray-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Nuestros Programas</h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Programas especializados para potenciar tu carrera profesional con cursos prácticos e instructores certificados.
          </p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((program) => (
            <div key={program.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* Imagen a un costado */}
                {program.image ? (
                  <div className="md:w-5/12 bg-white flex items-center justify-center p-2">
                    <img src={resolveImageUrl(program.image) || program.image} alt={program.title} className="w-full max-h-40 md:max-h-32 object-contain" />
                  </div>
                ) : (
                  <div className="md:w-5/12 h-36 bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center">
                    <h3 className="text-white text-base font-bold text-center px-3">{program.title}</h3>
                  </div>
                )}

                {/* Información al otro costado */}
                <div className="md:w-7/12 p-3 flex flex-col">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{program.title}</h3>
                  <p className="text-gray-700 mb-2 flex-grow text-sm">{program.description}</p>

                  <div className="mt-auto flex justify-between items-center">
                    <button
                      onClick={() => handleDetailsClick(program.id)}
                      className="text-blue-700 hover:underline text-xs"
                    >
                      Ver detalles
                    </button>
                    <Link
                      to={`/programas/${program.id}`}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                    >
                      Ver módulos
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

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Modulos() {
  const { programaId } = useParams();
  const [modules, setModules] = useState([]);
  const [programaNombre, setProgramaNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        // Cargar nombre del programa (público)
        const resPrograma = await fetch(`http://localhost:4001/admin/programas/${programaId}`);
        if (resPrograma.ok) {
          const p = await resPrograma.json();
          setProgramaNombre(p?.nombre || `#${programaId}`);
        } else {
          setProgramaNombre(`#${programaId}`);
        }

        // TODO: Reemplazar con endpoint real cuando exista:
        // GET /api/programas/:programaId/modulos
        const demo = [
          { id: 11, nombre: "Introducción", descripcion: "Fundamentos y lógica." },
          { id: 12, nombre: "Bases de Datos", descripcion: "SQL y modelado." },
          { id: 13, nombre: "Desarrollo Web", descripcion: "Frontend y backend." },
        ];
        setModules(demo);
      } catch (e) {
        setError("No se pudieron cargar los módulos. Mostrando datos de ejemplo.");
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [programaId]);

  if (loading) return <div className="p-6">Cargando módulos...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const list = modules.length ? modules : [
    { id: 11, nombre: "Introducción", descripcion: "Fundamentos y lógica." },
    { id: 12, nombre: "Bases de Datos", descripcion: "SQL y modelado." },
  ];

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <nav className="text-sm mb-4">
        <Link to="/programas" className="text-blue-600 hover:underline">
          Programas
        </Link>{" "}
        <span className="text-gray-500">/</span>{" "}
        <span className="text-gray-700">Módulos</span>
      </nav>

      <h1 className="text-2xl font-semibold mb-4">
        Módulos del programa {programaNombre}
      </h1>
      <p className="text-gray-600 mb-6">
        Selecciona un módulo para ver sus cursos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map(m => (
          <article key={m.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="text-lg font-medium">{m.nombre}</h2>
            <p className="text-gray-700 mt-2">{m.descripcion}</p>
            <div className="mt-4">
              <Link
                to={`/programas/${programaId}/modulos/${m.id}`}
                className="text-blue-600 hover:underline"
              >
                Ver cursos de este módulo
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
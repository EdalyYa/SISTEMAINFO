import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function CursosDeModulo() {
  const { programaId, moduloId } = useParams();
  const [cursos, setCursos] = useState([]);
  const [programaNombre, setProgramaNombre] = useState("");
  const [moduloNombre, setModuloNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const resPrograma = await fetch(`http://localhost:4001/admin/programas/${programaId}`);
        if (resPrograma.ok) {
          const p = await resPrograma.json();
          setProgramaNombre(p?.nombre || `#${programaId}`);
        } else {
          setProgramaNombre(`#${programaId}`);
        }

        // TODO: sustituir por endpoint real público:
        // GET /api/programas/:programaId/modulos/:moduloId/cursos
        const demoCursos = [
          { id: 101, nombre: "Curso 1", descripcion: "Contenido del curso 1." },
          { id: 102, nombre: "Curso 2", descripcion: "Contenido del curso 2." },
          { id: 103, nombre: "Curso 3", descripcion: "Contenido del curso 3." },
        ];
        setCursos(demoCursos);
        setModuloNombre(`Módulo #${moduloId}`);
      } catch (e) {
        setError("No se pudieron cargar los cursos. Mostrando datos de ejemplo.");
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [programaId, moduloId]);

  if (loading) return <div className="p-6">Cargando cursos...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const list = cursos.length ? cursos : [
    { id: 101, nombre: "Curso 1", descripcion: "Contenido del curso 1." },
    { id: 102, nombre: "Curso 2", descripcion: "Contenido del curso 2." },
  ];

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <nav className="text-sm mb-4">
        <Link to="/programas" className="text-blue-600 hover:underline">
          Programas
        </Link>{" "}
        <span className="text-gray-500">/</span>{" "}
        <Link
          to={`/programas/${programaId}`}
          className="text-blue-600 hover:underline"
        >
          Módulos
        </Link>{" "}
        <span className="text-gray-500">/</span>{" "}
        <span className="text-gray-700">Cursos</span>
      </nav>

      <h1 className="text-2xl font-semibold mb-4">
        Cursos del {moduloNombre} (programa {programaNombre})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map(c => (
          <article key={c.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="text-lg font-medium">{c.nombre}</h2>
            <p className="text-gray-700 mt-2">{c.descripcion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

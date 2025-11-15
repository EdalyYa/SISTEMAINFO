import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { FaClock, FaSearch, FaDesktop, FaUsers, FaMicrochip } from 'react-icons/fa';

function Horarios() {
  const [horariosData, setHorariosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Sin agrupación por área
  const [modalidad, setModalidad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState(''); // '', 'INFONA', 'LIBRES'
  const [programa, setPrograma] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  // Filtros separados por columna
  const [libresModalidad, setLibresModalidad] = useState('');
  const [libresHorario, setLibresHorario] = useState('');
  const [infonaModalidad, setInfonaModalidad] = useState('');
  const [infonaHorario, setInfonaHorario] = useState('');

  // Cargar horarios desde la API
  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/horarios`);
        if (!response.ok) {
          throw new Error('Error al cargar los horarios');
        }
        const data = await response.json();
        setHorariosData(data);
      } catch (error) {
        console.error('Error fetching horarios:', error);
        setError('Error al cargar los horarios. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  const handleModalidadChange = (e) => { setModalidad(e.target.value); setPage(1); };
  const handleBusquedaChange = (e) => { setBusqueda(e.target.value); setPage(1); };
  const handleTipoChange = (e) => { setTipo(e.target.value); setPage(1); };
  const handleProgramaChange = (e) => { setPrograma(e.target.value); setPage(1); };
  const handlePerPageChange = (e) => { setPerPage(Number(e.target.value)); setPage(1); };
  // Manejo de filtros por columna
  const handleLibresModalidadChange = (e) => { setLibresModalidad(e.target.value); setPage(1); };
  const handleLibresHorarioChange = (e) => { setLibresHorario(e.target.value); setPage(1); };
  const handleInfonaModalidadChange = (e) => { setInfonaModalidad(e.target.value); setPage(1); };
  const handleInfonaHorarioChange = (e) => { setInfonaHorario(e.target.value); setPage(1); };

  const getTipo = (curso) => {
    const areaStr = (curso.area || '').toUpperCase();
    const grupoStr = (curso.grupo || '').toUpperCase();
    if (grupoStr.startsWith('CL') || areaStr.includes('CURSOS LIBRES')) return 'LIBRES';
    return 'INFONA';
  };

  // Filtrar cursos
  let filteredCursos = horariosData;
  if (busqueda) {
    filteredCursos = filteredCursos.filter(curso =>
      curso.nombre_curso.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.grupo.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
  if (tipo) {
    filteredCursos = filteredCursos.filter(curso => getTipo(curso) === tipo);
  }
  // Filtro por programa (derivado del campo area). Para CL: "Cursos libres".
  const getProgramaFromArea = (area, grupo) => {
    const a = (area || '').trim();
    const g = (grupo || '').trim().toUpperCase();
    if (!a && g.startsWith('CL')) return 'Cursos libres';
    if (/^CURSOS LIBRES/i.test(a)) return 'Cursos libres';
    const m = a.match(/^AREA:\s*(.+)$/i);
    return m ? m[1].trim() : (a || '');
  };
  if (programa) {
    filteredCursos = filteredCursos.filter(
      curso => getProgramaFromArea(curso.area, curso.grupo) === programa
    );
  }

  // Separar en dos listas para la vista de dos columnas
  const cursosInfonaBase = filteredCursos.filter(c => getTipo(c) === 'INFONA');
  const cursosLibresBase = filteredCursos.filter(c => getTipo(c) === 'LIBRES');
  // Aplicar filtros separados por columna (horario y modalidad)
  const cursosLibres = cursosLibresBase
    .filter(c => (libresModalidad ? c.modalidad === libresModalidad : true))
    .filter(c => (libresHorario ? (c.dias || '').toLowerCase().includes(libresHorario.toLowerCase()) : true));
  const cursosInfona = cursosInfonaBase
    .filter(c => (infonaModalidad ? c.modalidad === infonaModalidad : true))
    .filter(c => (infonaHorario ? (c.dias || '').toLowerCase().includes(infonaHorario.toLowerCase()) : true));

  // Paginación sincronizada para ambas columnas
  const totalPagesLibres = Math.max(1, Math.ceil(cursosLibres.length / perPage));
  const totalPagesInfona = Math.max(1, Math.ceil(cursosInfona.length / perPage));
  const totalPages = Math.max(totalPagesLibres, totalPagesInfona);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pagedLibres = cursosLibres.slice(startIndex, startIndex + perPage);
  const pagedInfona = cursosInfona.slice(startIndex, startIndex + perPage);

  // Calcular estadísticas
  const totalCursos = filteredCursos.length;
  const cursosVirtuales = filteredCursos.filter(curso => curso.modalidad === 'VIRTUAL').length;
  const cursosPresenciales = filteredCursos.filter(curso => curso.modalidad === 'PRESENCIAL').length;

  // Lista de programas disponibles para el filtro
  const programasDisponibles = Array.from(new Set(
    horariosData
      .map(h => getProgramaFromArea(h.area, h.grupo))
      .filter(p => p && p.length > 0)
  )).sort((a, b) => a.localeCompare(b));

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="relative mb-3 rounded-xl overflow-hidden bg-gradient-to-r from-white to-blue-50 border border-blue-100 p-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <FaMicrochip className="text-blue-700" />
            <h1 className="text-xl md:text-2xl font-bold text-blue-900">Horarios de Cursos</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">Total: {totalCursos}</span>
            <span className="inline-flex px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-green-50 text-green-700 ring-1 ring-green-200">Virtual: {cursosVirtuales}</span>
            <span className="inline-flex px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200">Presencial: {cursosPresenciales}</span>
          </div>
        </div>
      </div>

      {/* Filtros generales: búsqueda y programa (aplican a ambas columnas) */}
      <div className="bg-white rounded-lg p-2 mb-2 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          <div className="relative w-full sm:w-64">
            <select
              value={programa}
              onChange={handleProgramaChange}
              className="pl-3 pr-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              aria-label="Filtrar por programa"
            >
              <option value="">Todos los programas</option>
              {programasDisponibles.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm" />
            <input
              type="text"
              value={busqueda}
              onChange={handleBusquedaChange}
              placeholder="Buscar curso o grupo..."
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Dos columnas: izquierda Libres, derecha INFONA. Solo Curso, Horario, Modalidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Columna: Cursos libres */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border-l-4 border-purple-300">
          <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-purple-800">
            <span className="inline-flex items-center gap-1">Cursos libres</span>
            <span className="inline-flex px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-semibold">{cursosLibres.length}</span>
          </div>
          {/* Filtros columna Libres */}
          <div className="px-3 py-1 flex flex-col sm:flex-row gap-2 items-stretch">
            <select
              value={libresModalidad}
              onChange={handleLibresModalidadChange}
              className="pl-3 pr-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              aria-label="Filtrar modalidad libres"
            >
              <option value="">Todas</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
            </select>
            <input
              type="text"
              value={libresHorario}
              onChange={handleLibresHorarioChange}
              placeholder="Filtrar horario libres..."
              className="pl-3 pr-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400 flex-1"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-semibold uppercase">Curso</th>
                  <th className="px-2 py-1 text-left text-xs font-semibold uppercase">Horario</th>
                  <th className="px-2 py-1 text-left text-xs font-semibold uppercase">Modalidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedLibres.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-2 py-4 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <FaSearch className="text-3xl text-gray-300" />
                        <p>No hay cursos libres con los filtros seleccionados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedLibres.map((curso, index) => (
                    <tr key={`CL-${curso.id}`} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{curso.nombre_curso}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{curso.dias}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                          curso.modalidad === 'VIRTUAL' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {curso.modalidad === 'VIRTUAL' ? <FaDesktop className="mr-1 text-xs" /> : <FaUsers className="mr-1 text-xs" />}
                          {curso.modalidad}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna: Cursos INFONA */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border-l-4 border-blue-300">
          <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-blue-800">
            <span className="inline-flex items-center gap-1">Cursos INFONA</span>
            <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">{cursosInfona.length}</span>
          </div>
          {/* Filtros columna INFONA */}
          <div className="px-3 py-1 flex flex-col sm:flex-row gap-2 items-stretch">
            <select
              value={infonaModalidad}
              onChange={handleInfonaModalidadChange}
              className="pl-3 pr-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              aria-label="Filtrar modalidad INFONA"
            >
              <option value="">Todas</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
            </select>
            <input
              type="text"
              value={infonaHorario}
              onChange={handleInfonaHorarioChange}
              placeholder="Filtrar horario INFONA..."
              className="pl-3 pr-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400 flex-1"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-semibold uppercase">Curso</th>
                  <th className="px-2 py-1 text-left text-xs font-semibold uppercase">Horario</th>
                  <th className="px-2 py-1 text-left text-xs font-semibold uppercase">Modalidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedInfona.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-2 py-4 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <FaSearch className="text-3xl text-gray-300" />
                        <p>No hay cursos INFONA con los filtros seleccionados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedInfona.map((curso, index) => (
                    <tr key={`INF-${curso.id}`} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{curso.nombre_curso}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{curso.dias}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                          curso.modalidad === 'VIRTUAL' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {curso.modalidad === 'VIRTUAL' ? <FaDesktop className="mr-1 text-xs" /> : <FaUsers className="mr-1 text-xs" />}
                          {curso.modalidad}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Controles: cursos por página y paginación */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Cursos por página</label>
          <select
            value={perPage}
            onChange={handlePerPageChange}
            className="pl-3 pr-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            aria-label="Cursos por página"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={`text-xs px-2 py-1 rounded ${currentPage <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 shadow-sm'}`}
          >Anterior</button>
          <span className="text-xs text-gray-700">Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className={`text-xs px-2 py-1 rounded ${currentPage >= totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 shadow-sm'}`}
          >Siguiente</button>
        </div>
      </div>

      {/* Resumen compacto eliminado para reducir espacios */}
    </section>
  );
};

export default Horarios;

import { useEffect, useState } from "react";
import { API_BASE, API_HOST } from "../config/api";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { resolveAssetUrl } from "../utils/assetUrl";
import { FaClock, FaUser, FaBookOpen, FaGraduationCap, FaMoneyBillWave, FaTimes, FaFacebookF, FaTiktok, FaWhatsapp, FaEnvelope, FaLink } from 'react-icons/fa';
import infoLogo from "../logo.png";
import { Card, CardContent, Button } from "../components/ui";

export default function Modulos() {
  const { programaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [programaNombre, setProgramaNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [programaDescripcion, setProgramaDescripcion] = useState("");
  const [programaImagen, setProgramaImagen] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const esImagen = (v) => /(png|jpe?g|webp|gif|svg)$/i.test(String(v || "").split(".").pop());
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== "string") return null;
    const v = String(path);
    if (v.startsWith("http")) return v;
    if (v.includes("/uploads") || v.includes("/src/Imagenes")) {
      return resolveAssetUrl(v);
    }
    if (esImagen(v)) {
      return resolveAssetUrl(`/uploads/cursos/${v}`);
    }
    return null;
  };

  const normalize = (val) => (val || "")
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const displayModality = (m) => {
    const n = normalize(m);
    if (n === 'virtual') return 'Virtual';
    if (n === 'presencial') return 'Presencial';
    return m || 'Otro';
  };

  const displayLevel = (l) => {
    const n = normalize(l);
    if (n === 'basico') return 'Básico';
    if (n === 'intermedio') return 'Intermedio';
    if (n === 'avanzado') return 'Avanzado';
    return l || 'Nivel';
  };

  const formatPrice = (v) => {
    const num = Number(v);
    if (!num || num <= 0) return 'Consultar precio';
    return `$${num.toFixed(2)}`;
  };

  const buildWhatsAppUrl = (course) => {
    const phone = '51970709787';
    const msg = `Hola INFOUNA, me interesa el curso "${course?.name || ''}" del programa "${course?.program || ''}". ¿Podrían brindarme más información sobre fechas, modalidad y matrícula?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    return url;
  };

  const shareCourse = (course) => {
    const basePath = course?.programId ? `/programas/${course.programId}` : '/cursos';
    const deep = course?.id ? `${basePath}?cursoId=${course.id}` : basePath;
    const url = window.location.origin + deep;
    const text = `Mira este curso: ${course?.name || ''} en INFOUNA`;
    if (navigator.share) {
      navigator.share({ title: course?.name || 'Curso INFOUNA', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    }
  };

  const getShareLinks = (course) => {
    const basePath = course?.programId ? `/programas/${course.programId}` : '/cursos';
    const deep = course?.id ? `${basePath}?cursoId=${course.id}` : basePath;
    const baseUrl = window.location.origin + deep;
    const text = `Curso: ${course?.name || ''} | Programa: ${course?.program || ''} \n ${baseUrl}`;
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(`Curso INFOUNA: ${course?.name || ''}`)}&body=${encodeURIComponent(text)}`,
      tiktokCopy: `${text}`,
    };
  };

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const resProgramas = await fetch(`${API_HOST}/admin/programas/public`);
        if (resProgramas.ok) {
          const arr = await resProgramas.json();
          const p = Array.isArray(arr) ? arr.find(x => String(x.id) === String(programaId)) : null;
          setProgramaNombre(p?.nombre || `#${programaId}`);
          setProgramaDescripcion(p?.descripcion || "");
          const img = p?.imagen ? (String(p.imagen).startsWith("http") ? p.imagen : resolveAssetUrl(p.imagen)) : null;
          setProgramaImagen(img);
        } else {
          setProgramaNombre(`#${programaId}`);
          setProgramaDescripcion("");
          setProgramaImagen(null);
        }

        const resCursos = await fetch(`${API_BASE}/cursos`);
        if (resCursos.ok) {
          const all = await resCursos.json();
          const filtered = all.filter((c) => String(c.programa_id) === String(programaId));
          const normalized = filtered.map((curso) => {
            const rawImage = curso.icono || curso.imagen;
            return {
              id: curso.id,
              nombre: curso.nombre,
              descripcion: curso.descripcion || "",
              modalidad: curso.modalidad || "",
              duracion: curso.duracion || "",
              horario: curso.horario || "",
              nivel: curso.nivel || "",
              precio: curso.precio || 0,
              imagen: resolveImageUrl(rawImage),
            };
          });
          setCursos(normalized);
        } else {
          setCursos([]);
        }
      } catch (e) {
        setError("No se pudieron cargar los cursos. Inténtalo más tarde.");
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [programaId]);

  useEffect(() => {
    try {
      if (loading) return;
      const params = new URLSearchParams(location.search);
      const idParam = params.get('cursoId');
      if (!idParam) return;
      const found = cursos.find(c => String(c.id) === String(idParam));
      if (found) {
        setSelectedCourse({
          id: found.id,
          name: found.nombre,
          program: programaNombre,
          modality: displayModality(found.modalidad),
          schedule: found.horario || 'Por definir',
          duration: found.duracion || 'Por definir',
          instructor: found.instructor || 'Por asignar',
          level: displayLevel(found.nivel || 'Básico'),
          price: found.precio || 0,
          description: found.descripcion || '',
          image: found.imagen || programaImagen || infoLogo,
          programId: programaId,
        });
        setIsModalOpen(true);
      }
    } catch (_) {}
  }, [loading, location.search, cursos, programaNombre, programaImagen, programaId]);

  if (loading) return <div className="p-6">Cargando cursos...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <div className="text-sm mb-4 flex items-center gap-3">
        <Link to="/programas" className="text-blue-600 hover:underline">Programas</Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-700">Cursos</span>
        <Button size="xs" className="ml-auto" onClick={() => navigate("/cursos")}>← Volver a todos los cursos</Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 border border-blue-100 p-6 mb-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
        <div className="absolute -right-12 -top-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-60"></div>
        <div className="flex items-center gap-6">
          {programaImagen && (
            <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-blue-200 shadow-sm bg-white">
              <img src={programaImagen} alt={programaNombre} className="w-full h-full object-contain" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Cursos del programa {programaNombre}</h1>
            <p className="text-sm md:text-base text-gray-700 mt-2">
              {programaDescripcion || "Formación práctica con enfoque profesional para impulsar tu carrera."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">{cursos.length} cursos disponibles</span>
              <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-600/90 text-white">Certificación INFOUNA</span>
              <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-yellow-500/90 text-white">Inicio: pronto</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link to="/matricula" className="inline-flex px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm text-xs md:text-sm">Matricúlate</Link>
              <Link to="/horarios" className="inline-flex px-4 py-2 rounded-lg text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 text-xs md:text-sm">Ver horarios</Link>
            </div>
          </div>
        </div>
      </div>

      {cursos.length === 0 ? (
        <div className="p-6 bg-white border rounded">No hay cursos disponibles para este programa.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos.map((c) => (
            <Card key={c.id} className="group rounded-2xl overflow-hidden hover:shadow-md transition hover:-translate-y-0.5">
              {c.imagen ? (
                <div className="relative h-40 bg-gray-100">
                  <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute left-3 bottom-3 flex flex-wrap gap-2">
                    {c.modalidad && <span className="inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full bg-white/80 text-gray-900 backdrop-blur ring-1 ring-white/70">{c.modalidad}</span>}
                    {c.duracion && <span className="inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full bg-white/80 text-gray-900 backdrop-blur ring-1 ring-white/70">{c.duracion}</span>}
                  </div>
                </div>
              ) : null}
              <CardContent>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">{c.nombre}</h2>
                {c.descripcion && <p className="text-gray-700 text-sm mt-1 line-clamp-2">{c.descripcion}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {c.horario && <div className="flex items-center gap-1"><FaClock className="text-blue-600" /><span>{c.horario}</span></div>}
                  {c.nivel && <div className="flex items-center gap-1"><FaGraduationCap className="text-indigo-600" /><span>{displayLevel(c.nivel)}</span></div>}
                  {c.modalidad && <div className="flex items-center gap-1"><FaBookOpen className="text-emerald-600" /><span>{displayModality(c.modalidad)}</span></div>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold">
                    <FaMoneyBillWave />
                    <span>{c.precio ? `$${c.precio}` : 'Consultar precio'}</span>
                  </div>
                  <Button size="sm"
                    onClick={() => {
                      setSelectedCourse({
                        id: c.id,
                        name: c.nombre,
                        program: programaNombre,
                        modality: displayModality(c.modalidad),
                        schedule: c.horario || 'Por definir',
                        duration: c.duracion || 'Por definir',
                        instructor: c.instructor || 'Por asignar',
                        level: displayLevel(c.nivel || 'Básico'),
                        price: c.precio || 0,
                        description: c.descripcion || '',
                        image: c.imagen || programaImagen || infoLogo,
                        programId: programaId,
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      

      
      
      
      

      
      
      
      
      
      

      
      
      

      
      
      
      
      
      
      
      

      
      
      
      
      

      
      
      
      
      
      

      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      

      
      
      

      
      
      

      
      
      

      
      
      

      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      

      
      
      
      
      
      

      
      
      
      

      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      

      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      
      
      
      

      
      
      

      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      

      
      
      
      
      
      

      
      
      

      
      
      

      
      
      
      
      
      
      

      
      
      
      
      
      

      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-gray-700 hover:bg-white">
              <FaTimes />
            </button>
            <div className="relative h-64 md:h-72 bg-gray-100">
              {selectedCourse.image && (
                <img src={selectedCourse.image} alt={selectedCourse.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow">{selectedCourse.name}</h2>
                <p className="text-white/90 text-sm mt-1">{selectedCourse.program}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCourse.modality && <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-indigo-500/90 text-white">{selectedCourse.modality}</span>}
                  {selectedCourse.level && <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/90 text-white">{selectedCourse.level}</span>}
                  <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-600/90 text-white">Certificación INFOUNA</span>
                  <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-yellow-500/90 text-white">Inicio: pronto</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {selectedCourse.description && (
                <p className="text-gray-700">{selectedCourse.description}</p>
              )}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Qué aprenderás</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Competencias prácticas aplicables al trabajo</li>
                    <li>Proyectos guiados para consolidar habilidades</li>
                    <li>Buenas prácticas y metodología moderna</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Beneficios</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Certificación respaldada por la UNA</li>
                    <li>Acompañamiento y soporte académico</li>
                    <li>Oportunidades para continuidad de estudios</li>
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700"><FaBookOpen className="text-blue-600" /> <span>Modalidad:</span> <span className="font-medium">{selectedCourse.modality}</span></div>
                <div className="flex items-center gap-2 text-gray-700"><FaClock className="text-blue-600" /> <span>Duración:</span> <span className="font-medium">{selectedCourse.duration || 'Por definir'}</span></div>
                <div className="flex items-center gap-2 text-gray-700"><FaClock className="text-blue-600" /> <span>Horario:</span> <span className="font-medium">{selectedCourse.schedule || 'Por definir'}</span></div>
                <div className="flex items-center gap-2 text-gray-700"><FaUser className="text-blue-600" /> <span>Instructor:</span> <span className="font-medium">{selectedCourse.instructor || 'Por asignar'}</span></div>
                <div className="flex items-center gap-2 text-gray-700"><FaGraduationCap className="text-blue-600" /> <span>Nivel:</span> <span className="font-medium">{selectedCourse.level}</span></div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
                  <FaMoneyBillWave />
                  <span className="text-lg font-bold">{formatPrice(selectedCourse.price)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={buildWhatsAppUrl(selectedCourse)} target="_blank" rel="noreferrer" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Solicitar información</a>
                  <Link to="/matricula" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Matricúlate</Link>
                  <Link to="/horarios" className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm hover:bg-blue-50">Ver horarios</Link>
                  <button onClick={() => setIsShareOpen(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Compartir</button>
                </div>
              </div>
            </div>
          </div>
          {isShareOpen && selectedCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0" onClick={() => setIsShareOpen(false)}></div>
              <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-gray-200">
                <div className="h-1 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 mb-3"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-900">Compartir curso</div>
                  <button onClick={() => setIsShareOpen(false)} className="text-gray-600 hover:text-gray-800"><FaTimes /></button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {(() => {
                    const links = getShareLinks(selectedCourse);
                    return (
                      <>
                        <a href={links.facebook} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white shadow"><FaFacebookF /></div>
                          <span className="text-xs text-gray-700">Facebook</span>
                        </a>
                        <button onClick={() => { navigator.clipboard.writeText(links.tiktokCopy); }} className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white shadow"><FaTiktok /></div>
                          <span className="text-xs text-gray-700">TikTok</span>
                        </button>
                        <a href={links.whatsapp} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white shadow"><FaWhatsapp /></div>
                          <span className="text-xs text-gray-700">WhatsApp</span>
                        </a>
                        <a href={links.email} className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500 text-white shadow"><FaEnvelope /></div>
                          <span className="text-xs text-gray-700">Correo</span>
                        </a>
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => { shareCourse(selectedCourse); }} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  <FaLink />
                  Copiar enlace
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

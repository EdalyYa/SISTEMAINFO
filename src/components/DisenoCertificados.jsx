import React, { useState, useEffect } from 'react';
import { API_BASE } from '@/config/api';
import { ASSET_BASE } from '@/config/api';
import { 
  Palette, 
  Upload, 
  Save, 
  Eye, 
  RotateCcw,
  Image as ImageIcon,
  Settings,
  Download,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const DisenoCertificados = ({ onClose, datosEstudiante, onCertificadoGuardado, initialSelectedElement, pdfUrl, onlyPDF }) => {
  // Helper para resolver URLs de fondo desde backend
  const resolveAssetUrl = (url) => {
    if (!url) return null;
    const s = String(url);
    if (s.startsWith('http') || s.startsWith('data:')) return s;
    // Evitar doble slash
    return `${ASSET_BASE}${s.startsWith('/') ? s : `/${s}`}`;
  };

  // Fetch con token y manejo 401
  const authedFetch = async (input, init = {}) => {
    const token = (typeof window !== 'undefined' && window.sessionStorage.getItem('token')) || localStorage.getItem('token');
    const headers = { ...(init.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(input, { ...init, headers });
    if (resp.status === 401) {
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('token');
        }
      } catch (_) {}
      localStorage.removeItem('token');
      window.location.href = '/panel/login';
      throw new Error('No autorizado. Redirigiendo a inicio de sesión.');
    }
    return resp;
  };
  // Configuración por defecto para garantizar que siempre existen las claves
  const DEFAULT_CONFIG = {
    nombreInstituto: { x: 400, y: 120, fontSize: 18, color: '#000000', fontFamily: 'serif', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    titulo: { x: 400, y: 200, fontSize: 32, color: '#000000', fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'normal', visible: true },
    otorgado: { x: 400, y: 250, fontSize: 16, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    nombreEstudiante: { x: 400, y: 280, fontSize: 24, color: '#000000', fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'normal', visible: true },
    descripcion: { x: 400, y: 350, fontSize: 16, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    // Nuevos campos compatibles con tu JSON
    rolParticipacion: { x: 300, y: 330, fontSize: 14, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'bold', fontStyle: 'normal', visible: true },
    eventoDetalle: { x: 420, y: 360, fontSize: 14, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    periodoHoras: { x: 180, y: 388, fontSize: 14, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    fecha: { x: 400, y: 450, fontSize: 14, color: '#000000', fontFamily: 'sans-serif', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    codigo: { x: 400, y: 500, fontSize: 12, color: '#666666', fontFamily: 'monospace', fontWeight: 'normal', fontStyle: 'normal', visible: true },
    firmaIzquierda: { x: 200, y: 550, width: 150, height: 80 },
    firmaDerecha: { x: 550, y: 550, width: 150, height: 80 },
    qr: { x: 650, y: 450, width: 80, height: 80, visible: true }
  };

  // Renderiza el área principal según modo de vista previa
  const renderArea = () => {
    if (previsualizacion) {
      return (
                <div className="flex flex-col items-center h-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Vista Previa del Certificado</h2>
                    <p className="text-gray-600 text-center">Así se verá el certificado final</p>
                  </div>
                  <div 
                    className="relative bg-white border-2 border-gray-300 shadow-lg overflow-hidden"
                    style={{ width: '800px', height: '600px', transform: `scale(${0.8 * zoom})`, transformOrigin: 'top center' }}
                  >
                    {/* Fondo: PDF si existe, sino imagen de plantilla, sino gris */}
                    {pdfUrl ? (
                      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                        <object
                          data={pdfUrl}
                          type="application/pdf"
                          className="w-full h-full"
                          title="Vista previa completa del certificado"
                        />
                      </div>
                    ) : (configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado) ? (
                      <img
                        src={resolveAssetUrl(configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado)}
                        alt="Fondo del certificado"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ zIndex: 0 }}
                        onError={(e) => {
                          const badUrl = configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado;
                          console.error('[CertEditor] Error cargando fondo:', badUrl, '→', e?.target?.src);
                          setConfiguracionActual(prev => ({ ...prev, fondoCertificado: null }));
                        }}
                      />
                    ) : (
                      // Sin fondo por defecto: mantener fondo limpio en blanco
                      <div
                        className="absolute inset-0 bg-white"
                        style={{ zIndex: 0 }}
                      />
                    )}
    
                    {/* Logos removidos por deprecación */}

                    {/* Firmas */}
                    <div
                      className="absolute flex flex-col items-center justify-end"
                      style={{
                        left: configuracionActual.configuracion.firmaIzquierda.x,
                        top: configuracionActual.configuracion.firmaIzquierda.y,
                        width: configuracionActual.configuracion.firmaIzquierda.width,
                        height: configuracionActual.configuracion.firmaIzquierda.height,
                        zIndex: 10
                      }}
                    >
                      <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                      <div className="text-xs text-center font-medium">Director</div>
                    </div>
                    <div
                      className="absolute flex flex-col items-center justify-end"
                      style={{
                        left: configuracionActual.configuracion.firmaDerecha.x,
                        top: configuracionActual.configuracion.firmaDerecha.y,
                        width: configuracionActual.configuracion.firmaDerecha.width,
                        height: configuracionActual.configuracion.firmaDerecha.height,
                        zIndex: 10
                      }}
                    >
                      <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                      <div className="text-xs text-center font-medium">Coordinador</div>
                    </div>
    
                    {/* QR */}
                    {configuracionActual.configuracion.qr.visible && (
                      <div
                        className="absolute border border-gray-300 bg-white text-gray-600 text-xs"
                        style={{
                          left: configuracionActual.configuracion.qr.x,
                          top: configuracionActual.configuracion.qr.y,
                          width: configuracionActual.configuracion.qr.width,
                          height: configuracionActual.configuracion.qr.height,
                          zIndex: 10
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          QR<br/>Code
                        </div>
                      </div>
                    )}
    
                    {/* Textos */}
                    {Object.keys(TEXT_KEYS).map((key) => {
                      const cfg = configuracionActual.configuracion[key];
                      if (!cfg || cfg.visible === false) return null;
                      return (
                        <div
                          key={key}
                          className="absolute text-center"
                          style={{ left: cfg.x, top: cfg.y, zIndex: 10, transform: 'translateX(-50%)' }}
                        >
                          <span
                            style={{
                              fontSize: `${cfg.fontSize}px`,
                              fontFamily: cfg.fontFamily || 'Inter, system-ui, sans-serif',
                              fontWeight: cfg.fontWeight || 400,
                              fontStyle: cfg.fontStyle || 'normal',
                              color: cfg.color || '#111827'
                            }}
                          >
                            {getTextValue(key)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
      );
    }
    return (
                <div
                  className="h-full border-2 border-dashed border-gray-300 rounded-lg relative bg-gray-50 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Área fija centrada 800x600 */}
                  <div
                    className="absolute top-1/2 left-1/2"
                    style={{ width: 800, height: 600, transform: 'translate(-50%, -50%)', zIndex: 0 }}
                  >
                    <div className="relative w-full h-full">
                      {/* Fondo: PDF si hay, si no imagen de plantilla, si no gris */}
                      {pdfUrl ? (
                        <object
                          data={pdfUrl}
                          type="application/pdf"
                          className="w-full h-full"
                          title="Vista completa del certificado"
                        />
                      ) : (configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado) ? (
                        <img
                          src={resolveAssetUrl(configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado)}
                          alt="Fondo del certificado"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const badUrl = configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado;
                            console.error('[CertEditor] Error cargando fondo:', badUrl, '→', e?.target?.src);
                            setConfiguracionActual(prev => ({ ...prev, fondoCertificado: null }));
                          }}
                        />
                      ) : (
                        // Mantener fondo en blanco si no hay imagen configurada
                        <div
                          className="absolute inset-0 bg-white"
                          style={{ zIndex: 0 }}
                        />
                      )}
    
                      {/* Logos removidos por deprecación */}
    
                      {/* Firmas arrastrables */}
                      <div
                        className="absolute border border-green-400 bg-white bg-opacity-80 cursor-move"
                        style={{
                          left: configuracionActual.configuracion.firmaIzquierda.x,
                          top: configuracionActual.configuracion.firmaIzquierda.y,
                          width: configuracionActual.configuracion.firmaIzquierda.width,
                          height: configuracionActual.configuracion.firmaIzquierda.height
                        }}
                        draggable={!editTextsOnly}
                        onDragStart={(e) => { if (!editTextsOnly) handleDragStart(e, 'firmaIzquierda'); }}
                        onClick={() => { if (!editTextsOnly) handleElementClick('firmaIzquierda'); }}
                      >
                        <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                        <div className="text-xs text-center font-medium">Director</div>
                      </div>
                      <div
                        className="absolute border border-yellow-400 bg-white bg-opacity-80 cursor-move"
                        style={{
                          left: configuracionActual.configuracion.firmaDerecha.x,
                          top: configuracionActual.configuracion.firmaDerecha.y,
                          width: configuracionActual.configuracion.firmaDerecha.width,
                          height: configuracionActual.configuracion.firmaDerecha.height
                        }}
                        draggable={!editTextsOnly}
                        onDragStart={(e) => { if (!editTextsOnly) handleDragStart(e, 'firmaDerecha'); }}
                        onClick={() => { if (!editTextsOnly) handleElementClick('firmaDerecha'); }}
                      >
                        <div className="border-t-2 border-gray-800 w-full mb-1"></div>
                        <div className="text-xs text-center font-medium">Coordinador</div>
                      </div>
    
                      {/* QR */}
                      {configuracionActual.configuracion.qr.visible && (
                        <div
                          className="absolute border border-gray-400 bg-white bg-opacity-80"
                          style={{
                            left: configuracionActual.configuracion.qr.x,
                            top: configuracionActual.configuracion.qr.y,
                            width: configuracionActual.configuracion.qr.width,
                            height: configuracionActual.configuracion.qr.height
                          }}
                          draggable={!editTextsOnly}
                          onDragStart={(e) => { if (!editTextsOnly) handleDragStart(e, 'qr'); }}
                          onClick={() => { if (!editTextsOnly) handleElementClick('qr'); }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                            QR<br/>Code
                          </div>
                        </div>
                      )}
    
                      {/* Textos editables */}
                      {Object.keys(TEXT_KEYS).map((key) => {
                        const cfg = configuracionActual.configuracion[key];
                        if (!cfg || cfg.visible === false) return null;
                        return (
                          <div
                            key={key}
                            className="absolute border border-purple-400 bg-white bg-opacity-80 cursor-move"
                            style={{ left: cfg.x, top: cfg.y, transform: 'translateX(-50%)' }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, key)}
                            onClick={() => handleElementClick(key)}
                          >
                            <span
                              style={{
                                fontSize: `${cfg.fontSize}px`,
                                fontFamily: cfg.fontFamily || 'Inter, system-ui, sans-serif',
                                fontWeight: cfg.fontWeight || 400,
                                fontStyle: cfg.fontStyle || 'normal',
                                color: cfg.color || '#111827'
                              }}
                            >
                              {getTextValue(key)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
    
                    {/* Indicadores de ayuda */}
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 text-xs text-gray-600 shadow-lg">
                      <div className="font-medium text-gray-800 mb-2">Controles:</div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Arrastra para mover</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <span>Click para seleccionar y editar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Vista Previa para ver resultado</span>
                      </div>
                    </div>
                  </div>
                </div>
    );
  };

  const normalizeConfig = (configObj) => {
    try {
      const rawCfg = (configObj?.campos_json ?? configObj?.configuracion);
      const incoming = typeof rawCfg === 'string' ? JSON.parse(rawCfg) : (rawCfg || {});
      // Resolver imagen de fondo desde posibles orígenes
      let fondoCertificadoResolved = configObj?.fondoCertificado || configObj?.fondo_url || configObj?.fondo_certificado || null;
      if (typeof fondoCertificadoResolved === 'string') {
        const s = String(fondoCertificadoResolved);
        if (s.startsWith('http') || s.startsWith('data:') || s.startsWith('/uploads/')) {
          fondoCertificadoResolved = s;
        } else if (s.trim().length > 0) {
          fondoCertificadoResolved = `/uploads/certificados/${s.replace(/^\/+/, '')}`;
        } else {
          fondoCertificadoResolved = null;
        }
      }
      const cfg = {
        nombreInstituto: { ...DEFAULT_CONFIG.nombreInstituto, ...(incoming.nombreInstituto || {}) },
        titulo: { ...DEFAULT_CONFIG.titulo, ...(incoming.titulo || {}) },
        otorgado: { ...DEFAULT_CONFIG.otorgado, ...(incoming.otorgado || {}) },
        nombreEstudiante: { ...DEFAULT_CONFIG.nombreEstudiante, ...(incoming.nombreEstudiante || {}) },
        descripcion: { ...DEFAULT_CONFIG.descripcion, ...(incoming.descripcion || {}) },
        rolParticipacion: { ...DEFAULT_CONFIG.rolParticipacion, ...(incoming.rolParticipacion || {}) },
        eventoDetalle: { ...DEFAULT_CONFIG.eventoDetalle, ...(incoming.eventoDetalle || {}) },
        periodoHoras: { ...DEFAULT_CONFIG.periodoHoras, ...(incoming.periodoHoras || {}) },
        fecha: { ...DEFAULT_CONFIG.fecha, ...(incoming.fecha || {}) },
        codigo: { ...DEFAULT_CONFIG.codigo, ...(incoming.codigo || {}) },
        firmaIzquierda: { ...DEFAULT_CONFIG.firmaIzquierda, ...(incoming.firmaIzquierda || {}) },
        firmaDerecha: { ...DEFAULT_CONFIG.firmaDerecha, ...(incoming.firmaDerecha || {}) },
        qr: { ...DEFAULT_CONFIG.qr, ...(incoming.qr || {}) }
      };
      // Asegurar visibilidad por defecto en textos (true si no está definida)
      Object.keys(cfg).forEach((k) => {
        if (k === 'firmaIzquierda' || k === 'firmaDerecha') return;
        const v = cfg[k];
        if (typeof v.visible === 'undefined') {
          v.visible = (k === 'qr' && typeof configObj?.incluye_qr !== 'undefined') ? !!configObj.incluye_qr : true;
        } else {
          v.visible = !!v.visible;
        }
      });
      return {
        ...configObj,
        configuracion: cfg,
        fondoCertificado: fondoCertificadoResolved
      };
    } catch (e) {
      return {
        ...configObj,
        configuracion: DEFAULT_CONFIG
      };
    }
  };
  const [configuraciones, setConfiguraciones] = useState([]);
  const [configuracionActual, setConfiguracionActual] = useState({
    nombre: '',
    configuracion: DEFAULT_CONFIG,
    fondoCertificado: null,
    activa: false
  });
  const [certificadoEjemplo, setCertificadoEjemplo] = useState(null);
  const [datosActuales, setDatosActuales] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null);
  // Controles avanzados de edición
  const [showRulers, setShowRulers] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10); // px
  const [zoom, setZoom] = useState(1); // 1 = 100%
  // Posicionamiento asistido
  const [assistedMode, setAssistedMode] = useState(false);
  const [baselineGuides, setBaselineGuides] = useState([]); // líneas Y para alinear textos
  const [snapToGuides, setSnapToGuides] = useState(true);
  const snapThreshold = 6; // px
  const [localOnlyPDF, setLocalOnlyPDF] = useState(onlyPDF);
  // Modo de edición: solo permitir mover/editar textos
  const [editTextsOnly, setEditTextsOnly] = useState(true);
  const isTextElement = (key) => !['firmaIzquierda', 'firmaDerecha', 'qr'].includes(key);
  // Visibilidad de textos (para plantillas que ya tienen textos impresos)
  const TEXT_KEYS = {
    nombreInstituto: 'Nombre del Instituto',
    titulo: 'Título (CERTIFICADO)',
    otorgado: 'Etiqueta “Otorgado a”',
    nombreEstudiante: 'Nombre del Estudiante',
    descripcion: 'Descripción (motivo)',
    rolParticipacion: 'Rol de participación',
    eventoDetalle: 'Detalle del evento',
    periodoHoras: 'Periodo y horas',
    fecha: 'Fecha',
    codigo: 'Código de verificación'
  };
  const [visibleTextElements, setVisibleTextElements] = useState({
    nombreInstituto: true,
    titulo: true,
    otorgado: true,
    nombreEstudiante: true,
    descripcion: true,
    rolParticipacion: true,
    eventoDetalle: true,
    periodoHoras: true,
    fecha: true,
    codigo: true
  });

  // Log de diagnóstico para la URL del fondo
  useEffect(() => {
    const src = configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado;
    if (src) {
      const resolved = resolveAssetUrl(src);
      console.log('[CertEditor] Fondo configurado:', src, '→ Resuelto:', resolved);
    } else {
      console.log('[CertEditor] Sin imagen de fondo configurada.');
    }
  }, [configuracionActual.fondoCertificado, configuracionActual.fondoCertificadoPreview]);

  // Sincronizar visibilidad con la configuración cargada
  useEffect(() => {
    if (!configuracionActual?.configuracion) return;
    const next = {};
    Object.keys(TEXT_KEYS).forEach((k) => {
      const cfg = configuracionActual.configuracion[k];
      next[k] = cfg && typeof cfg.visible !== 'undefined' ? !!cfg.visible : true;
    });
    setVisibleTextElements(next);
  }, [configuracionActual]);

  // Texto por defecto usando datos cuando existan
  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return ''; }
  };
  const getTextValue = (key) => {
    const d = datosActuales || certificadoEjemplo || {};
    switch (key) {
      case 'nombreInstituto':
        return 'INSTITUTO DE INFORMÁTICA UNA-PUNO';
      case 'titulo':
        return 'CERTIFICADO';
      case 'otorgado':
        return 'Otorgado a:';
      case 'nombreEstudiante':
        return d.nombre_completo || '[NOMBRE DEL ESTUDIANTE]';
      case 'descripcion':
        return d.nombre_evento
          ? `Por haber participado en "${d.nombre_evento}".`
          : 'Por haber participado en la capacitación indicada.';
      case 'rolParticipacion':
        return d.rol || 'ROL DE PARTICIPACIÓN';
      case 'eventoDetalle':
        return d.nombre_evento ? `en ${d.nombre_evento}` : 'Detalle del evento';
      case 'periodoHoras':
        return (d.fecha_inicio || d.fecha_fin)
          ? `Del ${d.fecha_inicio ? formatDate(d.fecha_inicio) : '[FECHA INICIO]'} al ${d.fecha_fin ? formatDate(d.fecha_fin) : '[FECHA FIN]'}${d.horas ? ` (${d.horas} horas)` : ''}`
          : 'Periodo y horas';
      case 'fecha':
        return formatDate(d.fecha_emision || Date.now());
      case 'codigo':
        return `Código: ${d.codigo_verificacion || 'CERT-2025-001'}`;
      default:
        return key;
    }
  };

  // Vista simple del panel izquierdo (solo textos y lista de campos)
  const simpleLeftView = editTextsOnly || !!pdfUrl;

  // Entrar en posicionamiento asistido automáticamente en vista simple
  useEffect(() => {
    if (simpleLeftView) {
      setAssistedMode(true);
    }
  }, [simpleLeftView]);

  // Enfoque inicial cuando se abre desde la previsualización con intención de editar texto
  // Evitar abrir el panel de propiedades por defecto si hay plantilla PDF
  useEffect(() => {
    const shouldAutoSelect = Boolean(initialSelectedElement) && !pdfUrl;
    if (shouldAutoSelect) {
      setSelectedElement(initialSelectedElement);
      setEditTextsOnly(true);
    }
  }, [initialSelectedElement, pdfUrl]);

  useEffect(() => {
    cargarConfiguraciones();
    cargarConfiguracionPorDefecto();
    if (datosEstudiante) {
      // Si se reciben datos del estudiante, usarlos en lugar del ejemplo
      setDatosActuales(datosEstudiante);
    } else {
      cargarCertificadoEjemplo();
    }
  }, [datosEstudiante]);

  // Ignorar siempre la última selección local: mantener únicamente la activa del servidor
  // Al cargar configuraciones, no se realiza ninguna sustitución basada en localStorage
  // para evitar que un diseño sin fondo sobrescriba la activa.
  // Esta decisión se aplica por preferencia del usuario.

  // Mantener sync del modo soloPDF con prop
  useEffect(() => {
    setLocalOnlyPDF(onlyPDF);
  }, [onlyPDF]);

  // Modo solo PDF: vista limpia con opción rápida para entrar a edición asistida
  if (localOnlyPDF && pdfUrl) {
    return (
      <div className="relative w-full h-[80vh]">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full border border-gray-300 rounded-lg"
          title="Certificado (vista completa)"
        >
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No se puede mostrar el PDF en este navegador.</p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Abrir en nueva pestaña</a>
          </div>
        </object>
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => { setLocalOnlyPDF(false); setAssistedMode(true); }}
          >
            Editar posiciones
          </button>
        </div>
      </div>
    );
  }

  // Nudge por teclado: flechas (Shift = 10px)
  useEffect(() => {
    if (!assistedMode || !selectedElement) return;
    const handler = (e) => {
      const delta = e.shiftKey ? 10 : 1;
      const cfg = configuracionActual.configuracion[selectedElement] || { x: 0, y: 0 };
      let x = cfg.x;
      let y = cfg.y;
      switch (e.key) {
        case 'ArrowUp':
          y = cfg.y - delta; break;
        case 'ArrowDown':
          y = cfg.y + delta; break;
        case 'ArrowLeft':
          x = cfg.x - delta; break;
        case 'ArrowRight':
          x = cfg.x + delta; break;
        default:
          return;
      }
      // Snapping a cuadrícula
      if (snapToGrid && gridSize > 0) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }
      // Snapping a guías horizontales
      if (snapToGuides && baselineGuides.length > 0) {
        const nearest = baselineGuides.reduce((acc, g) => Math.abs(y - g) < Math.abs(y - acc) ? g : acc, baselineGuides[0]);
        if (Math.abs(y - nearest) <= snapThreshold) y = nearest;
      }
      updateElementProperty(selectedElement, 'x', Math.max(0, Math.min(x, 800)));
      updateElementProperty(selectedElement, 'y', Math.max(0, Math.min(y, 600)));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [assistedMode, selectedElement, configuracionActual, snapToGrid, gridSize, snapToGuides, baselineGuides]);

  // Efecto separado para cuando cambian los datos del estudiante
  useEffect(() => {
    if (datosEstudiante) {
      setDatosActuales(datosEstudiante);
    }
  }, [datosEstudiante]);

  const cargarConfiguraciones = async () => {
    try {
      const response = await authedFetch(`${API_BASE}/admin/certificados/disenos`);
      if (response.ok) {
        const data = await response.json();
        console.log('[CertEditor] Diseños disponibles:', data.map(d => ({ id: d.id, nombre: d.nombre, activa: d.activa, fondoCertificado: d.fondoCertificado })));
        setConfiguraciones(data);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    }
  };

  const cargarConfiguracionPorDefecto = async () => {
    try {
      // No existe endpoint dedicado en backend; obtener lista y elegir el activo
      const response = await authedFetch(`${API_BASE}/admin/certificados/disenos`);
      if (response.ok) {
        const list = await response.json();
        if (Array.isArray(list) && list.length > 0) {
          const activo = list.find((d) => d.activa === 1 || d.activa === true);
          if (activo) {
            setConfiguracionActual(normalizeConfig(activo));
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración por defecto:', error);
    }
  };

  const cargarCertificadoEjemplo = async () => {
    try {
      const response = await authedFetch(`${API_BASE}/admin/certificados?limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.certificados && data.certificados.length > 0) {
          setCertificadoEjemplo(data.certificados[0]);
        }
      }
    } catch (error) {
      console.error('Error al cargar certificado ejemplo:', error);
    }
  };

  const handleFileUpload = async (file, tipo) => {
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF)');
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    console.log('Subiendo archivo:', file.name, 'Tipo:', tipo);
    
    // Crear previsualización inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
      setConfiguracionActual(prev => ({
        ...prev,
        [`${tipo}Preview`]: e.target.result
      }));
    };
    reader.readAsDataURL(file);
    
    const formData = new FormData();
    formData.append('imagen', file);

    const token = localStorage.getItem('token');
    console.log('Token disponible:', !!token);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/certificados/disenos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload exitoso:', data);
        setConfiguracionActual(prev => ({
          ...prev,
          [tipo]: data.url
        }));
        alert('Imagen subida exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error del servidor:', errorData);
        alert(errorData.error || `Error al subir la imagen (${response.status})`);
        // Limpiar previsualización en caso de error
        setConfiguracionActual(prev => ({
          ...prev,
          [`${tipo}Preview`]: null
        }));
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Error de conexión al subir la imagen');
      // Limpiar previsualización en caso de error
      setConfiguracionActual(prev => ({
        ...prev,
        [`${tipo}Preview`]: null
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // Generar automáticamente el nombre si no existe y hay datos del estudiante
    if (!configuracionActual.nombre.trim() && datosEstudiante) {
      const nombreAutomatico = `CERT-${datosEstudiante.dni}-${Date.now().toString().slice(-6)}`;
      setConfiguracionActual(prev => ({
        ...prev,
        nombre: nombreAutomatico
      }));
    } else if (!configuracionActual.nombre.trim()) {
      alert('Por favor ingresa un nombre para la configuración');
      return;
    }

    try {
      setLoading(true);
      const method = configuracionActual.id ? 'PUT' : 'POST';
      const url = configuracionActual.id 
        ? `${API_BASE}/admin/certificados/disenos/update-with-urls/${configuracionActual.id}`
        : `${API_BASE}/admin/certificados/disenos/save-with-urls`;

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: configuracionActual.nombre,
          configuracion: configuracionActual.configuracion,
          fondoCertificado: configuracionActual.fondoCertificado,
          activa: configuracionActual.activa
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Configuración guardada exitosamente');
        
        if (!configuracionActual.id) {
          setConfiguracionActual(prev => ({ 
            ...prev, 
            id: data.id,
            // Limpiar previsualizaciones después de guardar exitosamente
            fondoCertificadoPreview: null
          }));
        } else {
          // Si es una actualización, también limpiar previsualizaciones
          setConfiguracionActual(prev => ({
            ...prev,
            fondoCertificadoPreview: null
          }));
        }
        
        cargarConfiguraciones();
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const resetearConfiguracion = () => {
    setConfiguracionActual({
      nombre: '',
      configuracion: DEFAULT_CONFIG,
      fondoCertificado: null,
      // Limpiar también las previsualizaciones
      fondoCertificadoPreview: null,
      activa: false
    });
    setSelectedElement(null);
  };

  const handleDragStart = (e, elemento) => {
    setDraggedElement(elemento);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x;
    let y = e.clientY - rect.top - dragOffset.y;

    // Ajuste a cuadrícula si está habilitado
    if (snapToGrid && gridSize > 0) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    // Ajuste a guías horizontales si está habilitado
    if (snapToGuides && baselineGuides.length > 0) {
      const nearest = baselineGuides.reduce((acc, g) => Math.abs(y - g) < Math.abs(y - acc) ? g : acc, baselineGuides[0]);
      if (Math.abs(y - nearest) <= snapThreshold) y = nearest;
    }

    setConfiguracionActual(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [draggedElement]: {
          ...prev.configuracion[draggedElement],
          x: Math.max(0, Math.min(x, rect.width - 100)),
          y: Math.max(0, Math.min(y, rect.height - 50))
        }
      }
    }));

    setDraggedElement(null);
  };

  const updateElementProperty = (elementKey, property, value) => {
    let newValue = value;
    if (assistedMode && (property === 'x' || property === 'y')) {
      // Snapping al editar manualmente coordenadas
      if (property === 'x' && snapToGrid && gridSize > 0) {
        newValue = Math.round(newValue / gridSize) * gridSize;
      }
      if (property === 'y') {
        if (snapToGrid && gridSize > 0) newValue = Math.round(newValue / gridSize) * gridSize;
        if (snapToGuides && baselineGuides.length > 0) {
          const nearest = baselineGuides.reduce((acc, g) => Math.abs(newValue - g) < Math.abs(newValue - acc) ? g : acc, baselineGuides[0]);
          if (Math.abs(newValue - nearest) <= snapThreshold) newValue = nearest;
        }
      }
    }
    setConfiguracionActual(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [elementKey]: {
          ...prev.configuracion[elementKey],
          [property]: newValue
        }
      }
    }));
  };

  const handleElementClick = (elementKey) => {
    if (editTextsOnly && !isTextElement(elementKey)) return;
    setSelectedElement(elementKey);
  };

  const cargarConfiguracion = (config) => {
    const normalized = normalizeConfig(config);
    setConfiguracionActual({
      ...normalized,
      fondoCertificadoPreview: null
    });
    setSelectedElement(null);
  };

  const activarConfiguracion = async (id) => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/certificados/disenos/${id}/activar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Configuración activada exitosamente');
        // Cargar desde backend la configuración activada para evitar desfasajes
        const detailResp = await fetch(`${API_BASE}/admin/certificados/disenos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailResp.ok) {
          const detailData = await detailResp.json();
          const normalized = normalizeConfig(detailData);
          setConfiguracionActual({
            ...normalized,
            fondoCertificadoPreview: null
          });
          setSelectedElement(null);
        }

        cargarConfiguraciones();
        cargarConfiguracionPorDefecto();
      } else {
        alert('Error al activar la configuración');
      }
    } catch (error) {
      console.error('Error al activar configuración:', error);
      alert('Error al activar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const eliminarConfiguracion = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      return;
    }

    try {
        setLoading(true);
        const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/certificados/disenos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Configuración eliminada exitosamente');
        cargarConfiguraciones();
      } else {
        alert('Error al eliminar la configuración');
      }
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      alert('Error al eliminar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const generarPDFPrevisualizacion = async () => {
    try {
      setLoading(true);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });

      // Fondo
      if (configuracionActual.fondoCertificado) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = resolveAssetUrl(configuracionActual.fondoCertificado);
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          pdf.addImage(img, 'JPEG', 0, 0, 800, 600);
        } catch (error) {
          console.warn('No se pudo cargar la imagen de fondo:', error);
        }
      }

      // Logos eliminados

      // Textos
      // Usar datosActuales si están disponibles, sino usar certificadoEjemplo
      const datosParaCertificado = datosActuales || certificadoEjemplo;
      
      const elementos = [
        { key: 'nombreInstituto', text: 'INSTITUTO DE INFORMÁTICA UNA-PUNO' },
        { key: 'titulo', text: 'CERTIFICADO' },
        { key: 'otorgado', text: 'Otorgado a:' },
        { key: 'nombreEstudiante', text: datosParaCertificado?.nombre_completo || '[NOMBRE DEL ESTUDIANTE]' },
        { key: 'descripcion', text: datosParaCertificado ? `Por haber participado en "${datosParaCertificado.nombre_evento}" realizado del ${datosParaCertificado.fecha_inicio ? new Date(datosParaCertificado.fecha_inicio).toLocaleDateString('es-ES') : '[FECHA INICIO]'} al ${datosParaCertificado.fecha_fin ? new Date(datosParaCertificado.fecha_fin).toLocaleDateString('es-ES') : '[FECHA FIN]'}.` : 'Por haber participado como Asistente en la capacitación de "Desarrollo de Aplicaciones Web con React y Node.js" realizada del 01 al 15 de Diciembre del 2024.' },
        { key: 'fecha', text: datosParaCertificado?.fecha_emision ? new Date(datosParaCertificado.fecha_emision).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { key: 'codigo', text: `Código: ${datosParaCertificado?.codigo_verificacion || 'CERT-2024-001'}` }
      ];

      elementos.forEach(elemento => {
        const config = configuracionActual.configuracion[elemento.key];
        if (config?.visible === false) return; // ocultar solo si está explícitamente desactivado
        pdf.setFontSize(config.fontSize);
        pdf.setTextColor(config.color);
        if (elemento.key === 'descripcion') {
          const lines = pdf.splitTextToSize(elemento.text, 400);
          pdf.text(lines, config.x, config.y, { align: 'center' });
        } else {
          pdf.text(elemento.text, config.x, config.y, { align: 'center' });
        }
      });

      // Firmas
      const firmaIzq = configuracionActual.configuracion.firmaIzquierda;
      pdf.line(firmaIzq.x, firmaIzq.y + firmaIzq.height - 20, firmaIzq.x + firmaIzq.width, firmaIzq.y + firmaIzq.height - 20);
      pdf.setFontSize(10);
      pdf.text('Director', firmaIzq.x + firmaIzq.width / 2, firmaIzq.y + firmaIzq.height - 5, { align: 'center' });

      const firmaDer = configuracionActual.configuracion.firmaDerecha;
      pdf.line(firmaDer.x, firmaDer.y + firmaDer.height - 20, firmaDer.x + firmaDer.width, firmaDer.y + firmaDer.height - 20);
      pdf.text('Coordinador', firmaDer.x + firmaDer.width / 2, firmaDer.y + firmaDer.height - 5, { align: 'center' });

      // QR placeholder (solo si visible)
      const qrConfig = configuracionActual.configuracion.qr;
      if (qrConfig?.visible) {
        pdf.rect(qrConfig.x, qrConfig.y, qrConfig.width, qrConfig.height);
        pdf.setFontSize(8);
        pdf.text('QR Code', qrConfig.x + qrConfig.width / 2, qrConfig.y + qrConfig.height / 2, { align: 'center' });
      }

      pdf.save(`certificado-preview-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF de previsualización');
    } finally {
      setLoading(false);
    }
  };

  const guardarCertificado = async () => {
    if (!datosEstudiante) {
      alert('No hay datos del estudiante para generar el certificado');
      return;
    }

    // Generar automáticamente el nombre basado en el DNI si no existe
    if (!configuracionActual.nombre || configuracionActual.nombre.trim() === '') {
      const nombreAutomatico = `CERT-${datosEstudiante.dni}-${Date.now().toString().slice(-6)}`;
      setConfiguracionActual(prev => ({
        ...prev,
        nombre: nombreAutomatico
      }));
    }

    // Si no tiene ID, guardar primero el diseño
    if (!configuracionActual.id) {
      await handleSaveConfiguration();
      // Esperar un momento para que se complete el guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      setLoading(true);

      // Determinar código de verificación: si ya existe, conservarlo; si no, generar nuevo
      const codigoExistente = datosEstudiante.codigo_verificacion;
      const codigoVerificacion = codigoExistente || `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const payloadBase = {
        datosEstudiante: {
          dni: datosEstudiante.dni,
          nombreCompleto: datosEstudiante.nombre_completo,
          tipoDocumento: datosEstudiante.tipoDocumento || 'DNI',
          nombreEvento: datosEstudiante.nombre_evento,
          fechaInicio: datosEstudiante.fecha_inicio,
          fechaFin: datosEstudiante.fecha_fin,
          horasAcademicas: datosEstudiante.horas_academicas,
          modalidad: datosEstudiante.modalidad,
          observaciones: datosEstudiante.observaciones
        },
        disenoId: configuracionActual.id,
        codigoVerificacion
      };

      const token = localStorage.getItem('token');

      // Intentar crear nuevo certificado
      let response = await fetch(`${API_BASE}/admin/certificados/guardar-con-diseno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payloadBase)
      });

      let result = await response.json().catch(() => ({}));

      // Si ya existe, realizar actualización en lugar de crear
      if (!response.ok && (result?.message?.includes('Ya existe un certificado activo') || response.status === 400)) {
        response = await fetch(`${API_BASE}/admin/certificados/actualizar-con-diseno`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payloadBase)
        });
        result = await response.json();
      }

      if (response.ok && result.success) {
        // Descargar automáticamente el PDF (usa el código existente si hay)
        const codigoFinal = result.certificado?.codigo_verificacion || codigoVerificacion;
        await handleDownloadPDF(codigoFinal);

        alert(`${codigoExistente ? 'Certificado actualizado' : 'Certificado guardado'} y descargado exitosamente. Código: ${codigoFinal}`);

        if (onCertificadoGuardado) {
          onCertificadoGuardado(result.certificado);
        }

        if (onClose) {
          onClose();
        }
      } else {
        alert(result?.message || 'Error al guardar/actualizar el certificado');
      }
    } catch (error) {
      console.error('Error al guardar/actualizar certificado:', error);
      alert('Error al guardar/actualizar el certificado');
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar PDF automáticamente
  const handleDownloadPDF = async (codigoVerificacion) => {
    try {
      const response = await fetch(`${API_BASE}/admin/certificados/pdf/${codigoVerificacion}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `certificado-${codigoVerificacion}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <Palette className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Diseño de Certificados</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo */}
          <div className="w-1/3 p-6 border-r overflow-y-auto">
            <div className="space-y-6">
              {/* Modo de edición */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm text-indigo-800">
                  <input type="checkbox" checked={editTextsOnly} onChange={(e)=>setEditTextsOnly(e.target.checked)} />
                  Editar solo textos
                </label>
                {editTextsOnly && (
                  <p className="text-xs text-indigo-700 mt-2">Con este modo activo, los logos, firmas y el QR están bloqueados. Solo puedes arrastrar y ajustar textos (X/Y, tamaño, fuente, color).</p>
                )}
              </div>

              {/* Campos de texto: seleccionar y mostrar/ocultar */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Campos de texto</h3>
                <div className="space-y-2">
                  {Object.entries(TEXT_KEYS).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={visibleTextElements[key]}
                          onChange={(e)=>{
                            const checked = e.target.checked;
                            setVisibleTextElements(prev=>({ ...prev, [key]: checked }));
                            setConfiguracionActual(prev => ({
                              ...prev,
                              configuracion: {
                                ...prev.configuracion,
                                [key]: {
                                  ...prev.configuracion[key],
                                  visible: checked
                                }
                              }
                            }));
                          }}
                        />
                        {label}
                      </label>
                      <button
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={()=>setSelectedElement(key)}
                        disabled={!visibleTextElements[key]}
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Si tu plantilla ya tiene un texto impreso (por ejemplo “CERTIFICADO”), desactívalo aquí para evitar duplicarlo.</p>
              </div>
              {/* Información del Estudiante: ocultar en edición de textos o si hay PDF */}
              {datosEstudiante && !editTextsOnly && !pdfUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Datos del Estudiante
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-green-700">DNI:</label>
                      <div className="bg-white px-3 py-2 border border-green-300 rounded text-sm text-gray-800">
                        {datosEstudiante.dni}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Nombre Completo:</label>
                      <div className="bg-white px-3 py-2 border border-green-300 rounded text-sm text-gray-800">
                        {datosEstudiante.nombre_completo}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Evento:</label>
                      <div className="bg-white px-3 py-2 border border-green-300 rounded text-sm text-gray-800">
                        {datosEstudiante.nombre_evento}
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Los datos se usarán automáticamente en el certificado
                    </p>
                  </div>
                </div>
              )}

              {/* Nombre de configuración - Oculto, se genera automáticamente */}
              <div style={{ display: 'none' }}>
                <input
                  type="text"
                  value={configuracionActual.nombre}
                  onChange={(e) => setConfiguracionActual(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sección de imágenes: solo fondo del certificado (logos eliminados) */}
              {!onlyPDF && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon size={20} />
                    Imágenes
                  </h3>
                  {/* Fondo del certificado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fondo del certificado
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'fondoCertificado')}
                      disabled={editTextsOnly}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editTextsOnly ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                    />
                    {(configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado) && (
                      <div className="mt-2 relative">
                        <img 
                          src={resolveAssetUrl(configuracionActual.fondoCertificadoPreview || configuracionActual.fondoCertificado)} 
                          alt="Fondo" 
                          className="w-full h-20 object-cover border rounded shadow-sm"
                        />
                        {configuracionActual.fondoCertificadoPreview && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                            Nuevo
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos soportados: JPG, PNG, GIF (máx. 5MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción y guardado: ocultar en vista simple */}
              {(!simpleLeftView) && (
              <div className="space-y-3">
                {/* Guardar/Actualizar configuración del diseño */}
                <button
                  onClick={handleSaveConfiguration}
                  disabled={loading || !configuracionActual}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Guardando...' : (configuracionActual.id ? 'Actualizar configuración' : 'Guardar configuración')}
                </button>
                {/* Herramientas rápidas de posicionamiento asistido */}
                {assistedMode && (
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <button className="px-2 py-1 text-xs bg-purple-600 text-white rounded" onClick={()=>setAssistedMode(false)}>Salir de posicionamiento</button>
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={()=>{ if(selectedElement){ const y = configuracionActual.configuracion[selectedElement]?.y || 0; setBaselineGuides(prev=>[...prev, y]); } }}>Agregar guía desde selección</button>
                      <button className="px-2 py-1 text-xs bg-gray-600 text-white rounded" onClick={()=>setBaselineGuides([])}>Borrar guías</button>
                    </div>
                    <label className="flex items-center gap-2 text-xs mb-1"><input type="checkbox" checked={snapToGuides} onChange={(e)=>setSnapToGuides(e.target.checked)} /> Ajuste a guías horizontales</label>
                    <p className="text-[11px] text-gray-600">Usa las flechas del teclado para mover; Shift = 10px.</p>
                  </div>
                )}
                {/* Solo mostrar el botón Guardar si hay datos del estudiante */}
                {datosEstudiante ? (
                  <button
                    onClick={guardarCertificado}
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Guardando y Descargando...' : 'Guardar'}
                  </button>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>Selecciona un estudiante para generar el certificado</p>
                  </div>
                )}
              </div>
              )}

              {/* Panel de propiedades del elemento seleccionado */}
              {selectedElement && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={20} />
                    Propiedades: {selectedElement.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    {/* Posición */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
                        <input
                          type="number"
                          value={Math.round(configuracionActual.configuracion[selectedElement]?.x || 0)}
                          onChange={(e) => updateElementProperty(selectedElement, 'x', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="range"
                          min="0"
                          max="800"
                          value={Math.round(configuracionActual.configuracion[selectedElement]?.x || 0)}
                          onChange={(e) => updateElementProperty(selectedElement, 'x', parseInt(e.target.value))}
                          className="w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
                        <input
                          type="number"
                          value={Math.round(configuracionActual.configuracion[selectedElement]?.y || 0)}
                          onChange={(e) => updateElementProperty(selectedElement, 'y', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="range"
                          min="0"
                          max="600"
                          value={Math.round(configuracionActual.configuracion[selectedElement]?.y || 0)}
                          onChange={(e) => updateElementProperty(selectedElement, 'y', parseInt(e.target.value))}
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                    
                    {/* Propiedades de texto */}
                    {!['firmaIzquierda', 'firmaDerecha', 'qr'].includes(selectedElement) && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
                          <input
                            type="range"
                            min="8"
                            max="48"
                            value={configuracionActual.configuracion[selectedElement]?.fontSize || 16}
                            onChange={(e) => updateElementProperty(selectedElement, 'fontSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 text-center mt-1">
                            {configuracionActual.configuracion[selectedElement]?.fontSize || 16}px
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Familia de fuente</label>
                          <select
                            value={configuracionActual.configuracion[selectedElement]?.fontFamily || 'sans-serif'}
                            onChange={(e) => updateElementProperty(selectedElement, 'fontFamily', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="serif">Serif (Times)</option>
                            <option value="sans-serif">Sans-serif (Arial)</option>
                            <option value="monospace">Monospace (Courier)</option>
                            <option value="cursive">Cursiva</option>
                            <option value="fantasy">Fantasía</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Peso</label>
                            <select
                              value={configuracionActual.configuracion[selectedElement]?.fontWeight || 'normal'}
                              onChange={(e) => updateElementProperty(selectedElement, 'fontWeight', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Negrita</option>
                              <option value="lighter">Ligera</option>
                              <option value="bolder">Más negrita</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Estilo</label>
                            <select
                              value={configuracionActual.configuracion[selectedElement]?.fontStyle || 'normal'}
                              onChange={(e) => updateElementProperty(selectedElement, 'fontStyle', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="normal">Normal</option>
                              <option value="italic">Cursiva</option>
                              <option value="oblique">Oblicua</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                          <input
                            type="color"
                            value={configuracionActual.configuracion[selectedElement]?.color || '#000000'}
                            onChange={(e) => updateElementProperty(selectedElement, 'color', e.target.value)}
                            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                      </>
                    )}

                    {/* Propiedades de imágenes eliminadas: logos deprecados */}

                    {/* Herramientas de edición */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={showRulers} onChange={(e)=>setShowRulers(e.target.checked)} />
                        Mostrar reglas X/Y
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={snapToGrid} onChange={(e)=>setSnapToGrid(e.target.checked)} />
                        Ajuste a cuadrícula
                      </label>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de cuadrícula</label>
                        <input type="number" min="5" max="100" step="1" value={gridSize} onChange={(e)=>setGridSize(parseInt(e.target.value)||10)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Zoom</label>
                        <input type="range" min="0.5" max="1.5" step="0.05" value={zoom} onChange={(e)=>setZoom(parseFloat(e.target.value))} className="w-full" />
                        <div className="text-xs text-gray-500 text-center mt-1">{Math.round(zoom*100)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de configuraciones guardadas */}
              {configuraciones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuraciones Guardadas</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {configuraciones.map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{config.nombre}</p>
                          {config.activa && (
                            <span className="text-xs text-green-600 font-medium">Activa</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => cargarConfiguracion(config)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => activarConfiguracion(config.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Activar
                          </button>
                          <button
                            onClick={() => eliminarConfiguracion(config.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área de diseño */}
          <div className="flex-1 p-6">
            <div className="h-full">
              {renderArea()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DisenoCertificados;

import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, FileImage, Info } from 'lucide-react';
import api from '../../config/api';

const defaultConfig = {
  page: { orientation: 'landscape', width: 842, height: 595, margin: 24 },
  typography: {
    nombre: { x: 260, y: 280, size: 28, weight: 'bold', color: '#111827' },
    evento: { x: 260, y: 320, size: 16, weight: 'medium', color: '#111827' },
    horas: { x: 260, y: 360, size: 14, weight: 'regular', color: '#374151' },
    fecha: { x: 260, y: 400, size: 14, weight: 'regular', color: '#374151' }
  }
};

const DesignUploader = ({ open, onClose, onSaved }) => {
  const [nombre, setNombre] = useState('');
  const [fondoFile, setFondoFile] = useState(null);
  const [config, setConfig] = useState(defaultConfig);
  const [validations, setValidations] = useState([]);
  const [saving, setSaving] = useState(false);
  const fondoImgRef = useRef(null);

  const acceptedTypes = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';

  const readImageInfo = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const validateFondo = async (file) => {
    const notes = [];
    if (!file) return [];
    if (!acceptedTypes.split(',').includes(file.type)) {
      notes.push('Formato no soportado. Usa PNG, JPG, WEBP o SVG.');
      return notes;
    }
    if (file.size > 5 * 1024 * 1024) {
      notes.push('El archivo supera 5MB. Reduce el tamaño.');
    }
    // Para SVG no podemos leer dimensiones fácilmente en cliente sin parseo
    if (file.type === 'image/svg+xml') {
      notes.push('SVG detectado. Asegúrate de que el viewBox sea A4 horizontal.');
      return notes;
    }
    const { width, height } = await readImageInfo(file);
    const ratio = width / height;
    const okSize = width >= 1200 && height >= 800;
    const isLandscapeA4Approx = ratio >= 0.68 && ratio <= 0.75; // ~0.707
    if (!okSize) {
      notes.push(`Resolución baja (${width}x${height}). Recomendado ≥ 1200x800.`);
    }
    if (!isLandscapeA4Approx) {
      notes.push(`Relación de aspecto ${ratio.toFixed(3)}. Sugerido A4 horizontal (~0.707).`);
    } else {
      notes.push(`Dimensiones aceptadas (${width}x${height}). Ratio ${ratio.toFixed(3)}.`);
    }
    return notes;
  };

  const onFondoChange = async (e) => {
    const file = e.target.files?.[0];
    setFondoFile(file || null);
    if (file) {
      const notes = await validateFondo(file);
      setValidations(notes);
    } else {
      setValidations([]);
    }
  };

  // Manejo de logos eliminado

  const handleConfigChange = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: typeof prev[section][field] === 'number' ? Number(value) : value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();
      form.append('nombre', nombre || 'Diseño personalizado');
      form.append('configuracion', JSON.stringify(config));
      if (fondoFile) form.append('fondoCertificado', fondoFile);

      const res = await api.post('/admin/certificados/disenos', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201) {
        onSaved?.(res.data?.diseno);
        onClose?.();
      }
    } catch (err) {
      console.error('Error guardando diseño:', err);
      alert('No se pudo guardar el diseño. Verifica formatos y tamaño (<5MB).');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-base font-semibold">Seleccionar diseño / plantilla</h3>
          <button className="p-1 hover:bg-gray-100 rounded" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del diseño</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej. Diseño Básico"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Fondo del certificado</label>
              <div className="border rounded p-3 text-center">
                <input type="file" accept={acceptedTypes} onChange={onFondoChange} />
                <p className="text-[11px] text-gray-500 mt-1">PNG/JPG/WEBP/SVG • Máx 5MB</p>
              </div>
            </div>
            {/* Campos de logos eliminados */}
          </div>

          {validations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <div>
                {validations.map((v, idx) => (
                  <p key={idx}>{v}</p>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-2">Parámetros del certificado</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="text-xs">Posición Nombre X
                <input className="w-full border rounded px-2 py-1 text-xs" type="number" value={config.typography.nombre.x} onChange={(e)=>handleConfigChange('typography', 'nombre', { ...config.typography.nombre, x: Number(e.target.value) })} />
              </label>
              <label className="text-xs">Posición Nombre Y
                <input className="w-full border rounded px-2 py-1 text-xs" type="number" value={config.typography.nombre.y} onChange={(e)=>handleConfigChange('typography', 'nombre', { ...config.typography.nombre, y: Number(e.target.value) })} />
              </label>
              <label className="text-xs">Tamaño Nombre
                <input className="w-full border rounded px-2 py-1 text-xs" type="number" value={config.typography.nombre.size} onChange={(e)=>handleConfigChange('typography', 'nombre', { ...config.typography.nombre, size: Number(e.target.value) })} />
              </label>
              <label className="text-xs">Color Nombre
                <input className="w-full border rounded px-2 py-1 text-xs" type="text" value={config.typography.nombre.color} onChange={(e)=>handleConfigChange('typography', 'nombre', { ...config.typography.nombre, color: e.target.value })} />
              </label>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Puedes ajustar coordenadas y estilos básicos; se guardan en el campo configuración.</p>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button className="px-3 py-1.5 text-sm border rounded" onClick={onClose}>Cancelar</button>
          <button disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded" onClick={handleSave}>
            {saving ? 'Guardando…' : 'Guardar diseño'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignUploader;

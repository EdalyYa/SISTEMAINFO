import { useState } from 'react';
import api from '../../config/api';
import { useToast } from '../ui/Toast';

export default function SimpleDesignUploader({ open, onClose, onSaved }) {
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const reset = () => {
    setNombre('');
    setFile(null);
    setError('');
    setSaving(false);
  };

  const onFileChange = async (e) => {
    setError('');
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (f.size > maxBytes) {
      setError('El archivo excede 5MB.');
      return;
    }
    if (!f.type.startsWith('image/')) {
      setError('Solo se aceptan imágenes (PNG/JPG/JPEG).');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) { setError('Ingresa un nombre de plantilla.'); return; }
    if (!file) { setError('Selecciona una imagen de plantilla.'); return; }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('nombre', nombre.trim());
      fd.append('fondoCertificado', file);
      await api.post('/admin/certificados/disenos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.addToast({ type: 'success', title: 'Diseño guardado', message: 'La plantilla se guardó correctamente.' });
      onSaved?.();
      reset();
      onClose?.();
    } catch (err) {
      console.error('Error guardando diseño:', err);
      const message = err.response?.data?.message || 'No se pudo guardar el diseño';
      setError(message);
      toast.addToast({ type: 'error', title: 'Error al guardar', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { reset(); onClose?.(); }} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Seleccionar plantilla</h2>
          <button className="text-sm text-gray-600" onClick={() => { reset(); onClose?.(); }}>Cerrar</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nombre de la plantilla</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Ej. Certificado INFOUNA"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Imagen del certificado</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={onFileChange}
            />
            <p className="text-xs text-gray-500 mt-1">Solo imagen PNG/JPG/JPEG, máx. 5MB.</p>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 text-sm border rounded" onClick={() => { reset(); onClose?.(); }}>Cancelar</button>
            <button type="submit" disabled={saving} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : 'Guardar plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


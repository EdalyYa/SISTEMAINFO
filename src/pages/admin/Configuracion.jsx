import React, { useEffect, useState } from 'react';
import api from '../../config/api';

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );
}

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [config, setConfig] = useState({
    general: {
      institutionName: '',
      email: '',
      phone: '',
      address: '',
      social: { facebook: '', twitter: '', instagram: '' },
      maintenanceMode: false,
    },
    certificados: {
      publicModuleVisible: true,
      theme: 'light',
      palette: { primary: '#1e3a8a', secondary: '#0ea5e9' },
    },
    integraciones: {
      analyticsId: '',
    },
    seguridad: {
      roles: {
        superadmin: {
          name: 'Superadmin',
          permisos: {
            configuracion: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            certificados: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            programas: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            modulos: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            cursos: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            matriculas: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            docentes: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
            reclamaciones: { ver: true, crear: true, editar: true, eliminar: true, exportar: true },
          }
        },
        adminAcademico: {
          name: 'Admin académico',
          permisos: {
            configuracion: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            certificados: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            programas: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            modulos: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            cursos: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            matriculas: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            docentes: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            reclamaciones: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
          }
        },
        operadorCertificados: {
          name: 'Operador certificados',
          permisos: {
            configuracion: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            certificados: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
            programas: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            modulos: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            cursos: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            matriculas: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            docentes: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            reclamaciones: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
          }
        },
        editorContenido: {
          name: 'Editor contenido',
          permisos: {
            configuracion: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            certificados: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
            programas: { ver: true, crear: true, editar: true, eliminar: false, exportar: false },
            modulos: { ver: true, crear: true, editar: true, eliminar: false, exportar: false },
            cursos: { ver: true, crear: true, editar: true, eliminar: false, exportar: false },
            matriculas: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
            docentes: { ver: true, crear: true, editar: true, eliminar: false, exportar: false },
            reclamaciones: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
          }
        },
        analista: {
          name: 'Analista',
          permisos: {
            configuracion: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
            certificados: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
            programas: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
            modulos: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
            cursos: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
            matriculas: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
            docentes: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
            reclamaciones: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
          }
        }
      }
    }
  });

  const [selectedRoleKey, setSelectedRoleKey] = useState('superadmin');
  const modules = ['configuracion','certificados','programas','modulos','cursos','matriculas','docentes','reclamaciones'];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/configuracion');
        // API puede retornar {id, data} o arreglo
        const payload = Array.isArray(data) ? (data[0]?.data || {}) : (data?.data || {});
        if (payload && typeof payload === 'object') {
          setConfig(prev => ({
            ...prev,
            ...payload,
            general: { ...prev.general, ...(payload.general || {}) },
            certificados: { ...prev.certificados, ...(payload.certificados || {}) },
            integraciones: { ...prev.integraciones, ...(payload.integraciones || {}) },
          }));
        }
      } catch (err) {
        console.error('Error cargando configuración:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    // Validación mínima (email)
    const newErrors = {};
    if (config.general.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.general.email)) {
      newErrors.email = 'Formato de email no válido';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSaving(false);
      return;
    }
    try {
      const { data } = await api.put('/configuracion', { data: config });
      setMessage('Configuración guardada correctamente');
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setMessage('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <p className="text-gray-600">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <button
          onClick={save}
          disabled={saving}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm border bg-blue-50 text-blue-800 border-blue-200">
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')}>General</TabButton>
        <TabButton active={activeTab === 'certificados'} onClick={() => setActiveTab('certificados')}>Certificados</TabButton>
        <TabButton active={activeTab === 'integraciones'} onClick={() => setActiveTab('integraciones')}>Integraciones</TabButton>
        <TabButton active={activeTab === 'seguridad'} onClick={() => setActiveTab('seguridad')}>Seguridad</TabButton>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Identidad</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la institución <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Instituto de Informática - Universidad Nacional del Altiplano"
                  value={config.general.institutionName}
                  onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, institutionName: e.target.value } }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="contacto@infouna.edu.pe"
                    value={config.general.email}
                    onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, email: e.target.value } }))}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    placeholder="(051) 123456 / +51 900 000 000"
                    value={config.general.phone}
                    onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, phone: e.target.value } }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  placeholder="Ciudad Universitaria, Av. Principal s/n"
                  value={config.general.address}
                  onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, address: e.target.value } }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Redes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Facebook</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/infouna"
                  value={config.general.social.facebook}
                  onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, social: { ...prev.general.social, facebook: e.target.value } } }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter/X</label>
                <input
                  type="text"
                  placeholder="https://x.com/infouna"
                  value={config.general.social.twitter}
                  onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, social: { ...prev.general.social, twitter: e.target.value } } }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/infouna"
                  value={config.general.social.instagram}
                  onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, social: { ...prev.general.social, instagram: e.target.value } } }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Preferencias</h3>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.general.maintenanceMode}
                onChange={(e) => setConfig(prev => ({ ...prev, general: { ...prev.general, maintenanceMode: e.target.checked } }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Activar modo mantenimiento</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'certificados' && (
        <div className="space-y-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.certificados.publicModuleVisible}
              onChange={(e) => setConfig(prev => ({ ...prev, certificados: { ...prev.certificados, publicModuleVisible: e.target.checked } }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar módulo público de verificación/descarga</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tema</label>
            <select
              value={config.certificados.theme}
              onChange={(e) => setConfig(prev => ({ ...prev, certificados: { ...prev.certificados, theme: e.target.value } }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Color primario</label>
              <input
                type="color"
                value={config.certificados.palette.primary}
                onChange={(e) => setConfig(prev => ({ ...prev, certificados: { ...prev.certificados, palette: { ...prev.certificados.palette, primary: e.target.value } } }))}
                className="mt-1 h-10 w-16 p-0 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color secundario</label>
              <input
                type="color"
                value={config.certificados.palette.secondary}
                onChange={(e) => setConfig(prev => ({ ...prev, certificados: { ...prev.certificados, palette: { ...prev.certificados.palette, secondary: e.target.value } } }))}
                className="mt-1 h-10 w-16 p-0 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integraciones' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID de Google Analytics (GA4)</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={config.integraciones.analyticsId}
              onChange={(e) => setConfig(prev => ({ ...prev, integraciones: { ...prev.integraciones, analyticsId: e.target.value } }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {activeTab === 'seguridad' && (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Roles</h3>
                <p className="text-xs text-gray-500">Definición básica de permisos por módulo. Aplicación de permisos requiere cambios de middleware.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Selecciona un rol</label>
                <select
                  value={selectedRoleKey}
                  onChange={(e) => setSelectedRoleKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.keys(config.seguridad.roles).map((key) => (
                    <option key={key} value={key}>{config.seguridad.roles[key].name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Permisos por módulo</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-700">
                    <th className="text-left py-2 pr-4">Módulo</th>
                    {['ver','crear','editar','eliminar','exportar'].map((accion) => (
                      <th key={accion} className="text-center px-2 py-2 capitalize">{accion}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => (
                    <tr key={mod} className="border-t">
                      <td className="py-2 pr-4 capitalize">{mod}</td>
                      {['ver','crear','editar','eliminar','exportar'].map((accion) => {
                        const checked = config.seguridad.roles[selectedRoleKey].permisos[mod]?.[accion] || false;
                        return (
                          <td key={accion} className="text-center py-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setConfig(prev => {
                                  const updated = { ...prev };
                                  const role = updated.seguridad.roles[selectedRoleKey];
                                  role.permisos[mod] = role.permisos[mod] || { ver:false, crear:false, editar:false, eliminar:false, exportar:false };
                                  role.permisos[mod][accion] = e.target.checked;
                                  return updated;
                                });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { API_HOST } from '../../config/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalCertificados: 0,
    totalCursos: 0,
    totalProgramas: 0,
    totalMatriculas: 0,
    totalDocentes: 0,
    totalReclamaciones: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Datos del dashboard
  const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const API_URL = API_HOST;
  const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

  const [usersRecent, setUsersRecent] = useState([]);
  const [rolesSummary, setRolesSummary] = useState([]);
  const [reclamacionesRecent, setReclamacionesRecent] = useState([]);
  const [certificadosRecent, setCertificadosRecent] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState({ users: false, reclamos: false, certs: false });

  useEffect(() => {
    fetchStats();
    fetchUsersAndRoles();
    fetchReclamaciones();
    fetchCertificados();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      setStats({
        totalUsuarios: data.totalUsuarios || 0,
        totalCertificados: data.totalCertificados || 0,
        totalCursos: data.totalCursos || 0,
        totalProgramas: data.totalProgramas || 0,
        totalMatriculas: data.totalMatriculas || 0,
        totalDocentes: data.totalDocentes || 0,
        totalReclamaciones: data.totalReclamaciones || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  async function fetchUsersAndRoles() {
    try {
      setSectionsLoading(prev => ({ ...prev, users: true }));
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      // Últimos 5 usuarios por id desc
      const recent = list.slice(0, 5);
      setUsersRecent(recent);
      // Resumen por roles
      const counts = list.reduce((acc, u) => {
        const role = (u.role || 'user');
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});
      const summary = Object.entries(counts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);
      setRolesSummary(summary);
    } catch (e) {
      // Silenciar errores para no bloquear el dashboard
    } finally {
      setSectionsLoading(prev => ({ ...prev, users: false }));
    }
  }

  async function fetchReclamaciones() {
    try {
      setSectionsLoading(prev => ({ ...prev, reclamos: true }));
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/reclamaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setReclamacionesRecent(list.slice(0, 5));
    } catch (e) {
      // Ignorar
    } finally {
      setSectionsLoading(prev => ({ ...prev, reclamos: false }));
    }
  }

  async function fetchCertificados() {
    try {
      setSectionsLoading(prev => ({ ...prev, certs: true }));
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/certificados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setCertificadosRecent(list.slice(0, 5));
    } catch (e) {
      // Ignorar
    } finally {
      setSectionsLoading(prev => ({ ...prev, certs: false }));
    }
  }

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-gray-900 text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const Badge = ({ children, color = 'bg-gray-100 text-gray-700' }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>{children}</span>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600">Bienvenido al panel de administración</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Última actualización</p>
              <p className="text-gray-900 font-medium">{new Date().toLocaleString('es-PE')}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchStats}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Stats Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Usuarios"
                value={stats.totalUsuarios}
                color="bg-blue-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Certificados Emitidos"
                value={stats.totalCertificados}
                color="bg-emerald-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 714.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 710 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 710-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Total Reclamaciones"
                value={stats.totalReclamaciones}
                color="bg-amber-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Total Docentes"
                value={stats.totalDocentes}
                color="bg-indigo-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              
              <StatCard
                title="Total Cursos"
                value={stats.totalCursos}
                color="bg-purple-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />
              
              <StatCard
                title="Total Matrículas"
                value={stats.totalMatriculas}
                color="bg-teal-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
            </div>
          )}

          {/* Paneles de información útil y acciones rápidas */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Resumen por roles */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Usuarios por Rol</h3>
              {sectionsLoading.users ? (
                <div className="py-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {rolesSummary.length === 0 ? (
                    <p className="text-sm text-gray-500">Sin datos de usuarios</p>
                  ) : (
                    rolesSummary.map(item => (
                      <Badge key={item.role} color={item.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {item.role}: {item.count}
                      </Badge>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Usuarios recientes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Usuarios Recientes</h3>
              {sectionsLoading.users ? (
                <div className="py-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : (
                <div className="space-y-2">
                  {usersRecent.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay usuarios recientes</p>
                  ) : (
                    usersRecent.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div>
                          <p className="text-sm text-gray-900">{u.full_name || u.username || 'Usuario'}</p>
                          <p className="text-xs text-gray-500">{u.email || 'Sin email'}</p>
                        </div>
                        <Badge color={u.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{u.role || 'user'}</Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 p-4 rounded-lg transition-all duration-200 text-left">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium text-sm">Nuevo Usuario</span>
                  </div>
                </button>
                
                <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 p-4 rounded-lg transition-all duration-200 text-left">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 714.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 710 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 710-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
                    </svg>
                    <span className="font-medium text-sm">Emitir Certificado</span>
                  </div>
                </button>
                
                <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 p-4 rounded-lg transition-all duration-200 text-left">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium text-sm">Nuevo Curso</span>
                  </div>
                </button>
                
                <button className="bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 p-4 rounded-lg transition-all duration-200 text-left">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 712-2h2a2 2 0 712 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 712-2h2a2 2 0 712 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium text-sm">Ver Reportes</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Listas recientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Reclamaciones recientes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reclamaciones Recientes</h3>
              {sectionsLoading.reclamos ? (
                <div className="py-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>
              ) : (
                <div className="space-y-2">
                  {reclamacionesRecent.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay reclamaciones recientes</p>
                  ) : (
                    reclamacionesRecent.map(r => (
                      <div key={r.id} className="p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900">{r.tipo || 'Reclamación'}</p>
                          <Badge color={r.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>{r.estado || 'pendiente'}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{r.descripcion || ''}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Certificados recientes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Certificados Recientes</h3>
              {sectionsLoading.certs ? (
                <div className="py-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
              ) : (
                <div className="space-y-2">
                  {certificadosRecent.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay certificados recientes</p>
                  ) : (
                    certificadosRecent.map(c => (
                      <div key={c.id} className="p-2 rounded hover:bg-gray-50">
                        <p className="text-sm text-gray-900">{c.nombre_completo}</p>
                        <p className="text-xs text-gray-500">{c.tipo_certificado} • {c.nombre_evento}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Información general */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Información General</h3>
              <p className="text-sm text-gray-600">Panel compacto y optimizado. Los bloques muestran datos reales del sistema para una vista rápida: distribución de roles, usuarios nuevos, reclamaciones y certificados recientes.</p>
              <div className="mt-4 text-xs text-gray-500">Actualizado: {new Date().toLocaleString('es-PE')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

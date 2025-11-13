import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Reclamaciones from './pages/admin/Reclamaciones';
import Cursos from './pages/admin/Cursos';
import ProgramasAdmin from './pages/admin/ProgramasAdmin';
import HorariosAdmin from './pages/admin/HorariosAdmin';
import CursosLibresAdmin from './pages/admin/CursosLibresAdmin';
import ModalPromocionalAdmin from './pages/admin/ModalPromocionalAdmin';
import CifrasLogrosAdmin from './pages/admin/CifrasLogrosAdmin';
import AdminLogin from './pages/admin/AdminLogin';
import Matriculas from './pages/admin/Matriculas';
import Docentes from './pages/admin/Docentes';
import ModulosAdmin from './pages/admin/Modulos';
import CertificadosV2 from './pages/admin/CertificadosV2';
import Configuracion from './pages/admin/Configuracion';
import DocumentosAdmin from './pages/admin/DocumentosAdmin';
import { useToast } from './components/ui';

function Placeholder({ title }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600">Contenido de gestión para {title}.</p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">En desarrollo:</span> Esta sección está siendo desarrollada y estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const inactivityTimerRef = useRef(null);
  const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutos
  const toast = useToast();

  useEffect(() => {
    // Verificar si el usuario está autenticado como admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.role === 'admin') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    try {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
    } catch (_) {}
    setIsAuthenticated(true);
    try {
      toast.success('Inicio de sesión exitoso', {
        title: `Bienvenido${userData?.full_name ? `, ${userData.full_name}` : ''}`,
        duration: 4000,
      });
    } catch (_) {}
    navigate('/panel');
  };

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Limpiar sessionStorage por compatibilidad
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Actualizar estado local
    setIsAuthenticated(false);
    
    // Navegar al login del admin
    navigate('/panel/login');
    
    // Forzar limpieza del estado si es necesario
    setTimeout(() => {
      setIsAuthenticated(false);
    }, 100);
  };

  // Configurar cierre de sesión por inactividad y al cerrar el navegador
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        try {
          // Notificar cierre por inactividad
          toast.warning('Sesión cerrada por 30 minutos de inactividad', {
            title: 'Inactividad detectada',
            duration: 6000,
          });
        } catch (_) {}
        handleLogout();
      }, INACTIVITY_LIMIT_MS);
    };

    // Eventos que indican actividad del usuario
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetInactivityTimer, { passive: true }));

    // Iniciar el temporizador al montar
    resetInactivityTimer();

    // Cerrar sesión al cerrar/recargar el navegador
    const handleBeforeUnload = () => {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } catch (_) {}
      // No navegar aquí: en beforeunload no es fiable, solo limpiar almacenamiento
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Propagar logout entre pestañas
    const handleStorage = (e) => {
      if (e.key === 'token' && !e.newValue) {
        handleLogout();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorage);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login accesible siempre; si hay sesión, redirige al índice */}
      <Route
        path="login"
        element={
          isAuthenticated
            ? <Navigate to="/panel" replace />
            : <AdminLogin onLogin={handleLogin} />
        }
      />

      {/* Área autenticada bajo layout con Outlet */}
      {isAuthenticated && (
        <Route path="/" element={<AdminLayout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="certificados-v2" element={<CertificadosV2 />} />
          <Route path="users" element={<Users token={localStorage.getItem('token')} />} />
          <Route path="programas" element={<ProgramasAdmin />} />
          <Route path="horarios" element={<HorariosAdmin />} />
          <Route path="cursos" element={<Cursos />} />
          <Route path="cursos-libres" element={<CursosLibresAdmin />} />
          <Route path="modal-promocional" element={<ModalPromocionalAdmin />} />
          <Route path="cifras-logros" element={<CifrasLogrosAdmin />} />
          <Route path="documentos" element={<DocumentosAdmin />} />
          <Route path="matriculas" element={<Matriculas />} />
          <Route path="docentes" element={<Docentes />} />
          <Route path="reclamaciones" element={<Reclamaciones />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="modulos" element={<ModulosAdmin />} />
          <Route path="*" element={<Navigate to="/panel" replace />} />
        </Route>
      )}

      {/* Fallback según estado de autenticación */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/panel' : '/panel/login'} replace />} />
    </Routes>
  );
}

export default AdminApp;

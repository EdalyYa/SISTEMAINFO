import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, User, Bell, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import BackToTopButton from './BackToTopButton';
import { useToast } from '../components/ui';

function AdminLayout({ children, onLogout }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const handleLogout = () => {
    try {
      toast.success('Sesión cerrada correctamente', {
        title: 'Salida exitosa',
        duration: 5000,
      });
    } catch (_) {}
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/panel/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Botón móvil para sidebar */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-gray-900 font-semibold text-lg">Panel Administrativo</h1>
                  <p className="text-gray-500 text-xs">Universidad Nacional del Altiplano</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Usuario */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-gray-900 text-sm font-medium">
                    {user?.full_name || user?.username || 'Administrador'}
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    En línea
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={18} />
                </div>
              </div>
              
              {/* Botón de logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </motion.button>
            </div>
          </div>
    </div>
  </header>
  
  {/* Main Content */}
  <div className="flex relative">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out`}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Contenido principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-screen w-full lg:w-auto">
          <div className="w-full">
            {children || <Outlet />}
          </div>
          {/* Botón flotante para volver arriba en páginas largas */}
          <BackToTopButton />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

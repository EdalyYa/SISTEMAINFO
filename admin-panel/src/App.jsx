import React, { useState } from 'react';
import AdminVideosInformativos from '../../src/components/AdminVideoTestimonios.jsx';

function App() {
  const [activeSection, setActiveSection] = useState('videos');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Verificar primero sessionStorage, luego localStorage
    return !!(sessionStorage.getItem('token') || localStorage.getItem('token'));
  });
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:4001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (data.token) {
        // Guardar en sessionStorage para que se borre al cerrar navegador
        sessionStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        alert('Login exitoso');
      } else {
        alert(data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error de conexión');
    }
  };

  const handleLogout = () => {
    // Limpiar tanto localStorage como sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
    setActiveSection('videos');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Panel de Administración</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración INFOUNA</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveSection('videos')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'videos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Videos Informativos
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeSection === 'videos' && <AdminVideosInformativos />}
      </main>
    </div>
  );
}

export default App;
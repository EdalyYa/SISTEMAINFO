import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, Filter, Edit, Trash } from 'lucide-react';
import api, { API_BASE } from '../../config/api';
import { ConfirmModal, useToast } from '../../components/ui';

function Users() {
  const toast = useToast ? useToast() : { success:()=>{}, error:()=>{}, warning:()=>{} };
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // Lista de roles disponibles desde Configuración
  const [rolesList, setRolesList] = useState([{ key: 'user', name: 'User' }, { key: 'admin', name: 'Admin' }]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });

  // URL raíz del backend para endpoints sin prefijo /api
  const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const API_URL = `http://${HOST}:4001`;

  // Unificar la obtención del token desde sessionStorage o localStorage
  const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

  async function fetchUsers() {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = getToken();
      if (!token) {
        setErrorMsg('No autenticado. Inicia sesión primero.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRolesFromConfig() {
    try {
      const { data } = await api.get('/configuracion');
      const rolesObj = data?.data?.seguridad?.roles || {};
      const roles = Object.entries(rolesObj).map(([key, value]) => ({ key, name: value?.name || key }));
      if (roles.length > 0) {
        setRolesList(roles);
        // Si el rol actual no está en la lista, ajustarlo al primero
        setFormData(prev => ({ ...prev, role: roles[0].key }));
      }
    } catch (err) {
      // Si falla, mantenemos ['user','admin']
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setErrorMsg('No autenticado.');
      return;
    }
    // Validación básica
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg('Email no válido');
      return;
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      setErrorMsg('La contraseña debe tener mínimo 6 caracteres');
      return;
    }
    try {
      const url = editingUser 
        ? `${API_URL}/admin/users/${editingUser.id}` 
        : `${API_URL}/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser 
        ? { ...formData, password: formData.password || undefined } 
        : { ...formData, password: formData.password };
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      await fetchUsers();
      resetForm();
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save');
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function handleDelete(id) {
    const u = users.find(x => x.id === id) || { id };
    setUserToDelete(u);
    setConfirmOpen(true);
  }

  async function confirmDeleteUser() {
    if (!userToDelete?.id) { setConfirmOpen(false); return; }
    const token = getToken();
    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      await fetchUsers();
      try { toast.success('Usuario eliminado', { title: 'Eliminación exitosa', duration: 5000 }); } catch(_){}
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete');
      try { toast.error(err.message || 'Error de eliminación', { title: 'Error', duration: 6000 }); } catch(_){}
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  }

  function resetForm() {
    setFormData({ username: '', email: '', password: '', full_name: '', role: 'user' });
    setEditingUser(null);
    setShowAddForm(false);
  }

  function handleEdit(user) {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      full_name: user.full_name || '',
      role: user.role || 'user'
    });
    setEditingUser(user);
    setShowAddForm(true);
  }

  useEffect(() => {
    fetchUsers();
    fetchRolesFromConfig();
  }, []);

  // Derivar usuarios filtrados
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = users.filter(u => {
      const matchesRole = roleFilter ? (u.role === roleFilter) : true;
      const matchesText = q
        ? ((u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q))
        : true;
      return matchesRole && matchesText;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500">Administra usuarios del sistema INFOUNA</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${showAddForm ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Plus size={18} />
            <span>{showAddForm ? 'Cancelar' : 'Agregar Usuario'}</span>
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-300 text-gray-700`}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Cargando...' : 'Recargar'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por username, email o nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los roles</option>
              {rolesList.map(r => (
                <option key={r.key} value={r.key}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">Total: {filteredUsers.length} usuarios</div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {errorMsg}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password (requerido nuevo, opcional al editar)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Nombre Completo"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rolesList.map(r => (
                  <option key={r.key} value={r.key}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingUser ? 'Actualizar' : 'Crear'}
              </button>
              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="p-6 text-gray-600">No hay usuarios registrados</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{idx + 1}</td>
                    <td className="px-4 py-2 text-gray-900">{u.username || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-600">{u.email || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-600">{u.full_name || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ConfirmModal
      isOpen={confirmOpen}
      onClose={() => { if (!deleting) { setConfirmOpen(false); setUserToDelete(null); } }}
      onConfirm={confirmDeleteUser}
      title="Confirmar eliminación"
      message={`Se eliminará el usuario${userToDelete?.username ? ` "${userToDelete.username}"` : ''}. Esta acción es permanente.\n¿Deseas continuar?`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      loading={deleting}
    />
    </div>
  );
}

export default Users;

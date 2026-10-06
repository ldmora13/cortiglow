import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { notify } from '../hooks/useNotification';
import type { User } from '../services/user.service';

export default function Users() {
  const { users = [], isLoadingUsers, createUser, updateUser, updateUserPassword, deleteUser, isCreating, isUpdating, isUpdatingPassword } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'editor' as 'admin' | 'employee'
  });
  const [newPassword, setNewPassword] = useState('');

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'editor' as any
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', name: '', role: 'editor' as any });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, data: { name: formData.name, role: formData.role } });
        notify.success('Usuario actualizado correctamente');
      } else {
        if (!formData.password || formData.password.length < 6) {
          notify.error('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        await createUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          is_active: true
        });
        notify.success('Usuario creado correctamente');
      }
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleOpenPasswordModal = (userId: string) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserId) return;

    if (newPassword.length < 6) {
      notify.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await updateUserPassword({ id: passwordUserId, password: newPassword });
      notify.success('Contraseña actualizada correctamente');
      setIsPasswordModalOpen(false);
      setPasswordUserId(null);
      setNewPassword('');
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (currentUser?.id === userId) {
      notify.error('No puedes eliminar tu propio usuario');
      return;
    }

    const confirmed = await notify.confirm({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar al usuario ${userEmail}?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteUser(userId);
      notify.success('Usuario eliminado correctamente');
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  if (isLoadingUsers) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-300"></div>
    </div>;
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Premium */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8 text-zinc-900 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                Usuarios
              </h1>
              <p className="text-zinc-600 text-base md:text-lg font-medium">
                Gestiona los accesos y roles del sistema
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-md min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda Unificada */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-5 relative group flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex-1 relative flex items-center w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar usuario por nombre o email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-12 pr-12 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium text-sm text-zinc-800 placeholder-zinc-400"
          />
          {searchTerm && (
            <div className="absolute right-3 flex items-center gap-2">
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="p-1.5 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200 hover:text-zinc-800 transition-all active:scale-90"
                title="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="hidden sm:block w-px h-8 bg-zinc-200 mx-2 shrink-0"></div>

        <div className="flex items-center w-full sm:w-auto shrink-0 gap-4">
          <h2 className="text-sm font-bold text-zinc-500 whitespace-nowrap">
            {filteredUsers.length} Resultados
          </h2>
          
          <div className="bg-zinc-100 p-1.5 rounded-xl flex items-center shadow-inner border border-zinc-200/60 shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
              title="Vista de Cuadrícula"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
              title="Vista de Lista"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-zinc-200">
          <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">No hay usuarios</h3>
          <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
            {searchTerm ? 'No encontramos usuarios que coincidan con tu búsqueda.' : 'Crea el primer usuario del sistema.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-sm active:scale-95 transition-all"
            >
              ➕ Crear Primer Usuario
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-right text-xs font-black text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'Sin Nombre'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at && new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => handleOpenPasswordModal(user.id)}
                        className="text-zinc-400 hover:text-amber-600 bg-white hover:bg-amber-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                        title="Cambiar Contraseña"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={currentUser?.id === user.id}
                        className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all disabled:opacity-50"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name || 'Sin Nombre'}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className={`ml-2 px-3 py-1 inline-flex text-xs font-semibold rounded-full flex-shrink-0 ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Registro: {user.created_at && new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => handleOpenModal(user)} className="flex-1 min-w-[100px] px-3 py-2 bg-gray-50 text-amber-500 rounded-lg text-sm font-medium hover:bg-amber-100">Editar</button>
                    <button onClick={() => handleOpenPasswordModal(user.id)} className="flex-1 min-w-[100px] px-3 py-2 bg-gray-50 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-100">Contraseña</button>
                    <button onClick={() => handleDelete(user.id, user.email)} disabled={currentUser?.id === user.id} className={`px-3 py-2 rounded-lg text-sm font-medium ${currentUser?.id === user.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} resultados
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {paginatedUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-6 hover:shadow-md transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-xl font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-lg text-gray-900 truncate">{user.name || 'Sin Nombre'}</h3>
                    <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg shadow-sm ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {user.role}
                </span>
              </div>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-zinc-500 border-t border-zinc-100 pt-3">
                  Registro: {user.created_at && new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(user)} className="flex-1 px-3 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors text-xs text-center shadow-sm">✏️ Editar</button>
                  <button onClick={() => handleOpenPasswordModal(user.id)} className="flex-1 px-3 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-bold hover:bg-zinc-200 transition-colors text-xs text-center shadow-sm">🔑 Clave</button>
                  <button onClick={() => handleDelete(user.id, user.email)} disabled={currentUser?.id === user.id} className={`px-3 py-2 rounded-xl font-bold transition-colors text-xs shadow-sm flex items-center justify-center ${currentUser?.id === user.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-red-200 text-red-500 hover:bg-red-50'}`}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && filteredUsers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} resultados
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="relative p-8 pb-6 border-b border-zinc-100 bg-white z-20">
              <div className="absolute top-6 right-6">
                <button onClick={handleCloseModal} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center border border-green-200/50 shadow-inner">
                  <span className="text-2xl">{editingUser ? '✏️' : '👤'}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    {editingUser ? 'Actualiza los datos del usuario' : 'Registra un nuevo usuario en el sistema'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input type="email" required disabled={!!editingUser} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500" placeholder="usuario@ejemplo.com" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña *</label>
                  <input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="Mínimo 6 caracteres" />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  onBlur={() => {
                    const formattedName = formData.name
                      .split(' ')
                      .filter(w => w)
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(' ');
                    setFormData({ ...formData, name: formattedName });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" 
                  placeholder="Juan Pérez" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rol *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white appearance-none">
                  <option value="editor">👤 Editor / Empleado</option>
                  <option value="admin">⭐ Admin</option>
                </select>
              </div>
              
              {/* Footer Modal */}
              <div className="pt-6 mt-6 border-t border-zinc-100 flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 sm:flex-none px-6 py-3.5 text-zinc-600 bg-white border-2 border-zinc-200 font-bold rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 sm:flex-none px-6 py-3.5 text-white bg-zinc-900 border-2 border-zinc-900 font-bold rounded-xl hover:bg-zinc-800 hover:border-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {(isCreating || isUpdating) ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    editingUser ? 'Guardar Cambios' : 'Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="relative p-8 pb-6 border-b border-zinc-100 bg-white z-20">
              <div className="absolute top-6 right-6">
                <button onClick={() => { setIsPasswordModalOpen(false); setPasswordUserId(null); setNewPassword(''); }} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center border border-red-200/50 shadow-inner">
                  <span className="text-2xl">🔑</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Cambiar Contraseña
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    Asigna una nueva clave al usuario
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña *</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="Mínimo 6 caracteres" />
              </div>
              
              <div className="pt-6 mt-6 border-t border-zinc-100 flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => { setIsPasswordModalOpen(false); setPasswordUserId(null); setNewPassword(''); }}
                  className="flex-1 sm:flex-none px-6 py-3.5 text-zinc-600 bg-white border-2 border-zinc-200 font-bold rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 sm:flex-none px-6 py-3.5 text-white bg-zinc-900 border-2 border-zinc-900 font-bold rounded-xl hover:bg-zinc-800 hover:border-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isUpdatingPassword ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Actualizar Clave'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

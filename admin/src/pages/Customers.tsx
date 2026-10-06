import React, { useState } from 'react';
import { notify } from '../hooks/useNotification';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer } from '../types/customer.types';

export default function Customers() {
  const { customers = [], isLoadingCustomers, createCustomer, updateCustomer, deleteCustomer, isCreating, isUpdating } = useCustomers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined
      };

      if (editingCustomer) {
        await updateCustomer({ id: editingCustomer.id, data: dataToSend });
        notify.success('Cliente actualizado exitosamente');
      } else {
        await createCustomer(dataToSend);
        notify.success('Cliente creado exitosamente');
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await notify.confirm({
      title: 'Eliminar Cliente',
      message: `¿Eliminar cliente ${name}?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteCustomer(id);
      notify.success('Cliente eliminado exitosamente');
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      address: ''
    });
    setEditingCustomer(null);
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        city: customer.city || '',
        address: customer.address || ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  if (isLoadingCustomers) return <div className="flex justify-center p-8"><div className="animate-spin h-12 w-12 border-b-2 border-zinc-300 rounded-full"></div></div>;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200 text-zinc-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                Clientes
              </h1>
              <p className="text-zinc-600 text-base md:text-lg font-medium">
                {customers.length} clientes registrados
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-md min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Cliente
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
            placeholder="Buscar cliente por nombre, email o teléfono..."
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
            {filteredCustomers.length} Resultados
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

      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-zinc-200">
          <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-2xl font-black text-zinc-800 mb-3">No hay clientes</h3>
          <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
            {searchTerm ? 'No encontramos clientes que coincidan con tu búsqueda.' : 'Aún no has registrado ningún cliente en el sistema.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95"
            >
              ➕ Crear Primer Cliente
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                          👤
                        </div>
                        <div className="font-bold text-zinc-900">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 flex items-center gap-1">📱 {customer.phone}</div>
                      {customer.email && <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">📧 {customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-900">{customer.city || '—'}</div>
                      {customer.address && <div className="text-xs text-zinc-500 mt-1 max-w-[200px] truncate">{customer.address}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(customer)}
                          className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
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
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} resultados
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
        {paginatedCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-6 hover:shadow-md hover:border-zinc-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-2xl text-white">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-gray-900 truncate group-hover:text-zinc-600 transition-colors">{customer.name}</h3>
                <p className="text-sm font-semibold text-zinc-600 flex items-center gap-1 mt-1">
                  📱 {customer.phone}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {customer.email && (
                <p className="text-sm text-zinc-600 flex items-center gap-2 truncate">
                  <span className="text-base">📧</span>
                  <span className="truncate">{customer.email}</span>
                </p>
              )}
              {customer.city && (
                <p className="text-sm text-zinc-600 flex items-center gap-2">
                  <span className="text-base">📍</span>
                  {customer.city}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-zinc-100 mt-auto">
              <button
                onClick={() => openModal(customer)}
                className="flex-1 px-3 py-2.5 bg-zinc-900 text-white shadow-sm transition-all text-sm font-bold rounded-xl hover:bg-zinc-800 active:scale-95"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => handleDelete(customer.id, customer.name)}
                title="Eliminar" className="px-3 py-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all text-sm font-bold rounded-xl active:scale-95 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {viewMode === 'grid' && filteredCustomers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} resultados
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
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200/50 shadow-inner">
                  <span className="text-2xl">{editingCustomer ? '✏️' : '➕'}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    {editingCustomer ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente en el sistema'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Nombre Completo *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  onBlur={() => {
                    const formattedName = formData.name
                      .split(' ')
                      .filter(w => w)
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(' ');
                    setFormData({ ...formData, name: formattedName });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📱 Teléfono *
                </label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📧 Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📍 Ciudad
                  </label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    onBlur={() => {
                      const formattedCity = formData.city
                        .split(' ')
                        .filter(w => w)
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                      setFormData({ ...formData, city: formattedCity });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🏠 Dirección
                  </label>
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>

              {/* Footer Modal */}
              <div className="pt-6 mt-6 border-t border-zinc-100 flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'
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

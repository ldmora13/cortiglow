import React, { useState } from 'react';
import { notify } from '../hooks/useNotification';
import { useProviders } from '../hooks/useProviders';
import type { Provider } from '../types/product.types';
import { Truck } from 'lucide-react';

export default function Providers() {
  const { providers = [], isLoading, createProvider, updateProvider, deleteProvider, isCreating, isUpdating } = useProviders();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [formData, setFormData] = useState({
    name: '',
    nit: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    delivery_time: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        name: formData.name,
        nit: formData.nit || undefined,
        contact_name: formData.contact_name || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        delivery_time: formData.delivery_time || undefined,
        notes: formData.notes || undefined,
      };

      if (editingProvider) {
        await updateProvider({ id: editingProvider.id, ...dataToSend });
        notify.success('Proveedor actualizado exitosamente');
      } else {
        await createProvider(dataToSend);
        notify.success('Proveedor creado exitosamente');
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await notify.confirm({
      title: 'Eliminar Proveedor',
      message: `¿Estás seguro que deseas eliminar el proveedor "${name}"?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteProvider(id);
      notify.success('Proveedor eliminado exitosamente');
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nit: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      delivery_time: '',
      notes: ''
    });
    setEditingProvider(null);
  };

  const openModal = (provider?: Provider) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        nit: provider.nit || '',
        contact_name: provider.contact_name || '',
        email: provider.email || '',
        phone: provider.phone || '',
        address: provider.address || '',
        delivery_time: provider.delivery_time || '',
        notes: provider.notes || ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-12 w-12 border-b-2 border-zinc-300 rounded-full"></div></div>;

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nit?.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProviders = filteredProviders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200 text-zinc-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                <Truck className="w-8 h-8 text-amber-500" />
                Proveedores
              </h1>
              <p className="text-zinc-600 text-base md:text-lg font-medium">
                {providers.length} proveedores registrados
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-md min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proveedor
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
            placeholder="Buscar proveedor por nombre, NIT o email..."
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
            {filteredProviders.length} Resultados
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

      {filteredProviders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-zinc-200">
          <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Truck className="w-12 h-12 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-black text-zinc-800 mb-3">No hay proveedores</h3>
          <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
            {searchTerm ? 'No encontramos proveedores que coincidan con tu búsqueda.' : 'Aún no has registrado ningún proveedor en el sistema.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95"
            >
              ➕ Añadir Primer Proveedor
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                  <th className="p-5 font-black text-xs uppercase tracking-wider text-zinc-500 w-1/4">Empresa</th>
                  <th className="p-5 font-black text-xs uppercase tracking-wider text-zinc-500">Contacto</th>
                  <th className="p-5 font-black text-xs uppercase tracking-wider text-zinc-500">Ubicación / T. Entrega</th>
                  <th className="p-5 font-black text-xs uppercase tracking-wider text-zinc-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0 border border-amber-200/50">
                          <span className="font-bold text-amber-700 text-sm">
                            {provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 leading-tight">{provider.name}</p>
                          {provider.nit && <p className="text-xs font-semibold text-zinc-500 mt-0.5">NIT: {provider.nit}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {provider.contact_name || 'Sin contacto'}
                        </p>
                        <p className="text-sm font-medium text-zinc-600 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {provider.phone || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-600 truncate max-w-[200px]" title={provider.address}>
                          {provider.address || 'Sin dirección'}
                        </p>
                        {provider.delivery_time && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {provider.delivery_time}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(provider)}
                          className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                          title="Editar Proveedor"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id, provider.name)}
                          className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                          title="Eliminar Proveedor"
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
          {filteredProviders.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProviders.length)} de {filteredProviders.length} resultados
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProviders.map(provider => (
            <div key={provider.id} className="bg-white rounded-3xl p-6 border border-zinc-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 transition-all group relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-zinc-100">
                <button onClick={() => openModal(provider)} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => handleDelete(provider.id, provider.name)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-5 border border-amber-200/50 shadow-inner">
                <span className="font-black text-xl text-amber-700">
                  {provider.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h3 className="font-black text-lg text-zinc-900 mb-1 leading-tight pr-12 line-clamp-2" title={provider.name}>
                {provider.name}
              </h3>
              
              {provider.nit && (
                <p className="text-xs font-bold text-zinc-500 mb-4 inline-block bg-zinc-100 px-2 py-0.5 rounded-md">
                  NIT: {provider.nit}
                </p>
              )}

              <div className="space-y-2.5 mt-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2.5 text-sm">
                  <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="font-medium text-zinc-700 truncate" title={provider.contact_name}>{provider.contact_name || 'Sin contacto'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="font-medium text-zinc-700">{provider.phone || 'Sin teléfono'}</span>
                </div>
                {provider.delivery_time && (
                  <div className="flex items-center gap-2.5 text-sm mt-3 bg-amber-50 p-2 rounded-lg border border-amber-100 text-amber-800">
                    <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-bold text-xs">Entrega: {provider.delivery_time}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && filteredProviders.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProviders.length)} de {filteredProviders.length} resultados
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border border-amber-200/50 shadow-inner">
                  <Truck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    {editingProvider ? 'Actualiza los datos del proveedor' : 'Registra un nuevo proveedor en el sistema'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-bold text-zinc-700">Nombre de Empresa <span className="text-amber-500">*</span></label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    onBlur={() => {
                      const formatted = formData.name.split(' ').filter(w => w).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      setFormData({ ...formData, name: formatted });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Ej. Distribuidora XYZ"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-zinc-700">NIT o Documento</label>
                  <input
                    value={formData.nit}
                    onChange={(e) => setFormData({...formData, nit: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Ej. 900.123.456-7"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-zinc-700">Tiempo de Entrega</label>
                  <input
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Ej. 3-5 días hábiles"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-zinc-700">Nombre del Contacto</label>
                  <input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    onBlur={() => {
                      const formatted = formData.contact_name.split(' ').filter(w => w).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      setFormData({ ...formData, contact_name: formatted });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-zinc-700">Teléfono</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Ej. 300 123 4567"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-bold text-zinc-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="ejemplo@proveedor.com"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-bold text-zinc-700">Dirección</label>
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="Dirección, Ciudad"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-bold text-zinc-700">Notas / Condiciones Comerciales</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all custom-scrollbar resize-none"
                    placeholder="Ej. Pago a 30 días, flete asumido por proveedor..."
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
                    editingProvider ? 'Guardar Cambios' : 'Crear Proveedor'
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

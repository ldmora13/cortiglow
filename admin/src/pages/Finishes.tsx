import React, { useState } from 'react';
import { useFinishes } from '../hooks/useFinishes';
import { formatCOP } from '../utils/currency';
import { notify } from '../hooks/useNotification';
import clsx from 'clsx';
import type { Finish } from '../services/finish.service';

export default function Finishes() {
  const { finishes = [], isLoadingFinishes, createFinish, updateFinish, deleteFinish, isCreating, isUpdating, isDeleting } = useFinishes();
  
  const [showModal, setShowModal] = useState(false);
  const [editingFinish, setEditingFinish] = useState<Finish | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_type: 'FIXED' as 'FIXED' | 'PER_METER' | 'PERCENTAGE',
    price: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      if (editingFinish) {
        await updateFinish({ id: editingFinish.id, data: payload });
        notify.success('Terminación actualizada exitosamente');
      } else {
        await createFinish(payload);
        notify.success('Terminación creada exitosamente');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      notify.error('Error al guardar terminación');
    }
  };

  const handleEdit = (finish: Finish) => {
    setEditingFinish(finish);
    setFormData({
      name: finish.name,
      description: finish.description || '',
      price_type: finish.price_type as 'FIXED' | 'PER_METER' | 'PERCENTAGE',
      price: finish.price.toString(),
      is_active: finish.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await notify.confirm({
      title: 'Desactivar Terminación',
      message: '¿Estás seguro de desactivar esta terminación?',
      confirmText: 'Desactivar',
      type: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
      await deleteFinish(id);
      notify.success('Terminación desactivada exitosamente');
    } catch (error) {
      notify.error('Error al desactivar terminación');
    }
  };

  const handleToggleActive = async (finish: Finish) => {
    try {
      await updateFinish({ id: finish.id, data: { is_active: !finish.is_active } });
    } catch (error) {
      notify.error('Error al cambiar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_type: 'FIXED',
      price: '',
      is_active: true
    });
    setEditingFinish(null);
  };

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case 'FIXED': return 'Precio Fijo';
      case 'PER_METER': return 'Por Metro';
      case 'PERCENTAGE': return 'Porcentaje';
      default: return type;
    }
  };

  const getPriceDisplay = (finish: Finish) => {
    switch (finish.price_type) {
      case 'FIXED': return formatCOP(finish.price);
      case 'PER_METER': return `${formatCOP(finish.price)}/m`;
      case 'PERCENTAGE': return `${finish.price}%`;
      default: return formatCOP(finish.price);
    }
  };

  if (isLoadingFinishes) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredFinishes = finishes.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFinishes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFinishes = filteredFinishes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-5 pb-20 md:pb-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
                Terminaciones
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                Gestiona las terminaciones para nuestras cortinas
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Terminación
            </button>
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
            placeholder="Buscar terminación por nombre o descripción..."
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
            {filteredFinishes.length} Resultados
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

      {filteredFinishes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-zinc-200">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 16h6" /></svg></div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">No hay terminaciones</h3>
          <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
            {searchTerm ? 'No encontramos terminaciones que coincidan con tu búsqueda.' : 'Crea la primera terminación para cortinas'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-sm"
            >
              Crear Primera Terminación
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipo de Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {paginatedFinishes.map((finish) => (
                <tr key={finish.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-gray-900">{finish.name}</div></td>
                  <td className="px-6 py-4"><div className="text-sm text-zinc-600 max-w-xs truncate">{finish.description || '—'}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm",
                      finish.price_type === 'FIXED' && "bg-gray-500 text-white",
                      finish.price_type === 'PER_METER' && "bg-green-500 text-white",
                      finish.price_type === 'PERCENTAGE' && "bg-orange-500 text-white"
                    )}>
                      {getPriceTypeLabel(finish.price_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-lg font-bold text-zinc-800">{getPriceDisplay(finish)}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(finish)}
                      disabled={isUpdating}
                      className={clsx("relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner disabled:opacity-50", finish.is_active ? "bg-green-500" : "bg-gray-300")}
                    >
                      <span className={clsx("inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md", finish.is_active ? "translate-x-6" : "translate-x-1")} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(finish)}
                        className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      {finish.is_active && (
                        <button
                          onClick={() => handleDelete(finish.id)}
                          disabled={isDeleting}
                          className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all disabled:opacity-50"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filteredFinishes.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredFinishes.length)} de {filteredFinishes.length} resultados
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
          {paginatedFinishes.map((finish) => (
            <div key={finish.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-6 hover:shadow-md transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 16h6 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <button
                  onClick={() => handleToggleActive(finish)}
                  disabled={isUpdating}
                  className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-inner disabled:opacity-50", finish.is_active ? "bg-green-500" : "bg-gray-300")}
                >
                  <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md", finish.is_active ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
              <h3 className="font-bold text-lg text-gray-900 truncate mb-1">{finish.name}</h3>
              <p className="text-sm text-zinc-600 line-clamp-2 mb-4 h-10">{finish.description || 'Sin descripción'}</p>
              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className={clsx(
                    "px-2.5 py-1 rounded-lg text-xs font-bold",
                    finish.price_type === 'FIXED' && "bg-gray-200 text-gray-700",
                    finish.price_type === 'PER_METER' && "bg-green-100 text-green-700",
                    finish.price_type === 'PERCENTAGE' && "bg-orange-100 text-orange-700"
                  )}>
                    {getPriceTypeLabel(finish.price_type)}
                  </span>
                  <span className="text-lg font-bold text-zinc-800">{getPriceDisplay(finish)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(finish)} className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors text-sm">Editar</button>
                  {finish.is_active && (
                    <button onClick={() => handleDelete(finish.id)} disabled={isDeleting} className="px-4 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50 text-sm">Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && filteredFinishes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredFinishes.length)} de {filteredFinishes.length} resultados
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="relative p-5 pb-4 border-b border-zinc-100 bg-white z-20">
              <div className="absolute top-4 right-4">
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-zinc-900">
                    {editingFinish ? 'Editar Terminación' : 'Nueva Terminación'}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    {editingFinish ? 'Actualiza los detalles de la terminación' : 'Añade un nuevo tipo de acabado'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre *</label>
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
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Precio *</label>
                <select value={formData.price_type} onChange={(e) => setFormData({ ...formData, price_type: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all">
                  <option value="FIXED">Precio Fijo</option>
                  <option value="PER_METER">Por Metro Lineal</option>
                  <option value="PERCENTAGE">Porcentaje sobre Tela</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{formData.price_type === 'PERCENTAGE' ? 'Porcentaje *' : 'Precio *'}</label>
                <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-zinc-600 border-gray-300 rounded focus:ring-zinc-900" />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-700">Terminación activa</label>
              </div>
              {/* Footer Modal */}
              <div className="pt-6 mt-6 border-t border-zinc-100 flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
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
                    editingFinish ? 'Actualizar Terminación' : 'Crear Terminación'
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

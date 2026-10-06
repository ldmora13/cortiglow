import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { useCategories } from '../hooks/useCategories';
import StockBadge from '../components/StockBadge';
import { formatCOP } from '../utils/currency';
import { getCategoryLevelName, getCategoryDepth, getCategoryLevelBadgeColors } from '../utils/categoryUtils';
import { notify } from '../hooks/useNotification';
import { useAuth } from '../context/AuthContext';
import { History, AlertTriangle, Package, Folder, MapPin, Edit3, Search } from 'lucide-react';
import { api } from '../lib/api';

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  min_stock: number;
  location: string | null;
  last_restock: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    images: string[];
    category: { id: string; name: string } | null;
  };
  is_low_stock: boolean;
}

export default function Inventory() {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { inventory, isLoadingInventory, refetchInventory } = useInventory(
    showLowStockOnly ? { lowStock: true } : undefined
  );
  const { categories } = useCategories();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [initializing, setInitializing] = useState(false);



  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      // Usamos el endpoint de adjust, no el de update, porque el adjust maneja movimientos también
      await api.post(`/inventory/${selectedItem.id}/adjust`, {
        quantity: parseInt(adjustQuantity),
        reason: adjustReason,
        performed_by: user?.email || 'Usuario Admin'
      });
      
      notify.success('Stock ajustado correctamente');
      setIsModalOpen(false);
      setAdjustQuantity('');
      setAdjustReason('');
      setSelectedItem(null);
      refetchInventory();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al ajustar stock');
    }
  };

  if (isLoadingInventory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-300"></div>
      </div>
    );
  }

  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.product.sku && item.product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (showLowStockOnly) {
      return matchesSearch && item.quantity <= item.min_stock;
    }
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8 text-zinc-900 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                Inventario
              </h1>
              <p className="text-zinc-600 text-base md:text-lg font-medium">
                {inventory.length} productos en stock
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">

              <button
                onClick={() => { setShowLowStockOnly(!showLowStockOnly); setCurrentPage(1); }}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm ${showLowStockOnly ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50'}`}
              >
                <AlertTriangle className={`w-5 h-5 mr-2 ${showLowStockOnly ? 'text-amber-600' : 'text-zinc-400'}`} />
                {showLowStockOnly ? 'Ver Todo' : 'Solo Stock Bajo'}
              </button>
              
              <Link
                to="/inventory/movements"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-sm"
              >
                <History className="w-5 h-5 mr-2" />
                Ver Movimientos
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-5 relative group flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 relative flex items-center w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-12 pr-12 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium text-sm text-zinc-800 placeholder-zinc-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200 hover:text-zinc-800 transition-all active:scale-90"
                    title="Limpiar búsqueda"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              <div className="hidden sm:block w-px h-8 bg-zinc-200 mx-2"></div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <h2 className="text-sm font-bold text-zinc-500 whitespace-nowrap">
                  {filteredInventory.length} Resultados
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
          </div>
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-zinc-200 border-dashed shadow-sm">
          <Search className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No se encontraron productos en inventario.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {paginatedInventory.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-all group flex flex-col relative">
              {item.product.images[0] ? (
                <div className="aspect-video bg-white border-b border-zinc-100 overflow-hidden relative">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ) : (
                <div className="aspect-video bg-zinc-50 border-b border-zinc-100 flex items-center justify-center">
                  <Package className="w-12 h-12 text-zinc-300" />
                </div>
              )}
              <div className="p-4 md:p-5 flex flex-col flex-1">
                <h3 className="font-black text-lg text-gray-900 mb-1 truncate group-hover:text-zinc-600 transition-colors">{item.product.name}</h3>
                {item.product.sku && <p className="text-xs font-bold text-amber-600 mb-2">{item.product.sku}</p>}
                <div className="flex flex-col gap-2 mb-4">
                  {item.product.category ? (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                        <Folder className="w-3 h-3" />
                        {item.product.category.name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] border ${getCategoryLevelBadgeColors(getCategoryDepth(categories, item.product.category.id))}`}>
                        {getCategoryLevelName(categories, item.product.category.id)}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                      <Folder className="w-3 h-3" />
                      Sin categoría
                    </span>
                  )}
                </div>
                <p className="text-xl font-black text-zinc-800 mb-4">{formatCOP(item.product.price)}</p>
                <div className="space-y-3 mb-4 mt-auto">
                  <div className="flex justify-between items-center bg-white border border-zinc-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-zinc-700">Stock:</span>
                    <StockBadge quantity={item.quantity} minStock={item.min_stock} />
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-2.5">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{item.location}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} className="w-full px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all font-bold rounded-xl active:scale-95 flex items-center justify-center gap-2">
                  <Edit3 className="w-4 h-4" /> Ajustar Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {paginatedInventory.map((item: any) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center">
                          {item.product.images[0] ? <img className="h-full w-full object-cover" src={item.product.images[0]} alt="" /> : <Package className="w-6 h-6 text-zinc-300" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-zinc-900">{item.product.name}</div>
                          {item.product.sku && <div className="text-xs font-bold text-amber-600">{item.product.sku}</div>}
                          {item.location && <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 font-medium"><MapPin className="w-3 h-3" />{item.location}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.product.category ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                            <Folder className="w-3 h-3" />
                            {item.product.category.name}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] border ${getCategoryLevelBadgeColors(getCategoryDepth(categories, item.product.category.id))}`}>
                            {getCategoryLevelName(categories, item.product.category.id)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                          <Folder className="w-3 h-3" />
                          Sin categoría
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-zinc-900">{formatCOP(item.product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center"><div className="flex justify-center"><StockBadge quantity={item.quantity} minStock={item.min_stock} /></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} 
                          className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                          title="Ajustar Stock"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-zinc-100">
            {paginatedInventory.map((item: any) => (
              <div key={item.id} className="p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.product.images[0] ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-zinc-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 truncate">{item.product.name}</h3>
                    {item.product.sku && <p className="text-xs font-bold text-amber-600 mt-0.5">{item.product.sku}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <StockBadge quantity={item.quantity} minStock={item.min_stock} />
                      {item.location && <span className="text-xs text-zinc-600 font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                    </div>
                    <p className="text-sm font-black text-zinc-900 mt-2">{formatCOP(item.product.price)}</p>
                    <button onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} className="mt-3 w-full px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 flex justify-center items-center gap-1.5">
                      <Edit3 className="w-4 h-4" /> Ajustar Stock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredInventory.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredInventory.length)} de {filteredInventory.length} resultados
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
      )}

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200" onClick={e => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="relative p-8 pb-6 border-b border-zinc-100 bg-white z-20">
              <div className="absolute top-6 right-6">
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border border-amber-200/50 shadow-inner">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Ajustar Stock
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    Modificar inventario para este producto
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex justify-between items-center">
                <span className="font-bold text-zinc-700 truncate mr-4">{selectedItem.product.name}</span>
                <span className="bg-zinc-900 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap">
                  Stock actual: {selectedItem.quantity}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad (+ para sumar, - para restar) *</label>
                <input type="number" required value={adjustQuantity} onChange={(e) => setAdjustQuantity(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="Ej: 10 o -5" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Razón *</label>
                <input type="text" required value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="Ej: Compra, Ajuste manual" />
              </div>

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
                  className="flex-1 sm:flex-none px-6 py-3.5 text-white bg-zinc-900 border-2 border-zinc-900 font-bold rounded-xl hover:bg-zinc-800 hover:border-zinc-800 transition-all shadow-md active:scale-95 flex items-center justify-center min-w-[120px]"
                >
                  Ajustar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

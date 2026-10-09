import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP } from '../utils/currency';
import { notify } from '../hooks/useNotification';
import { useProducts } from '../hooks/useProducts';
import { getCategoryLevelName, getCategoryDepth, getCategoryLevelBadgeColors } from '../utils/categoryUtils';
import { Folder } from 'lucide-react';

export default function Products() {
  const { products, categories, isLoadingProducts, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await notify.confirm({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de eliminar "${name}"?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      notify.success('Producto eliminado exitosamente');
    } catch (error) {
      notify.error('Error al eliminar el producto');
    }
  };

  const handleBulkDelete = async () => {
    const items = products.filter(p => selectedIds.includes(p.id));
    if (items.length === 0) return;
    const confirmed = await notify.confirm({
      title: `Eliminar ${items.length} producto${items.length > 1 ? 's' : ''}`,
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      await Promise.all(items.map(p => deleteProduct(p.id)));
      notify.success(`${items.length} producto${items.length > 1 ? 's eliminados' : ' eliminado'}`);
      setSelectedIds([]);
    } catch (error) {
      notify.error('No se pudieron eliminar todos los productos');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const toggleSelectPage = () => {
    const pageIds = paginatedProducts.map(p => p.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev => allSelected ? prev.filter(id => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]);
  };

  const cell = density === 'compact' ? 'px-4 py-2' : 'px-6 py-4';

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-300 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Productos
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            {products.length} productos en catálogo
          </p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      {/* Barra de Búsqueda y Filtros Unificada */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-5 relative group flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex-1 relative flex items-center w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar productos..."
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

        <div className="hidden sm:block w-px h-8 bg-zinc-200 mx-2"></div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <h2 className="text-sm font-bold text-zinc-500 whitespace-nowrap">
            {filteredProducts.length} Resultados
          </h2>
          
          <div className="bg-zinc-100 p-1.5 rounded-xl flex items-center shadow-inner border border-zinc-200/60 shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              aria-label="Vista de cuadrícula"
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
              title="Vista de Cuadrícula"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              aria-label="Vista de lista"
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
              title="Vista de Lista"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
            </button>
          </div>
          {viewMode === 'list' && (
            <button
              onClick={() => setDensity(d => d === 'compact' ? 'comfortable' : 'compact')}
              aria-pressed={density === 'compact'}
              title={density === 'compact' ? 'Vista cómoda' : 'Vista densa'}
              className="px-3 py-2 min-h-[44px] rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
            >
              {density === 'compact' ? 'Cómodo' : 'Denso'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk bar */}
      {viewMode === 'list' && selectedIds.length > 0 && (
        <div className="bg-zinc-900 text-white rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" role="status">
          <span className="text-sm font-semibold">{selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}</span>
          <span className="flex gap-2 sm:ml-auto">
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="px-3.5 py-2 min-h-[40px] rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
            >
              {bulkDeleting ? 'Eliminando…' : 'Eliminar'}
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 min-h-[40px] rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
            >
              Limpiar
            </button>
          </span>
        </div>
      )}

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
          </h3>
          <p className="text-zinc-600 mb-6">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando el primer producto'}
          </p>
          {!searchTerm && (
            <Link
              to="/products/new"
              className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white shadow-sm transition-all rounded-lg hover:bg-blue-700"
            >
              Agregar Producto
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md hover:border-zinc-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              <div className="aspect-square bg-white border-b border-zinc-100 overflow-hidden relative">
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-4 md:p-5 flex flex-col flex-1">
                <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-zinc-600 transition-colors" title={product.name}>
                  {product.name}
                </h3>
                {product.sku && (
                  <p className="text-xs font-bold text-amber-600 mb-2">{product.sku}</p>
                )}
                <div className="flex flex-col gap-2 mb-4">
                  {product.category ? (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                        <Folder className="w-3 h-3" />
                        {product.category.name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] border ${getCategoryLevelBadgeColors(getCategoryDepth(categories, product.category.id))}`}>
                        {getCategoryLevelName(categories, product.category.id)}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                      <Folder className="w-3 h-3" />
                      Sin categoría
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg md:text-xl font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg">
                      {formatCOP(product.price)}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-white">
                <tr>
                  <th className={`${cell} w-10`}>
                    <input
                      type="checkbox"
                      aria-label="Seleccionar página"
                      checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id))}
                      onChange={toggleSelectPage}
                      className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                    />
                  </th>
                  <th className={`${cell} text-left text-xs font-bold text-zinc-500 uppercase tracking-wider`}>Producto</th>
                  <th className={`${cell} text-left text-xs font-bold text-zinc-500 uppercase tracking-wider`}>SKU</th>
                  <th className={`${cell} text-left text-xs font-bold text-zinc-500 uppercase tracking-wider`}>Categoría</th>
                  <th className={`${cell} text-left text-xs font-bold text-zinc-500 uppercase tracking-wider`}>Precio</th>
                  <th className={`${cell} text-right text-xs font-bold text-zinc-500 uppercase tracking-wider`}>Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className={`${cell} whitespace-nowrap w-10`}>
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${product.name}`}
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                      />
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-white rounded-lg border border-zinc-100 overflow-hidden">
                          <img
                            className="h-12 w-12 object-cover group-hover:scale-110 transition-transform duration-300"
                            src={product.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{product.name}</div>
                          {product.description && density === 'comfortable' && (
                            <div className="text-xs text-zinc-500 line-clamp-1 max-w-xs">{product.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>
                      <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-md bg-amber-100 text-amber-800">
                        {product.sku || '-'}
                      </span>
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>
                      {product.category ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                            <Folder className="w-3 h-3" />
                            {product.category.name}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] border ${getCategoryLevelBadgeColors(getCategoryDepth(categories, product.category.id))}`}>
                            {getCategoryLevelName(categories, product.category.id)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                          <Folder className="w-3 h-3" />
                          Sin categoría
                        </span>
                      )}
                    </td>
                    <td className={`${cell} whitespace-nowrap text-sm font-bold text-zinc-900`}>
                      {formatCOP(product.price)}
                    </td>
                    <td className={`${cell} whitespace-nowrap text-right text-sm font-medium`}>
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} resultados
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

      {viewMode === 'grid' && filteredProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} resultados
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
  );
}

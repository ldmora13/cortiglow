import React, { useState, useRef } from 'react';
import { useCategories } from '../hooks/useCategories';
import { notify } from '../hooks/useNotification';
import { getCategoryLevelName } from '../utils/categoryUtils';
import type { Category } from '../services/category.service';

export default function Categories() {
  const { categories, isLoadingCategories, createCategory, updateCategory, deleteCategory, isCreating, isUpdating, isDeleting } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    parent_id: ''
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setIsSubcategoryMode(!!category.parent_id);
      setFormData({
        name: category.name,
        slug: category.slug,
        image_url: category.image_url || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setEditingCategory(null);
      setIsSubcategoryMode(false);
      setFormData({ name: '', slug: '', image_url: '', parent_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setIsSubcategoryMode(false);
    setFormData({ name: '', slug: '', image_url: '', parent_id: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: formData });
        notify.success('Categoría actualizada correctamente');
      } else {
        await createCategory(formData);
        notify.success('Categoría creada correctamente');
      }
      handleCloseModal();
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Error al guardar categoría');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await notify.confirm({
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de eliminar la categoría "${name}"?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteCategory(id);
      notify.success('Categoría eliminada correctamente');
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Error al eliminar categoría');
    }
  };

  const getCategoryPath = (categoryId: string) => {
    const path: Category[] = [];
    let current = categories.find(c => c.id === categoryId);
    while (current && current.parent_id) {
      const parent = categories.find(c => c.id === current!.parent_id);
      if (parent && !path.find(p => p.id === parent.id)) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return path;
  };

  const filteredCategories = categories.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const fullPathName = [...getCategoryPath(c.id).map(p => p.name), c.name].join(' ').toLowerCase();
    const slugLower = c.slug.toLowerCase();
    return fullPathName.includes(searchLower) || slugLower.includes(searchLower);
  });

  // Ordenamos las categorías por su "Ruta de Pan" (Breadcrumb path)
  // De esta forma en la grilla aparecerán agrupadas: Padre -> Hijo -> Nieto
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const pathA = [...getCategoryPath(a.id).map(p => p.name), a.name].join(' > ');
    const pathB = [...getCategoryPath(b.id).map(p => p.name), b.name].join(' > ');
    return pathA.localeCompare(pathB);
  });

  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = sortedCategories.slice(startIndex, startIndex + itemsPerPage);

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-300 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 md:pb-6 w-full">
      {/* Header Estándar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
                Categorías
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                {categories.length} familias organizando nuestros productos
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Categoría
            </button>
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
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nombre, familia o URL (Ej: cortinas-blackout)..."
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
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  searchInputRef.current?.focus();
                }}
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
            {sortedCategories.length} Resultados
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

      {/* Listado de Categorías */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-zinc-100">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">
            {searchTerm ? 'No encontramos coincidencias' : 'Aún no hay categorías'}
          </h3>
          <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto font-medium">
            {searchTerm ? 'Prueba escribiendo el nombre de otra forma.' : 'Organiza tu catálogo creando tu primera familia de productos.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-8 py-4 bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 transition-all rounded-2xl font-bold hover:bg-zinc-800 hover:-translate-y-1 active:scale-95"
            >
              Agregar la primera
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Ruta</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-white rounded-lg border border-zinc-100 overflow-hidden flex items-center justify-center">
                          {category.image_url ? (
                            <img className="h-12 w-12 object-cover group-hover:scale-110 transition-transform duration-300" src={category.image_url} alt={category.name} onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=NA'}} />
                          ) : (
                            <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{category.name}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            {(() => {
                              const depth = getCategoryPath(category.id).length;
                              if (depth === 0) return <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Principal</span>;
                              if (depth === 1) return <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">Subcategoría (2do Nivel)</span>;
                              return <span className="inline-flex items-center text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">Subcategoría (3er Nivel)</span>;
                            })()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg shadow-sm w-fit">
                        <svg className="w-3.5 h-3.5 mr-1 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        /{category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1.5 w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        {category.product_count || 0} Prods
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={isDeleting}
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
          {sortedCategories.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedCategories.length)} de {sortedCategories.length} resultados
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {paginatedCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200 hover:-translate-y-2 transition-all duration-500 group flex flex-col relative">
              
              {/* Category Image */}
              <div className="bg-zinc-100 relative overflow-hidden flex-shrink-0 h-56">
                {category.image_url ? (
                  <>
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Sin+Imagen'}} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="absolute top-4 right-4">
                  <div className="bg-amber-500 text-zinc-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    {category.product_count || 0} Prods
                  </div>
                </div>
              </div>

              {/* Category Info */}
              <div className="p-6 flex flex-col flex-1 relative">
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-2xl text-zinc-900 leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">{category.name}</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <div className="flex items-center text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg shadow-sm">
                      <svg className="w-3.5 h-3.5 mr-1 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      /{category.slug}
                    </div>
                    
                    {(() => {
                      const path = getCategoryPath(category.id);
                      const depth = path.length;
                      if (depth === 0) {
                        return (
                          <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm">
                            <svg className="w-3.5 h-3.5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            Principal
                          </div>
                        );
                      }
                      if (depth === 1) {
                        return (
                          <div className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg shadow-sm truncate">
                            <svg className="w-3.5 h-3.5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="truncate">2do Nivel (De: {path.map(p => p.name).join(' > ')})</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg shadow-sm truncate">
                          <svg className="w-3.5 h-3.5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="truncate">3er Nivel (De: {path.map(p => p.name).join(' > ')})</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex gap-3 shrink-0 mt-auto pt-6 border-t border-zinc-100">
                  <button onClick={() => handleOpenModal(category)} className="flex-1 px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 text-sm font-bold rounded-xl flex items-center justify-center gap-2 group/btn">
                    <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(category.id, category.name)} disabled={isDeleting} className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm font-bold rounded-xl flex items-center justify-center disabled:opacity-50 group/btn shrink-0">
                    <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && sortedCategories.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedCategories.length)} de {sortedCategories.length} resultados
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

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200">
            {/* Header Modal */}
            <div className="relative p-5 pb-4 border-b border-zinc-100 bg-white z-20">
              <div className="absolute top-4 right-4">
                <button onClick={handleCloseModal} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200/50 shadow-inner">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-zinc-900">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    {editingCategory ? 'Actualiza los detalles de la categoría' : 'Añade una nueva familia de productos'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-zinc-700">Nombre de la Categoría <span className="text-amber-500">*</span></label>
                <input 
                  required 
                  type="text" 
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" 
                  placeholder="Ej: Cortinas Enrollables" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-zinc-700">URL Slug <span className="text-amber-500">*</span></label>
                <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="ej-cortinas-enrollables" />
                <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 mt-2">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Identificador único para la URL
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-zinc-700">URL de la Imagen</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder="https://ejemplo.com/imagen.jpg" />
                {formData.image_url && (
                  <div className="mt-4 relative h-36 rounded-[1.25rem] overflow-hidden border-2 border-zinc-200 bg-zinc-100 shadow-inner group">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Error+de+Imagen'}} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-zinc-700">Tipo de Categoría <span className="text-amber-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSubcategoryMode(false);
                      setFormData({ ...formData, parent_id: '' });
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-start ${!isSubcategoryMode ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'}`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <svg className={`w-5 h-5 ${!isSubcategoryMode ? 'text-emerald-500' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                      <span className={!isSubcategoryMode ? 'text-emerald-900' : 'text-zinc-700'}>Principal</span>
                    </div>
                    <p className={`text-xs font-semibold ${!isSubcategoryMode ? 'text-emerald-700' : 'text-zinc-500'}`}>Nivel superior</p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setIsSubcategoryMode(true)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-start ${isSubcategoryMode ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/10 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'}`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <svg className={`w-5 h-5 ${isSubcategoryMode ? 'text-amber-500' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className={isSubcategoryMode ? 'text-amber-900' : 'text-zinc-700'}>Subcategoría</span>
                    </div>
                    <p className={`text-xs font-semibold ${isSubcategoryMode ? 'text-amber-700' : 'text-zinc-500'}`}>Depende de otra</p>
                  </button>
                </div>
              </div>

              {isSubcategoryMode && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-zinc-700">Selecciona la Categoría Padre <span className="text-amber-500">*</span></label>
                  <select 
                    required
                    value={formData.parent_id} 
                    onChange={(e) => setFormData({...formData, parent_id: e.target.value})} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-white appearance-none"
                  >
                    <option value="" disabled>Selecciona a qué familia pertenece...</option>
                    {categories
                      .filter(c => !editingCategory || c.id !== editingCategory.id)
                      .map(c => {
                        const pathNames = getCategoryPath(c.id).map(p => p.name);
                        pathNames.push(c.name);
                        return { id: c.id, pathString: pathNames.join(' > ') };
                      })
                      .sort((a, b) => a.pathString.localeCompare(b.pathString))
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          ↳ {c.pathString} ({getCategoryLevelName(categories, c.id)})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Obligatorio: Debes elegir una categoría padre para que sea subcategoría
                  </p>
                </div>
              )}
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
                    editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'
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

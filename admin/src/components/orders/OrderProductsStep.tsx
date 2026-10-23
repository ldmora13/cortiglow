import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Product } from '../../types/product.types';
import type { Category } from '../../types/product.types';
import { formatCOP } from '../../utils/currency';

interface OrderProductsStepProps {
  products: Product[];
  categories: Category[];
  addToCart: (product: Product) => void;
  cartContains: (productId: string) => boolean;
  addingProduct: string | null;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}

export const OrderProductsStep: React.FC<OrderProductsStepProps> = ({
  products,
  categories,
  addToCart,
  cartContains,
  addingProduct,
  onBack,
  onNext,
  isNextDisabled
}) => {
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);

  const categoriesByParent = categories.reduce((map, category) => {
    const parentId = category.parent_id || null;
    const siblings = map.get(parentId) || [];
    map.set(parentId, [...siblings, category]);
    return map;
  }, new Map<string | null, Category[]>());
  const rootCategories = categoriesByParent.get(null) || [];
  const visibleSubcategories = selectedParentCategory
    ? categoriesByParent.get(selectedParentCategory) || []
    : [];

  const categoryIds = selectedCategory === 'all'
    ? null
    : (() => {
        const collect = (categoryId: string): string[] => [
          categoryId,
          ...(categoriesByParent.get(categoryId) || []).flatMap(child => collect(child.id))
        ];
        return new Set(collect(selectedCategory));
      })();

  const availableProducts = products.filter(product =>
    product.is_active && (product.inventory?.quantity || 0) > 0
  );

  const filteredProducts = availableProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = categoryIds === null || Boolean(p.category_id && categoryIds.has(p.category_id));
    return matchesSearch && matchesCategory;
  });
  const displayedProducts = selectedCategory === 'all' && !searchProduct.trim()
    ? [...filteredProducts]
      .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 5)
    : filteredProducts;

  return (
    <div className="space-y-4">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-white border-b border-zinc-200 p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">Agregar Productos</h2>
          <p className="text-sm text-zinc-600">Busca y agrega productos a la orden</p>
        </div>

      <div className="p-3 space-y-3">
        {products.length > 0 && availableProducts.length === 0 && (
            <div className="bg-amber-50 border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  Todos los productos están sin stock
                </p>
                <p className="text-sm text-amber-700 mb-2">
                  Necesitas agregar inventario a los productos antes de hacer una venta.
                </p>
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-1 text-sm bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all font-medium"
                >
                  Ir a Inventario
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-sm"
            />

            <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-2 space-y-2">
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Filtrar por categoría
                </p>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedParentCategory(null);
                    }}
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-950"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedParentCategory(null);
                }}
                className={clsx(
                  "shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                  selectedCategory === 'all' ? "bg-zinc-900 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Todos
              </button>
              {rootCategories.map(category => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedParentCategory(
                      (categoriesByParent.get(category.id) || []).length > 0 ? category.id : null
                    );
                  }}
                  className={clsx(
                    "shrink-0 max-w-[190px] px-3 py-2 rounded-lg font-medium text-sm transition-all truncate",
                    (selectedCategory === category.id || selectedParentCategory === category.id)
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {category.name}
                </button>
              ))}
              </div>

              {selectedParentCategory && visibleSubcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-zinc-200 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(selectedParentCategory)}
                    className={clsx(
                      "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                      selectedCategory === selectedParentCategory
                        ? "bg-zinc-800 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-200"
                    )}
                  >
                    Todas en {rootCategories.find(category => category.id === selectedParentCategory)?.name}
                  </button>
                  {visibleSubcategories.map(category => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={clsx(
                        "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        selectedCategory === category.id
                          ? "bg-zinc-800 text-white"
                          : "bg-white text-zinc-600 hover:bg-zinc-200"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {selectedCategory === 'all' && !searchProduct.trim() && displayedProducts.length > 0 && (
              <p className="sm:col-span-2 text-xs text-zinc-500">
                Productos más vendidos
              </p>
            )}
            {displayedProducts.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                <p className="text-gray-500 mb-4">
                  {searchProduct 
                    ? 'No se encontraron productos con ese nombre'
                    : 'No hay productos disponibles'
                  }
                </p>
                {!searchProduct && (
                  <Link
                    to="/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                  >
                    Crear Primer Producto
                  </Link>
                )}
              </div>
            ) : (
              displayedProducts.map(product => {
                const hasStock = Boolean(product.inventory && product.inventory.quantity > 0);
                const stockQty = product.inventory?.quantity || 0;
                const isAdding = addingProduct === product.id;
                const inCart = cartContains(product.id);
                
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={!hasStock}
                    className={clsx(
                      "text-left p-3 rounded-lg border transition-all duration-200 transform",
                      hasStock
                        ? "border-gray-200 hover:border-zinc-200 hover:shadow-md hover:-translate-y-1 group cursor-pointer"
                        : "border-red-200 bg-red-50 opacity-60 cursor-not-allowed",
                      isAdding && "scale-95 bg-green-50 border-green-400",
                      inCart && "bg-white border-zinc-300"
                    )}
                  >
                    <div className="flex gap-3">
                      {product.images?.[0] && (
                        <div className="relative">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          {!hasStock && (
                            <div className="absolute inset-0 bg-zinc-900 bg-opacity-40 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">SIN STOCK</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          "text-sm font-semibold truncate transition-colors",
                          hasStock ? "text-gray-900 group-hover:text-zinc-600" : "text-gray-500"
                        )}>
                          {product.name}
                        </p>
                        <p className={clsx(
                          "text-base font-bold",
                          hasStock ? "text-zinc-600" : "text-gray-400"
                        )}>
                          {formatCOP(product.price)}
                        </p>
                        <div className="flex items-center gap-2">
                          {hasStock ? (
                            <span className="text-[11px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                              ✓ Stock: {stockQty}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                              Sin stock
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {hasStock ? (
                          <div className="w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-zinc-900 text-zinc-500 group-hover:text-white flex items-center justify-center transition-all">
                            <span className="text-zinc-600 group-hover:text-white font-bold">+</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 font-bold">×</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Atrás</span>
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          <span>Continuar a Pago</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

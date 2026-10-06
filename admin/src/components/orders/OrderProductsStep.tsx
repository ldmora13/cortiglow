import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Product } from '../../types/product.types';
import { formatCOP } from '../../utils/currency';

interface OrderProductsStepProps {
  products: Product[];
  categories: string[];
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-white border-b border-zinc-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agregar Productos</h2>
          <p className="text-zinc-600">Busca y agrega productos a la orden</p>
        </div>

        <div className="p-6 space-y-4">
          {products.length > 0 && products.every(p => !p.inventory || p.inventory.quantity === 0) && (
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all",
                    selectedCategory === cat
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <div className="text-6xl mb-4">📦</div>
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
                    ➕ Crear Primer Producto
                  </Link>
                )}
              </div>
            ) : (
              filteredProducts.map(product => {
                const hasStock = product.inventory && product.inventory.quantity > 0;
                const stockQty = product.inventory?.quantity || 0;
                const isAdding = addingProduct === product.id;
                const inCart = cartContains(product.id);
                
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={!hasStock}
                    className={clsx(
                      "text-left p-4 rounded-xl border-2 transition-all duration-300 transform",
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
                            className="w-16 h-16 object-cover rounded-lg"
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
                          "font-semibold truncate transition-colors",
                          hasStock ? "text-gray-900 group-hover:text-zinc-600" : "text-gray-500"
                        )}>
                          {product.name}
                        </p>
                        <p className={clsx(
                          "text-lg font-bold",
                          hasStock ? "text-zinc-600" : "text-gray-400"
                        )}>
                          {formatCOP(product.price)}
                        </p>
                        <div className="flex items-center gap-2">
                          {hasStock ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              ✓ Stock: {stockQty}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                              ⚠️ Sin stock
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {hasStock ? (
                          <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-zinc-900 text-zinc-500 group-hover:text-white flex items-center justify-center transition-all">
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
          className="flex-1 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 hover:border-gray-400 transition-all shadow-md hover:shadow-sm transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Atrás</span>
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-blue-700 hover:to-zinc-700 shadow-md hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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

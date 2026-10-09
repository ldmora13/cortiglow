import React, { useState } from 'react';
import clsx from 'clsx';
import type { Product } from '../../types/product.types';
import { formatCOP } from '../../utils/currency';

interface QuoteProductsStepProps {
  products: Product[];
  getProductType: (categoryName: string) => 'unit' | 'custom_measure';
  cartContains: (productId: string) => boolean;
  onAddProduct: (product: Product) => void;
}

export const QuoteProductsStep: React.FC<QuoteProductsStepProps> = ({
  products,
  getProductType,
  cartContains,
  onAddProduct
}) => {
  const [searchProduct, setSearchProduct] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Agregar Productos</h2>
      
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchProduct}
        onChange={(e) => setSearchProduct(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent mb-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredProducts.map(product => {
          const productType = getProductType(product.category?.name || '');
          const inCart = cartContains(product.id);
          
          return (
            <div
              key={product.id}
              className={clsx(
                "p-3 sm:p-4 border-2 rounded-xl transition-all",
                inCart ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-zinc-300 active:border-zinc-200"
              )}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-bold text-gray-900 text-sm flex-1 line-clamp-2">{product.name}</h3>
                {productType === 'custom_measure' && (
                  <span className="text-xs bg-zinc-900 text-amber-500 px-2 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0">
                    Cortina
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-bold text-zinc-600 mb-2">
                {formatCOP(product.price)}{productType === 'custom_measure' && '/m²'}
              </div>
              <button
                onClick={() => onAddProduct(product)}
                className="w-full py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-lg font-semibold hover:shadow-sm active:scale-95 transition-all text-sm min-h-[44px]"
              >
                {productType === 'custom_measure' ? '📐 Configurar' : 'Agregar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

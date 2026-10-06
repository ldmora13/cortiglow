import React from 'react';
import type { QuoteItem } from '../../types/quote.types';
import { formatCOP } from '../../utils/currency';

interface QuoteSummaryProps {
  cart: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, qty: number) => void;
  step: number;
  setStep: (step: number) => void;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  cart,
  subtotal,
  discount,
  tax,
  total,
  onRemoveItem,
  onUpdateQuantity,
  step,
  setStep
}) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6 lg:sticky lg:top-6">
      <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
        Carrito ({cart.length})
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <div className="text-3xl sm:text-4xl mb-2">🛒</div>
          <p className="text-xs sm:text-sm">No hay productos</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto mb-4 custom-scrollbar">
          {cart.map((item, index) => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900 line-clamp-2">
                    {item.product?.name}
                  </div>
                  {item.item_type === 'custom_measure' ? (
                    <div className="text-xs text-zinc-600 mt-1">
                      {item.square_meters?.toFixed(2)}m² ({item.fabric_type})
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded font-bold text-sm hover:bg-gray-300 active:scale-95 transition-transform flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded font-bold text-sm hover:bg-gray-300 active:scale-95 transition-transform flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-red-600 hover:text-red-700 font-bold text-lg w-8 h-8 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                >
                  ✕
                </button>
              </div>
              <div className="text-right font-bold text-zinc-600 text-sm sm:text-base">
                {formatCOP(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-zinc-600">Subtotal:</span>
          <span className="font-bold">{formatCOP(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm text-green-600">
            <span>Descuento:</span>
            <span className="font-bold">-{formatCOP(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-700">IVA (19%):</span>
          <span className="font-bold">{formatCOP(tax)}</span>
        </div>
        
        <div className="border-t-2 border-zinc-300 pt-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-base sm:text-lg font-black text-gray-900">TOTAL:</span>
            <span className="text-xl sm:text-2xl font-black text-zinc-800">
              {formatCOP(total)}
            </span>
          </div>
        </div>
      </div>

      {step === 2 && (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setStep(1)}
            className="w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            ← Volver
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={cart.length === 0}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-lg font-semibold hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar →
          </button>
        </div>
      )}
    </div>
  );
};

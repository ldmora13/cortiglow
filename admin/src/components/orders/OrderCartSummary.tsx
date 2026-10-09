import React from 'react';
import { formatCOP } from '../../utils/currency';
import type { CartItem } from '../../types/order.types';

interface OrderCartSummaryProps {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCost: number;
  total: number;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
}

export const OrderCartSummary: React.FC<OrderCartSummaryProps> = ({
  cart,
  subtotal,
  discount,
  tax,
  deliveryCost,
  total,
  incrementQuantity,
  decrementQuantity,
  removeFromCart
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transform transition-all hover:shadow-md">
      <div className="bg-white border-b border-zinc-200 text-zinc-900 p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl">Carrito</h3>
          {cart.length > 0 && (
            <span className="bg-zinc-100 px-3 py-1 rounded-full text-sm font-bold text-zinc-800">
              {cart.length}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5 max-h-[400px] overflow-y-auto bg-gray-50/50">
        {cart.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3 opacity-50">🛍️</div>
            <p className="font-medium">El carrito está vacío</p>
            <p className="text-sm mt-1">Busca y selecciona productos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product_id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 group relative">
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                >
                  ×
                </button>
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-gray-900 truncate text-sm">{item.name}</h4>
                    <p className="text-xs font-semibold text-zinc-500 mt-0.5">{formatCOP(item.unit_price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                      <button
                        onClick={() => decrementQuantity(item.product_id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 font-bold shadow-sm hover:text-zinc-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.product_id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 font-bold shadow-sm hover:text-zinc-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-zinc-900 text-sm">
                      {formatCOP(item.unit_price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-white border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold text-gray-900">{formatCOP(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-orange-600 font-medium">
            <span>Descuento</span>
            <span>-{formatCOP(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">IVA (19%)</span>
          <span className="font-bold text-gray-900">{formatCOP(tax)}</span>
        </div>
        {deliveryCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Envío</span>
            <span className="font-bold text-gray-900">{formatCOP(deliveryCost)}</span>
          </div>
        )}
        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-zinc-900">{formatCOP(total)}</span>
        </div>
      </div>
    </div>
  );
};

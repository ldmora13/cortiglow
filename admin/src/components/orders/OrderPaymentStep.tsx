import React from 'react';
import clsx from 'clsx';
import { formatCOP } from '../../utils/currency';

interface OrderPaymentStepProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  deliveryCost: number;
  setDeliveryCost: (cost: number) => void;
  notes: string;
  setNotes: (notes: string) => void;
  subtotal: number;
  applyQuickDiscount: (percentage: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const OrderPaymentStep: React.FC<OrderPaymentStepProps> = ({
  paymentMethod,
  setPaymentMethod,
  discount,
  setDiscount,
  deliveryCost,
  setDeliveryCost,
  notes,
  setNotes,
  subtotal,
  applyQuickDiscount,
  onBack,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-white border-b border-zinc-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Venta</h2>
        <p className="text-zinc-600">Configura los detalles finales de la venta</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Método de Pago
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Método de pago">
            {[
              { id: 'efectivo', icon: '', label: 'Efectivo' },
              { id: 'nequi', icon: '', label: 'Nequi' },
              { id: 'daviplata', icon: '', label: 'Daviplata' },
              { id: 'pse', icon: '', label: 'PSE' },
              { id: 'transferencia', icon: '', label: 'Transferencia' },
              { id: 'tarjeta', icon: '', label: 'Tarjeta' }
            ].map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                role="radio"
                aria-checked={paymentMethod === method.id}
                className={clsx(
                  "relative p-4 rounded-xl border-2 font-semibold transition-all transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                  paymentMethod === method.id
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                    : "border-gray-200 hover:border-zinc-400 bg-white text-gray-700 hover:shadow-sm"
                )}
              >
                {paymentMethod === method.id && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-zinc-900" aria-hidden="true">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 011.415-1.42l2.543 2.544 6.543-6.544a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <div className="text-2xl mb-1">{method.icon}</div>
                <div className="text-sm">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🎁 Descuento
          </label>
          <div className="flex gap-2 mb-3">
            {[5, 10, 15, 20].map(perc => (
              <button
                key={perc}
                onClick={() => applyQuickDiscount(perc)}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all font-medium text-sm"
              >
                {perc}%
              </button>
            ))}
            <button
              onClick={() => setDiscount(0)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
            >
              Sin descuento
            </button>
          </div>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Ingresa monto manual"
            min="0"
          />
          {discount > 0 && (
            <p className="text-sm text-zinc-600 mt-2">
              Descuento aplicado: {formatCOP(discount)} ({((discount/subtotal)*100).toFixed(1)}%)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🚚 Costo de Envío
          </label>
          <input
            type="number"
            value={deliveryCost}
            onChange={(e) => setDeliveryCost(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            placeholder="0 = Recoge en tienda"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📝 Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
            placeholder="Agrega notas sobre esta venta..."
          />
        </div>

        <div className="flex gap-3 pt-4">
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
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-sm transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>Confirmar Venta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

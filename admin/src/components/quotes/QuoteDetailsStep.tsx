import React from 'react';
import type { Customer } from '../../types/customer.types';

interface QuoteDetailsStepProps {
  selectedCustomer: Customer | undefined;
  discount: number;
  setDiscount: (discount: number) => void;
  validUntil: string;
  setValidUntil: (date: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const QuoteDetailsStep: React.FC<QuoteDetailsStepProps> = ({
  selectedCustomer,
  discount,
  setDiscount,
  validUntil,
  setValidUntil,
  notes,
  setNotes,
  onBack,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Detalles Finales</h2>

      {/* Cliente Seleccionado */}
      <div className="p-4 bg-white rounded-xl border border-zinc-200">
        <div className="text-sm font-bold text-zinc-600 mb-1">Cliente</div>
        <div className="font-bold text-gray-900">{selectedCustomer?.name}</div>
        <div className="text-sm text-zinc-600">{selectedCustomer?.phone}</div>
      </div>

      {/* Descuento */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Descuento (COP)
        </label>
        <input
          type="number"
          min="0"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          placeholder="0"
        />
      </div>

      {/* Fecha de Vigencia */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Válida Hasta *
        </label>
        <input
          type="date"
          required
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
        >
          ← Volver
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-xl font-bold shadow-sm hover:shadow-md transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Creando...' : 'Crear Cotización'}
        </button>
      </div>
    </div>
  );
};

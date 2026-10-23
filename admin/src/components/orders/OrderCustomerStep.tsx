import React, { useState } from 'react';
import clsx from 'clsx';
import type { Customer } from '../../types/customer.types';
import QuickCustomerModal from '../QuickCustomerModal';

interface OrderCustomerStepProps {
  customers: Customer[];
  search: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer) => void;
  onNext: () => void;
}

export const OrderCustomerStep: React.FC<OrderCustomerStepProps> = ({
  customers,
  search,
  onSearchChange,
  isLoading = false,
  selectedCustomer,
  setSelectedCustomer,
  onNext
}) => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-white border border-zinc-200 p-3 border-b">
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Seleccionar Cliente</h2>
          <p className="text-sm text-zinc-600">Busca un cliente existente o crea uno nuevo</p>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold whitespace-nowrap"
            >
              Nuevo
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-zinc-500">Buscando clientes...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                <p className="text-gray-500">No se encontraron clientes</p>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="mt-4 text-amber-500 hover:text-zinc-800 font-medium"
                >
                  Crear nuevo cliente
                </button>
              </div>
            ) : (
              customers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    onNext();
                  }}
                  className={clsx(
                    "w-full text-left p-3 rounded-lg border-2 transition-all",
                    selectedCustomer?.id === customer.id
                      ? "border-zinc-300 bg-gray-50"
                      : "border-gray-200 hover:border-zinc-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-zinc-600">{customer.phone}</p>
                      {customer.email && (
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      )}
                    </div>
                    {selectedCustomer?.id === customer.id && (
                      <div className="text-amber-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!selectedCustomer}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Continuar a Productos</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {showCustomerModal && (
        <QuickCustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={(newCustomer) => {
            setSelectedCustomer(newCustomer as Customer);
            setShowCustomerModal(false);
            onNext();
          }}
        />
      )}
    </>
  );
};

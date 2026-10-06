import React, { useState } from 'react';
import clsx from 'clsx';
import type { Customer } from '../../types/customer.types';
import QuickCustomerModal from '../QuickCustomerModal';

interface QuoteCustomerStepProps {
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  onNext: () => void;
}

export const QuoteCustomerStep: React.FC<QuoteCustomerStepProps> = ({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  onNext
}) => {
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone.includes(searchCustomer)
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-black text-gray-900">Selecciona el Cliente</h2>
          <button
            onClick={() => setShowCustomerModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-all text-sm min-h-[44px]"
          >
            + Nuevo Cliente
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent mb-4 text-base"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-96 overflow-y-auto custom-scrollbar">
          {filteredCustomers.map(customer => (
            <button
              key={customer.id}
              onClick={() => {
                setSelectedCustomerId(customer.id);
                onNext();
              }}
              className={clsx(
                "p-4 border-2 rounded-xl text-left transition-all hover:shadow-sm active:scale-[0.98] min-h-[80px]",
                selectedCustomerId === customer.id
                  ? "border-zinc-200 bg-white"
                  : "border-gray-200 hover:border-zinc-300 active:border-zinc-200"
              )}
            >
              <div className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">{customer.name}</div>
              <div className="text-xs sm:text-sm text-zinc-600 mt-1">📱 {customer.phone}</div>
              {customer.email && <div className="text-xs sm:text-sm text-zinc-600 truncate">📧 {customer.email}</div>}
            </button>
          ))}
        </div>
      </div>

      {showCustomerModal && (
        <QuickCustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={(newCustomer) => {
            setSelectedCustomerId(newCustomer.id);
            setShowCustomerModal(false);
            onNext();
          }}
        />
      )}
    </>
  );
};

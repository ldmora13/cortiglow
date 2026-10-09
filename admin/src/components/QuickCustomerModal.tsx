import { useState } from 'react';
import { api } from '../lib/api';
import { notify } from '../hooks/useNotification';

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomer: any) => void;
}

export default function QuickCustomerModal({ isOpen, onClose, onSuccess }: QuickCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/customers', formData);
      onSuccess(data);
      notify.success('Cliente creado exitosamente');
      setFormData({ name: '', phone: '', email: '' });
      onClose();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className="relative p-5 pb-4 border-b border-zinc-100 bg-white z-20">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-base font-bold tracking-tight text-zinc-900">
                Crear Cliente Rápido
              </h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">
                Crea y selecciona un cliente al instante
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div>
            <label htmlFor="quick-name" className="block text-sm font-bold text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="quick-name"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="quick-phone" className="block text-sm font-bold text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="quick-phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label htmlFor="quick-email" className="block text-sm font-bold text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              id="quick-email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              placeholder="cliente@email.com"
            />
          </div>

          {/* Footer Modal */}
          <div className="pt-6 mt-6 border-t border-zinc-100 flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3.5 text-zinc-600 bg-white border-2 border-zinc-200 font-bold rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3.5 text-white bg-zinc-900 border-2 border-zinc-900 font-bold rounded-xl hover:bg-zinc-800 hover:border-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Crear y Seleccionar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuotes } from '../hooks/useQuotes';
import { formatCOP } from '../utils/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import type { Quote } from '../types/quote.types';

export default function Quotes() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { quotes, isLoadingQuotes } = useQuotes(
    filterStatus !== 'all' ? { status: filterStatus } : undefined
  );

  const getStatusBadge = (status: string) => {
    const configs = {
      draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Enviada', class: 'bg-blue-100 text-zinc-800' },
      accepted: { label: 'Aceptada', class: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rechazada', class: 'bg-red-100 text-red-700' },
      converted: { label: 'Convertida', class: 'bg-zinc-100 text-zinc-700' },
      expired: { label: 'Expirada', class: 'bg-orange-100 text-orange-700' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.draft;
    return (
      <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", config.class)}>
        {config.label}
      </span>
    );
  };

  const isExpiringSoon = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 3 && days > 0;
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (isLoadingQuotes) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredQuotes = quotes.filter(q => 
    q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
                Cotizaciones
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                {quotes.length} cotizaciones en total
              </p>
            </div>
            <Link
              to="/quotes/new"
              className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cotización
            </Link>
      </div>

      {/* Barra de Búsqueda y Filtros Unificada */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-5 relative group flex flex-col xl:flex-row items-center gap-4 mb-6">
        <div className="flex-1 relative flex items-center w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-12 pr-12 py-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-medium text-sm text-zinc-800 placeholder-zinc-400"
          />
          {searchTerm && (
            <div className="absolute right-3 flex items-center gap-2">
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="p-1.5 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200 hover:text-zinc-800 transition-all active:scale-90"
                title="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="hidden xl:block w-px h-8 bg-zinc-200 mx-2 shrink-0"></div>

        <div className="flex items-center w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                filterStatus === 'all' ? "bg-zinc-900 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => { setFilterStatus('draft'); setCurrentPage(1); }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                filterStatus === 'draft' ? "bg-gray-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent"
              )}
            >
              Borradores
            </button>
            <button
              onClick={() => { setFilterStatus('sent'); setCurrentPage(1); }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                filterStatus === 'sent' ? "bg-zinc-900 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent"
              )}
            >
              Enviadas
            </button>
            <button
              onClick={() => { setFilterStatus('accepted'); setCurrentPage(1); }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                filterStatus === 'accepted' ? "bg-green-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent"
              )}
            >
              Aceptadas
            </button>
            <button
              onClick={() => { setFilterStatus('expired'); setCurrentPage(1); }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                filterStatus === 'expired' ? "bg-orange-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent"
              )}
            >
              Expiradas
            </button>
          </div>
          
          <div className="bg-zinc-100 p-1.5 rounded-xl flex items-center shadow-inner border border-zinc-200/60 shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
              title="Vista de Cuadrícula"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
              title="Vista de Lista"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-zinc-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          <p className="text-gray-500 font-medium mb-4">No se encontraron cotizaciones</p>
          <Link
            to="/quotes/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold shadow-sm hover:shadow-md transform hover:scale-105 transition-all"
          >
            Crear Nueva
          </Link>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Vigencia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {paginatedQuotes.map((quote: Quote) => (
                  <tr 
                    key={quote.id} 
                    onClick={() => window.location.href = `/quotes/${quote.id}`}
                    className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-zinc-600">{quote.quote_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-zinc-900">{quote.customer?.name}</div>
                      <div className="text-xs text-zinc-500">{quote.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-zinc-900">{formatCOP(quote.total)}</div>
                      <div className="text-xs text-zinc-500">{quote.items?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={clsx(
                        "inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                        isExpired(quote.valid_until) && "bg-red-100 text-red-700",
                        isExpiringSoon(quote.valid_until) && !isExpired(quote.valid_until) && "bg-orange-100 text-orange-700",
                        !isExpiringSoon(quote.valid_until) && !isExpired(quote.valid_until) && "bg-green-100 text-green-700"
                      )}>
                        
                        {format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredQuotes.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredQuotes.length)} de {filteredQuotes.length} resultados
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedQuotes.map((quote: Quote) => (
            <Link
              key={quote.id}
              to={`/quotes/${quote.id}`}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border-2 border-gray-100 hover:border-zinc-200 hover:shadow-md active:scale-[0.98] transition-all overflow-hidden"
            >
              <div className="bg-white border-b border-zinc-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-bold text-zinc-600 truncate">{quote.quote_number}</span>
                  {getStatusBadge(quote.status)}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-zinc-600 transition-colors line-clamp-2">
                  {quote.customer?.name}
                </h3>
                <p className="text-xs text-zinc-600 mt-1 truncate">{quote.customer?.phone}</p>
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-zinc-600">{formatCOP(quote.total)}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="font-semibold">{quote.items?.length || 0} items</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Vigencia</p>
                  <div className={clsx(
                    "inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                    isExpired(quote.valid_until) && "bg-red-100 text-red-700",
                    isExpiringSoon(quote.valid_until) && !isExpired(quote.valid_until) && "bg-orange-100 text-orange-700",
                    !isExpiringSoon(quote.valid_until) && !isExpired(quote.valid_until) && "bg-green-100 text-green-700"
                  )}>
                    
                    {format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 pt-2 border-t">
                  Creada: {format(new Date(quote.created_at), 'dd/MM/yyyy hh:mm a', { locale: es })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {viewMode === 'grid' && filteredQuotes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredQuotes.length)} de {filteredQuotes.length} resultados
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

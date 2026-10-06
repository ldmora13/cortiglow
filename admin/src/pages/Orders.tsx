import { useState } from 'react';
import { Link } from 'react-router-dom';
import { notify } from '../hooks/useNotification';
import { useOrders } from '../hooks/useOrders';
import { formatCOP } from '../utils/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import type { OrderStatus } from '../types/order.types';

const statusConfig: Record<string, any> = {
  pending: { icon: '⏳', color: 'yellow', label: 'Pendiente', bgClass: 'bg-yellow-50 border-yellow-200', textClass: 'text-yellow-700' },
  confirmed: { icon: '✓', color: 'blue', label: 'Confirmada', bgClass: 'bg-gray-50 border-zinc-200', textClass: 'text-zinc-800' },
  in_progress: { icon: '🚀', color: 'blue', label: 'En Progreso', bgClass: 'bg-white border-zinc-200', textClass: 'text-zinc-700' },
  completed: { icon: '✅', color: 'green', label: 'Completada', bgClass: 'bg-green-50 border-green-200', textClass: 'text-green-700' },
  cancelled: { icon: '❌', color: 'red', label: 'Cancelada', bgClass: 'bg-red-50 border-red-200', textClass: 'text-red-700' }
};

const paymentMethodIcons: Record<string, string> = {
  efectivo: '💵',
  nequi: '📱',
  daviplata: '💰',
  pse: '🏦',
  transferencia: '💸',
  tarjeta: '💳'
};

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // React Query Hook
  const { orders, isLoadingOrders, updateOrderStatus, cancelOrder } = useOrders(
    statusFilter ? { status: statusFilter } : undefined
  );

  const handleChangeStatus = async (id: string, newStatus: OrderStatus | 'cancelled') => {
    const confirmMessages: Record<string, string> = {
      confirmed: '¿Confirmar esta orden?',
      completed: '¿Marcar como completada? Esta acción indica que la orden fue entregada.',
      cancelled: '¿Cancelar esta orden? El inventario será restaurado.',
    };

    const confirmed = await notify.confirm({
      title: 'Cambiar Estado de Orden',
      message: confirmMessages[newStatus] || '¿Cambiar el estado de la orden?',
      confirmText: 'Cambiar',
      type: newStatus === 'cancelled' ? 'danger' : 'info'
    });

    if (!confirmed) return;

    try {
      if (newStatus === 'cancelled') {
        await cancelOrder(id);
      } else {
        await updateOrderStatus({ id, status: newStatus as OrderStatus });
      }
      
      const successMessages: Record<string, string> = {
        confirmed: 'Orden confirmada exitosamente',
        completed: 'Orden completada',
        cancelled: 'Orden cancelada - Inventario restaurado',
      };
      
      notify.success(successMessages[newStatus] || 'Estado actualizado');
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const search = searchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.customer.phone.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending').length,
    completed: orders.filter((o: any) => o.status === 'completed').length,
    cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
    totalSales: orders
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + Number(o.total), 0)
  };

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-zinc-300 mx-auto mb-4"></div>
          <p className="text-zinc-600 font-medium">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8 text-zinc-900 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                Ventas y Órdenes
              </h1>
              <p className="text-zinc-600 text-base md:text-lg font-medium">Gestiona todas las órdenes de nuestro negocio</p>
            </div>
            <Link
              to="/orders/new"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-md min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Venta
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm font-bold text-amber-500 uppercase tracking-wide">Total Órdenes</p>
                <div className="text-xl">📦</div>
              </div>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-br from-zinc-600 to-zinc-900 bg-clip-text text-transparent">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border-2 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm font-bold text-zinc-600 uppercase tracking-wide">Pendientes</p>
                <div className="text-xl">⏳</div>
              </div>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-br from-orange-600 to-orange-800 bg-clip-text text-transparent">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm font-bold text-green-600 uppercase tracking-wide">Completadas</p>
                <div className="text-xl">✅</div>
              </div>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-transparent">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm font-bold text-zinc-600 uppercase tracking-wide">Ventas Total</p>
                <div className="text-xl">💰</div>
              </div>
              <p className="text-xl md:text-2xl font-black bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">{formatCOP(stats.totalSales)}</p>
            </div>
          </div>
        </div>
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

        <div className="flex items-center justify-between w-full xl:w-auto gap-4 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                statusFilter === '' ? "bg-zinc-900 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              Todas
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status as any); setCurrentPage(1); }}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                  statusFilter === status 
                    ? `bg-zinc-800 text-white` 
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent"
                )}
              >
                <span>{config.icon}</span>
                {config.label}
              </button>
            ))}
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

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay órdenes</h3>
          <p className="text-zinc-600 mb-6">Crea la primera venta para comenzar</p>
          <Link to="/orders/new" className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold">
            Crear Primera Venta
          </Link>
        </div>
      )}

      {filteredOrders.length > 0 && (
        viewMode === 'list' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Orden</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-zinc-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-zinc-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-100">
                  {paginatedOrders.map((order: any) => {
                    const config = statusConfig[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{config.icon}</span>
                            <span className="font-bold text-gray-900">{order.order_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900">{order.customer.name}</div>
                          <div className="text-sm text-zinc-500">📱 {order.customer.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx("px-2.5 py-1 rounded-md text-xs font-bold", config.textClass, config.bgClass)}>
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-black text-zinc-900">{formatCOP(order.total)}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1">
                            <span className="text-sm">{paymentMethodIcons[order.payment_method] || '💳'}</span>
                            <span className="capitalize">{order.payment_method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a', { locale: es })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => window.location.href = `/orders/${order.id}`}
                              className="text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                              title="Ver Orden"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {order.status !== 'cancelled' && order.status !== 'completed' && (
                              <button
                                onClick={() => handleChangeStatus(order.id, 'cancelled')}
                                className="text-zinc-400 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-transparent p-2 rounded-lg transition-all"
                                title="Cancelar Orden"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredOrders.length > 0 && (
              <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de {filteredOrders.length} resultados
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedOrders.map((order: any) => {
              const config = statusConfig[order.status];
              
              return (
                <div key={order.id} className={clsx("bg-white rounded-2xl shadow-sm border-2 hover:shadow-md transition-all overflow-hidden", config.bgClass)}>
                  <div className={clsx("p-4 border-b-2", config.bgClass)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{config.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{order.order_number}</h3>
                          <p className={clsx("text-sm font-medium", config.textClass)}>{config.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-500">{formatCOP(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{order.customer.name}</p>
                        <p className="text-sm text-zinc-600">📱 {order.customer.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{paymentMethodIcons[order.payment_method] || '💳'}</span>
                        <span className="text-gray-700 capitalize font-medium">{order.payment_method}</span>
                      </div>
                      <div className="text-gray-500">
                        🕐 {format(new Date(order.created_at), 'dd MMM, hh:mm a', { locale: es })}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Productos:</p>
                        <p className="text-sm text-gray-700">
                          {order.items.slice(0, 2).map((item: any) => `${item.product.name} (${item.quantity})`).join(', ')}
                          {order.items.length > 2 && ` +${order.items.length - 2} más`}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {order.status === 'pending' && (
                        <button onClick={() => handleChangeStatus(order.id, 'confirmed')} className="flex-1 px-3 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-medium text-sm">✓ Confirmar</button>
                      )}
                      {(order.status === 'confirmed' || order.status === 'in_progress') && (
                        <button onClick={() => handleChangeStatus(order.id, 'completed')} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">Completar</button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button onClick={() => handleChangeStatus(order.id, 'cancelled')} className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm">❌ Cancelar</button>
                      )}
                      <Link to={`/orders/${order.id}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">👁️ Ver</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {viewMode === 'grid' && filteredOrders.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de {filteredOrders.length} resultados
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

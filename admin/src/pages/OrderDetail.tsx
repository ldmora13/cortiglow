import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { formatCOP } from '../utils/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notify } from '../hooks/useNotification';
import clsx from 'clsx';
import type { OrderStatus } from '../types/order.types';

const statusConfig: Record<string, any> = {
  pending: { icon: '⏳', color: 'yellow', label: 'Pendiente', bgClass: 'bg-yellow-50', borderClass: 'border-zinc-300' },
  confirmed: { icon: '✓', color: 'blue', label: 'Confirmada', bgClass: 'bg-gray-50', borderClass: 'border-zinc-300' },
  in_progress: { icon: '🚀', color: 'blue', label: 'En Progreso', bgClass: 'bg-white', borderClass: 'border-zinc-300' },
  completed: { icon: '✅', color: 'green', label: 'Completada', bgClass: 'bg-green-50', borderClass: 'border-zinc-300' },
  cancelled: { icon: '❌', color: 'red', label: 'Cancelada', bgClass: 'bg-red-50', borderClass: 'border-red-300' }
};

const paymentMethodIcons: Record<string, string> = {
  efectivo: '💵 Efectivo',
  nequi: '📱 Nequi',
  daviplata: '💰 Daviplata',
  pse: '🏦 PSE',
  transferencia: '💸 Transferencia',
  tarjeta: '💳 Tarjeta'
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { getOrderQuery, updateOrderStatus, cancelOrder, isUpdating } = useOrders();
  const { data: order, isLoading, isError } = getOrderQuery(id || '');

  const handleChangeStatus = async (newStatus: OrderStatus | 'cancelled') => {
    const confirmMessages: Record<string, string> = {
      confirmed: '¿Confirmar esta orden?',
      in_progress: '¿Marcar como en progreso?',
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
        await cancelOrder(id!);
      } else {
        await updateOrderStatus({ id: id!, status: newStatus as OrderStatus });
      }
      notify.success('Estado actualizado exitosamente');
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-zinc-300 mx-auto mb-4"></div>
          <p className="text-zinc-600 font-medium">Cargando orden...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Orden no encontrada</h2>
        <Link to="/orders" className="text-amber-500 hover:text-zinc-800 font-medium">
          ← Volver a órdenes
        </Link>
      </div>
    );
  }

  const config = statusConfig[order.status];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-zinc-600">
              Creada el {format(new Date(order.created_at), "dd 'de' MMMM, yyyy 'a las' hh:mm a", { locale: es })}
            </p>
          </div>
        </div>
        <button onClick={handlePrint} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">
          🖨️ Imprimir
        </button>
      </div>

      <div className={clsx("rounded-2xl shadow-sm border-2 overflow-hidden", config.bgClass, config.borderClass)}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{config.icon}</div>
              <div>
                <p className="text-sm text-zinc-600 font-medium">Estado de la orden</p>
                <p className="text-2xl font-bold text-gray-900">{config.label}</p>
                {order.completed_at && (
                  <p className="text-sm text-zinc-600">Completada el {format(new Date(order.completed_at), "dd/MM/yyyy hh:mm a", { locale: es })}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <button onClick={() => handleChangeStatus('confirmed')} disabled={isUpdating} className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-medium disabled:opacity-50">✓ Confirmar</button>
              )}
              {order.status === 'confirmed' && (
                <>
                  <button onClick={() => handleChangeStatus('in_progress')} disabled={isUpdating} className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-medium disabled:opacity-50">🚀 En Progreso</button>
                  <button onClick={() => handleChangeStatus('completed')} disabled={isUpdating} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50">Completar</button>
                </>
              )}
              {order.status === 'in_progress' && (
                <button onClick={() => handleChangeStatus('completed')} disabled={isUpdating} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50">Completar</button>
              )}
              {order.status !== 'cancelled' && order.status !== 'completed' && (
                <button onClick={() => handleChangeStatus('cancelled')} disabled={isUpdating} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium disabled:opacity-50">❌ Cancelar</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-white border-b border-zinc-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">🛒 Productos ({order.items?.length || 0})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    {item.product.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-600">
                        <span>Cantidad: <strong>{item.quantity}</strong></span>
                        <span>Precio: <strong>{formatCOP(item.unit_price)}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-500">{formatCOP(item.subtotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="bg-amber-50 rounded-2xl shadow-sm border border-zinc-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">📝 Notas</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">👤 Cliente</h3>
            <div className="space-y-3">
              <div><p className="text-sm text-zinc-600">Nombre</p><p className="font-semibold text-gray-900">{order.customer?.name}</p></div>
              <div><p className="text-sm text-zinc-600">Teléfono</p><a href={`tel:${order.customer?.phone}`} className="font-semibold text-amber-500">{order.customer?.phone}</a></div>
              {order.customer?.email && <div><p className="text-sm text-zinc-600">Email</p><a href={`mailto:${order.customer.email}`} className="font-semibold text-amber-500 break-all">{order.customer.email}</a></div>}
              {order.customer?.address && <div><p className="text-sm text-zinc-600">Dirección</p><p className="font-semibold text-gray-900">{order.customer.address}</p>{order.customer.city && <p className="text-sm text-zinc-600">{order.customer.city}</p>}</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">💳 Información de Pago</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-zinc-600">Método</span><span className="font-semibold">{paymentMethodIcons[order.payment_method] || order.payment_method}</span></div>
              <div className="flex items-center justify-between"><span className="text-zinc-600">Estado</span><span className={clsx("px-3 py-1 rounded-lg font-semibold text-sm", order.payment_status === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>{order.payment_status === 'paid' ? 'Pagado' : '⏳ Pendiente'}</span></div>
            </div>
          </div>

          {order.delivery_method && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🚚 Entrega</h3>
              <div className="space-y-3">
                <div><p className="text-sm text-zinc-600">Método</p><p className="font-semibold text-gray-900 capitalize">{order.delivery_method === 'delivery' ? '🚚 Envío a domicilio' : '🏪 Recoge en tienda'}</p></div>
                {order.delivery_address && <div><p className="text-sm text-zinc-600">Dirección</p><p className="font-semibold text-gray-900">{order.delivery_address}</p></div>}
                {order.delivery_cost > 0 && <div className="flex items-center justify-between pt-2 border-t border-gray-200"><span className="text-zinc-600">Costo envío</span><span className="font-bold text-gray-900">{formatCOP(order.delivery_cost)}</span></div>}
              </div>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700"><span>Subtotal:</span><span className="font-semibold">{formatCOP(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-zinc-600"><span>Descuento:</span><span className="font-semibold">-{formatCOP(order.discount)}</span></div>}
              <div className="flex justify-between text-gray-700"><span>IVA (19%):</span><span className="font-semibold">{formatCOP(order.tax)}</span></div>
              {order.delivery_cost > 0 && <div className="flex justify-between text-gray-700"><span>Envío:</span><span className="font-semibold">{formatCOP(order.delivery_cost)}</span></div>}
              <div className="border-t-2 border-zinc-300 pt-2 mt-2">
                <div className="flex justify-between items-center"><span className="text-lg font-bold text-gray-900">TOTAL:</span><span className="text-3xl font-bold text-amber-500">{formatCOP(order.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

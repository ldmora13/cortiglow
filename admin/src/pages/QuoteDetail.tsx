import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuotes } from '../hooks/useQuotes';
import { formatCOP } from '../utils/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notify } from '../hooks/useNotification';
import clsx from 'clsx';
import type { QuoteStatus } from '../types/quote.types';

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    getQuoteQuery, 
    updateQuoteStatus, 
    convertQuoteToOrder, 
    deleteQuote,
    isUpdatingStatus,
    isConverting,
    isDeleting
  } = useQuotes();

  const { data: quote, isLoading, isError } = getQuoteQuery(id || '');

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviada',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      converted: 'Convertida',
      expired: 'Expirada'
    };
    return labels[status] || status;
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!quote) return;
    
    const confirmed = await notify.confirm({
      title: 'Cambiar Estado',
      message: `¿Cambiar estado a "${getStatusLabel(newStatus)}"?`,
      confirmText: 'Cambiar',
      type: 'info'
    });
    
    if (!confirmed) return;
    
    try {
      await updateQuoteStatus({ id: quote.id, status: newStatus as QuoteStatus });
      notify.success('Estado actualizado');
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleConvertToOrder = async () => {
    if (!quote) return;
    
    const confirmed = await notify.confirm({
      title: 'Convertir a Orden',
      message: '¿Convertir esta cotización en una orden de venta? Se descontará el inventario automáticamente.',
      confirmText: 'Convertir',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
      const data = await convertQuoteToOrder({
        id: quote.id,
        conversionData: { payment_method: 'efectivo', delivery_cost: 0 }
      });
      notify.success(`Cotización convertida a orden: ${data.order.order_number}`);
      navigate(`/orders/${data.order.id}`);
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al convertir cotización');
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    
    const confirmed = await notify.confirm({
      title: 'Eliminar Cotización',
      message: '¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      await deleteQuote(quote.id);
      notify.success('Cotización eliminada');
      navigate('/quotes');
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Error al eliminar cotización');
    }
  };

  const handlePrint = () => {
    window.open(`/quotes/${id}/print`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string }> = {
      draft: { class: 'bg-gray-100 text-gray-700' },
      sent: { class: 'bg-blue-100 text-zinc-800' },
      accepted: { class: 'bg-green-100 text-green-700' },
      rejected: { class: 'bg-red-100 text-red-700' },
      converted: { class: 'bg-zinc-100 text-zinc-700' },
      expired: { class: 'bg-orange-100 text-orange-700' }
    };
    
    const config = configs[status] || configs.draft;
    return (
      <span className={clsx("px-4 py-2 rounded-full text-sm font-bold", config.class)}>
        {getStatusLabel(status)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cotización no encontrada</h2>
        <Link to="/quotes" className="text-amber-500 hover:text-zinc-800 font-medium">
          ← Volver a cotizaciones
        </Link>
      </div>
    );
  }

  const isExpired = new Date(quote.valid_until) < new Date();
  const canConvert = quote.status === 'accepted' && !quote.converted_order_id;
  const canEdit = quote.status === 'draft';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
              {quote.quote_number}
            </h1>
            {getStatusBadge(quote.status)}
          </div>
          <p className="text-zinc-600 text-sm sm:text-base">
            Creada el {format(new Date(quote.created_at), 'dd/MM/yyyy hh:mm a', { locale: es })}
          </p>
        </div>
        <Link to="/quotes" className="text-center px-4 py-2 text-zinc-600 hover:text-gray-900 font-semibold text-sm sm:text-base">
          ← Volver
        </Link>
      </div>

      {isExpired && quote.status !== 'converted' && (
        <div className="bg-orange-100 border-2 border-orange-300 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-orange-800">Cotización Expirada</div>
            <div className="text-sm text-orange-700">Venció el {format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: es })}</div>
          </div>
        </div>
      )}

      {quote.converted_order && (
        <div className="bg-zinc-100 border-2 border-zinc-300 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <div className="font-bold text-zinc-800">Convertida a Orden</div>
            <div className="text-sm text-zinc-700">Orden: {quote.converted_order.order_number}</div>
          </div>
          <Link to={`/orders/${quote.converted_order.id}`} className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800">
            Ver Orden →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Cliente</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">👤</span>
                <span className="font-bold text-gray-900">{quote.customer?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <span className="text-gray-700">{quote.customer?.phone}</span>
              </div>
              {quote.customer?.email && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  <span className="text-gray-700">{quote.customer?.email}</span>
                </div>
              )}
              {quote.customer?.address && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span className="text-gray-700">{quote.customer?.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Productos</h2>
            <div className="space-y-3">
              {quote.items?.map((item: any) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{item.product?.name}</div>
                      {item.item_type === 'curtain' ? (
                        <div className="text-sm text-zinc-600 mt-1 space-y-1">
                          <div>📐 {item.square_meters?.toFixed(2)} m² ({item.width_meters}m × {item.height_meters}m)</div>
                          <div>🎨 {item.fabric_type}</div>
                          {item.finish && <div>✨ {item.finish.name} - {formatCOP(item.finish_price || 0)}</div>}
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-600 mt-1">
                          Cantidad: {item.quantity} × {formatCOP(item.unit_price)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-zinc-600 text-lg">{formatCOP(item.subtotal)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {quote.notes && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
              <h2 className="text-lg font-black text-gray-900 mb-3">Notas</h2>
              <p className="text-gray-700 whitespace-pre-line">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-700">Subtotal:</span><span className="font-bold">{formatCOP(quote.subtotal)}</span></div>
              {quote.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Descuento:</span><span className="font-bold">-{formatCOP(quote.discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-700">IVA (19%):</span><span className="font-bold">{formatCOP(quote.tax)}</span></div>
              <div className="border-t-2 border-zinc-300 pt-3">
                <div className="flex justify-between items-center"><span className="text-lg font-black text-gray-900">TOTAL:</span><span className="text-2xl font-black text-zinc-800">{formatCOP(quote.total)}</span></div>
              </div>
              <div className={clsx("mt-4 p-3 rounded-lg text-sm font-bold text-center", isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                {isExpired ? '⚠️ Expirada' : '✓ Válida'} hasta {format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: es })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-3">
            <h3 className="text-lg font-black text-gray-900 mb-4">Acciones</h3>
            {canConvert && (
              <button onClick={handleConvertToOrder} disabled={isConverting} className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold disabled:opacity-50">
                {isConverting ? 'Convirtiendo...' : 'Convertir a Orden'}
              </button>
            )}
            {!quote.converted_order_id && quote.status !== 'expired' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-600 uppercase">Cambiar Estado</label>
                <select value={quote.status} onChange={(e) => handleChangeStatus(e.target.value)} disabled={isUpdatingStatus} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm">
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviada</option>
                  <option value="accepted">Aceptada</option>
                  <option value="rejected">Rechazada</option>
                </select>
              </div>
            )}
            <button onClick={handlePrint} className="w-full py-2 border-2 border-zinc-300 text-zinc-700 rounded-lg font-semibold hover:bg-white text-sm">
              🖨️ Imprimir
            </button>
            {canEdit && (
              <button onClick={handleDelete} disabled={isDeleting} className="w-full py-2 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 text-sm disabled:opacity-50">
                🗑️ Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

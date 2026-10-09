import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCOP } from '../utils/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notify } from '../hooks/useNotification';

interface Quote {
  id: string;
  quote_number: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
  };
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  valid_until: string;
  created_at: string;
  items: Array<{
    id: string;
    item_type: string;
    quantity: number;
    unit_price: number;
    width_meters?: number;
    height_meters?: number;
    square_meters?: number;
    fabric_type?: string;
    finish?: {
      name: string;
    };
    finish_price?: number;
    subtotal: number;
    product: {
      name: string;
    };
  }>;
}

export default function QuotePrint() {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuote();
    }
  }, [id]);

  const fetchQuote = async () => {
    try {
      const { data } = await api.get(`/quotes/${id}`);
      setQuote(data);
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error('Error fetching quote:', error);
      notify.error('Error al cargar cotización');
      setTimeout(() => window.close(), 1000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          <p className="text-zinc-600">Preparando cotización para imprimir...</p>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-after: always;
          }
        }
        
        @media screen {
          .print-content {
            max-width: 8.5in;
            min-height: 11in;
            margin: 20px auto;
            background: white;
            padding: 0.5in;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <div className="print-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6 border-b-4 border-zinc-300 pb-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-600">CortiGlow</h1>
              <p className="text-sm text-zinc-600 mt-1">Iluminación y Cortinas</p>
              <p className="text-sm text-zinc-600">+573229468431</p>
              <p className="text-sm text-zinc-600">Colombia</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 mb-2">COTIZACIÓN</div>
              <div className="text-xl font-bold text-zinc-600">{quote.quote_number}</div>
              <div className="text-sm text-zinc-600 mt-2">
                Fecha: {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: es })}
              </div>
              <div className="text-sm text-zinc-600">
                Válida hasta: {format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: es })}
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Cliente</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-gray-900 text-lg">{quote.customer.name}</div>
                <div className="text-sm text-gray-700 mt-1">{quote.customer.phone}</div>
                {quote.customer.email && (
                  <div className="text-sm text-gray-700">{quote.customer.email}</div>
                )}
              </div>
              <div>
                {quote.customer.address && (
                  <div className="text-sm text-gray-700">{quote.customer.address}</div>
                )}
                {quote.customer.city && (
                  <div className="text-sm text-gray-700">{quote.customer.city}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white shadow-sm transition-all">
                <th className="border border-blue-700 px-3 py-2 text-left text-sm font-bold">ITEM</th>
                <th className="border border-blue-700 px-3 py-2 text-left text-sm font-bold">DESCRIPCIÓN</th>
                <th className="border border-blue-700 px-3 py-2 text-right text-sm font-bold">CANT/M²</th>
                <th className="border border-blue-700 px-3 py-2 text-right text-sm font-bold">PRECIO UNIT.</th>
                <th className="border border-blue-700 px-3 py-2 text-right text-sm font-bold">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-3 text-sm font-bold">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-3 py-3">
                    <div className="font-bold text-sm">{item.product.name}</div>
                    {item.item_type === 'curtain' && (
                      <div className="text-xs text-zinc-600 mt-1 space-y-0.5">
                        <div>📐 {item.width_meters}m × {item.height_meters}m = {item.square_meters?.toFixed(2)} m²</div>
                        <div>Tela: {item.fabric_type}</div>
                        {item.finish && (
                          <div>Terminación: {item.finish.name} ({formatCOP(item.finish_price || 0)})</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right text-sm font-bold">
                    {item.item_type === 'curtain' 
                      ? `${item.square_meters?.toFixed(2)} m²` 
                      : item.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right text-sm">
                    {formatCOP(item.unit_price)}{item.item_type === 'curtain' && '/m²'}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right text-sm font-bold">
                    {formatCOP(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-6">
          <div className="w-72 space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold">{formatCOP(quote.subtotal)}</span>
            </div>
            
            {quote.discount > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-300 text-green-600">
                <span className="font-semibold">Descuento:</span>
                <span className="font-bold">-{formatCOP(quote.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold">IVA (19%):</span>
              <span className="font-bold">{formatCOP(quote.tax)}</span>
            </div>
            
            <div className="flex justify-between py-3 bg-zinc-900 text-white shadow-sm transition-all px-4 rounded-lg">
              <span className="font-bold text-lg">TOTAL:</span>
              <span className="font-bold text-2xl">{formatCOP(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {quote.notes && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="text-xs font-bold text-zinc-600 uppercase mb-2">Notas</div>
            <div className="text-sm text-gray-800 whitespace-pre-line">{quote.notes}</div>
          </div>
        )}

        {/* Términos y Condiciones */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300">
          <div className="text-xs font-bold text-zinc-600 uppercase mb-3">Términos y Condiciones</div>
          <div className="text-xs text-gray-700 space-y-2">
            <div>• Esta cotización es válida hasta el {format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: es })}.</div>
            <div>• Los precios incluyen IVA (19%).</div>
            <div>• Los precios están sujetos a cambios sin previo aviso.</div>
            <div>• El tiempo de entrega se confirmará al momento de la orden.</div>
            <div>• Para cortinas, las medidas son aproximadas y pueden variar según la instalación.</div>
            <div>• Se requiere un anticipo del 50% para iniciar la producción.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <div className="mb-2">🌟 Gracias por confiar en CortiGlow 🌟</div>
          <div>www.cortiglow.com • WhatsApp: +573229468431</div>
        </div>
      </div>

      {/* Botón para cerrar (solo visible en pantalla) */}
      <div className="no-print fixed bottom-6 right-6 space-x-3">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-zinc-900 text-white shadow-sm transition-all rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all"
        >
          Imprimir
        </button>
        <button
          onClick={() => window.close()}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold shadow-sm hover:bg-gray-700 transition-all"
        >
          ✕ Cerrar
        </button>
      </div>
    </>
  );
}


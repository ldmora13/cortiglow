// @ts-nocheck
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCOP } from '../utils/currency';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { exportToExcel } from '../utils/exportHelpers';
import { notify } from '../hooks/useNotification';

export default function SalesDashboard() {
  const [summary, setSummary] = useState<any>({});
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, salesRes, productsRes, paymentsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/sales'),
        api.get('/dashboard/top-products?limit=10'),
        api.get('/dashboard/sales-by-payment')
      ]);

      setSummary(summaryRes.data);
      setSalesData(salesRes.data);
      setTopProducts(productsRes.data);
      setPaymentStats(paymentsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get('/dashboard/export?type=sales');
      exportToExcel(data, 'reporte-ventas', 'Ventas');
      notify.success('Reporte exportado exitosamente');
    } catch (error) {
      notify.error('Error al exportar reporte');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-12 w-12 border-b-2 border-zinc-300 rounded-full"></div></div>;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header con gradiente mejorado */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8 text-zinc-900 relative overflow-hidden">
        {/* Elementos decorativos */}
        
        
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                
                Reportes de Ventas
              </h1>
              <p className="text-violet-100 text-base md:text-lg font-medium">
                Análisis completo de nuestro negocio
              </p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-zinc-600 rounded-2xl font-bold hover:bg-violet-50 active:scale-95 transition-all shadow-md hover:shadow-md min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-zinc-600 mb-1">Ventas Hoy</p>
          <p className="text-2xl font-bold text-amber-500">{formatCOP(summary.sales_today?.total || 0)}</p>
          <p className="text-sm text-gray-500">{summary.sales_today?.count || 0} órdenes</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-zinc-600 mb-1">Ventas del Mes</p>
          <p className="text-2xl font-bold text-green-600">{formatCOP(summary.sales_this_month?.total || 0)}</p>
          <p className="text-sm text-gray-500">{summary.sales_this_month?.count || 0} órdenes</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-zinc-600 mb-1">Órdenes Pendientes</p>
          <p className="text-2xl font-bold text-zinc-600">{summary.pending_orders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-zinc-600 mb-1">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-600">{summary.low_stock_products || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-bold mb-4">Ventas Últimos 30 Días</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCOP(value)} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Productos */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-bold mb-4">Productos Más Vendidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" width={100} tick={{fontSize: 11}} />
              <Tooltip />
              <Bar dataKey="total_quantity" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por método de pago */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-bold mb-4">Ventas por Método de Pago</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentStats} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={80} label>
                {paymentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCOP(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


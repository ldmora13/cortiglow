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
  const [loadError, setLoadError] = useState(false);

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
      setLoadError(false);
    } catch (error) {
      console.error(error);
      setLoadError(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Cargando reportes">
        <div className="w-10 h-10 border-[3px] border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white text-zinc-900 p-6 rounded-2xl border border-zinc-200 text-center max-w-lg mx-auto" role="alert">
        <h3 className="text-base font-bold mb-1">No se pudieron cargar los reportes</h3>
        <p className="text-sm text-zinc-500 mb-4">Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="px-4 py-2.5 min-h-[44px] rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Ventas Hoy', value: formatCOP(summary.sales_today?.total || 0), hint: `${summary.sales_today?.count || 0} órdenes` },
    { label: 'Ventas del Mes', value: formatCOP(summary.sales_this_month?.total || 0), hint: `${summary.sales_this_month?.count || 0} órdenes` },
    { label: 'Órdenes Pendientes', value: summary.pending_orders || 0, hint: 'Por atender' },
    { label: 'Stock Bajo', value: summary.low_stock_products || 0, hint: 'Requieren atención' },
  ];

  const axisMoney = (v: any) => (v >= 1000000 ? `${Math.round(v / 100000) / 10}M` : v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`);

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Reportes de Ventas
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Análisis completo del negocio
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl px-4 py-3.5 border border-zinc-200 shadow-sm">
            <p className="text-xs font-semibold text-zinc-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-zinc-900 truncate" title={String(s.value)}>{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ventas por día */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-1">Ventas Últimos 30 Días</h2>
          <p className="text-xs font-medium text-zinc-400 mb-3">Total diario en COP</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} minTickGap={28} />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip formatter={(value: any) => formatCOP(value)} />
              <Line type="monotone" dataKey="total" stroke="#18181b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Productos */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-1">Productos Más Vendidos</h2>
          <p className="text-xs font-medium text-zinc-400 mb-3">Top 5 por unidades</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} />
              <YAxis type="category" dataKey="product_name" width={100} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="total_quantity" fill="#18181b" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por método de pago */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold text-zinc-900 mb-1">Ventas por Método de Pago</h2>
          <p className="text-xs font-medium text-zinc-400 mb-3">Participación sobre el total</p>
          <div className="max-w-xl mx-auto">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={paymentStats} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={85} innerRadius={52} paddingAngle={2} strokeWidth={0}>
                  {paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCOP(value)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


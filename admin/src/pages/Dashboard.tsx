
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, isLoading, isError, refetch } = useDashboard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Cargando panel">
        <div className="w-10 h-10 border-[3px] border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white text-zinc-900 p-6 rounded-2xl border border-zinc-200 text-center max-w-lg mx-auto" role="alert">
        <h3 className="text-base font-bold mb-1">No se pudo cargar el panel</h3>
        <p className="text-sm text-zinc-500 mb-4">Hubo un problema al cargar los datos. Inténtalo de nuevo.</p>
        <button
          onClick={() => refetch?.()}
          className="px-4 py-2.5 min-h-[44px] rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const cards = [
    {
      to: '/products',
      label: 'Total Productos',
      value: stats.total_products,
      hint: 'Activos en catálogo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      to: '/customers',
      label: 'Clientes',
      value: stats.total_customers,
      hint: 'Usuarios registrados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      to: '/inventory',
      label: 'Stock Bajo',
      value: stats.low_stock_products,
      hint: 'Requieren atención',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  const salesFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.sales_this_month.total);

  const actions = [
    { to: '/orders/new', label: 'Nueva Venta', hint: 'Crear orden', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { to: '/quotes/new', label: 'Cotizar', hint: 'Nueva cotización', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to: '/products/new', label: 'Nuevo Producto', hint: 'Añadir al catálogo', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { to: '/inventory/movements', label: 'Movimiento', hint: 'Ajustar inventario', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  ];

  return (
    <div className="space-y-5 w-full">
      {/* Header — plain, no card wrapper */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            {getGreeting()}, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Pulso del negocio en tiempo real.
          </p>
        </div>
        <p className="text-xs font-medium text-zinc-400">
          {new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                {c.icon}
              </span>
              <p className="text-[0.8125rem] font-semibold text-zinc-500 leading-tight">{c.label}</p>
            </div>
            <p className="mt-3 text-2xl md:text-[1.75rem] font-bold tabular-nums tracking-tight text-zinc-900">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400">{c.hint}</p>
          </Link>
        ))}

        <Link
          to="/orders"
          className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className="text-[0.8125rem] font-semibold text-zinc-500 leading-tight">Ventas del Mes</p>
          </div>
          <p className="mt-3 text-2xl md:text-[1.75rem] font-bold tabular-nums tracking-tight truncate text-zinc-900" title={salesFormatted}>
            {salesFormatted}
          </p>
          <p className="mt-0.5 text-xs font-medium text-zinc-400">{stats.sales_this_month.count} ventas completadas</p>
        </Link>
      </div>

      {/* Quick actions */}
      <section className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Acciones Rápidas</h2>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 min-h-[56px]"
            >
              <span className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-zinc-900 truncate">{a.label}</span>
                <span className="block text-xs font-medium text-zinc-400 truncate">{a.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

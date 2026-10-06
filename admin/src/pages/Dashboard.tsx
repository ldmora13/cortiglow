
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, isLoading, isError } = useDashboard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-zinc-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center">
        <h3 className="text-xl font-bold mb-2">Error al cargar</h3>
        <p>Hubo un problema al cargar el panel principal. Por favor, recarga la página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-zinc-900/10 relative overflow-hidden">
        {/* Subtle glow orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[20rem] h-[20rem] rounded-full bg-amber-500/20 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[20rem] h-[20rem] rounded-full bg-blue-500/20 blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs md:text-sm font-bold text-zinc-200 mb-4 shadow-sm">
              <span className="mr-2">✨</span> Panel de Control Principal
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight leading-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-zinc-300 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
              Bienvenido a CortiGlow. Aquí tienes el pulso de nuestro negocio en tiempo real.
            </p>
          </div>
          <div className="hidden md:flex shrink-0">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 hover:rotate-3 transition-all duration-500 group">
              <span className="text-5xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Productos */}
        <Link
          to="/products"
          className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-zinc-100 hover:border-blue-200 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-zinc-600 group-hover:translate-x-2 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-600 font-semibold">Total Productos</p>
            <p className="text-5xl font-black text-zinc-800">{stats.total_products}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Activos en catálogo
            </p>
          </div>
        </Link>

        {/* Categorías */}
        <Link
          to="/customers"
          className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 border border-zinc-100 hover:border-amber-200 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-amber-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-zinc-600 group-hover:translate-x-2 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-600 font-semibold">Clientes</p>
            <p className="text-5xl font-black text-zinc-800">{stats.total_customers}</p>
            <p className="text-xs text-zinc-600 flex items-center gap-1 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              Usuarios registrados
            </p>
          </div>
        </Link>

        {/* Alertas de Stock */}
        <Link
          to="/inventory"
          className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 border border-zinc-100 hover:border-orange-200 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-orange-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-zinc-600 group-hover:translate-x-2 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-600 font-semibold">Stock Bajo</p>
            <p className="text-5xl font-black text-zinc-800">{stats.low_stock_products}</p>
            <p className="text-xs text-orange-600 flex items-center gap-1 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Requieren atención pronto
            </p>
          </div>
        </Link>

        {/* Sin Stock */}
        <Link
          to="/orders"
          className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border border-zinc-100 hover:border-emerald-200 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-emerald-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-zinc-600 group-hover:translate-x-2 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-600 font-semibold">Ventas del Mes</p>
            <p className="text-3xl font-black text-zinc-800 truncate" title={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(stats.sales_this_month.total)}>
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.sales_this_month.total)}
            </p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {stats.sales_this_month.count} ventas completadas
            </p>
          </div>
        </Link>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-zinc-100">
        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <span className="text-3xl">🚀</span> Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/orders/new"
            className="flex flex-col items-center p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 bg-white text-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-bold">Nueva Venta</span>
            <span className="text-xs mt-1 text-zinc-500 group-hover:text-zinc-400">Crear orden de compra</span>
          </Link>
          
          <Link
            to="/quotes/new"
            className="flex flex-col items-center p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 bg-white text-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold">Cotizar</span>
            <span className="text-xs mt-1 text-zinc-500 group-hover:text-zinc-400">Crear nueva cotización</span>
          </Link>

          <Link
            to="/products/new"
            className="flex flex-col items-center p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 bg-white text-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-bold">Nuevo Producto</span>
            <span className="text-xs mt-1 text-zinc-500 group-hover:text-zinc-400">Añadir al catálogo</span>
          </Link>

          <Link
            to="/inventory/movements"
            className="flex flex-col items-center p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 bg-white text-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-bold">Movimiento</span>
            <span className="text-xs mt-1 text-zinc-500 group-hover:text-zinc-400">Ajustar inventarios</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import NotificationContainer from './NotificationContainer';
import { LayoutDashboard, Users, FileText, ShoppingCart, Package, Tags, Layers, Box, Truck, BarChart3, Shield, History } from 'lucide-react';

export default function Layout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-zinc-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="mt-6 text-zinc-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    { 
      name: 'Clientes', 
      path: '/customers',
      icon: <Users className="w-5 h-5" />
    },
    { 
      name: 'Cotizaciones', 
      path: '/quotes',
      icon: <FileText className="w-5 h-5" />
    },
    { 
      name: 'Ventas', 
      path: '/orders',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    { 
      name: 'Productos', 
      path: '/products',
      icon: <Package className="w-5 h-5" />
    },
    { 
      name: 'Categorías', 
      path: '/categories',
      icon: <Tags className="w-5 h-5" />
    },
    { 
      name: 'Terminaciones', 
      path: '/finishes',
      icon: <Layers className="w-5 h-5" />
    },
    { 
      name: 'Inventario', 
      path: '/inventory',
      icon: <Box className="w-5 h-5" />
    },
    { 
      name: 'Proveedores', 
      path: '/providers',
      icon: <Truck className="w-5 h-5" />
    },
    { 
      name: 'Reportes', 
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      name: 'Usuarios', 
      path: '/users',
      icon: <Shield className="w-5 h-5" />
    }
  ];

  if (user?.role === 'admin') {
    navItems.push({
      name: 'Auditoría',
      path: '/audit',
      icon: <History className="w-5 h-5" />
    });
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-xl shadow-md border-r border-zinc-200 transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col",
        isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}>
        {/* Logo/Brand */}
        <div className={clsx(
          "flex-shrink-0 p-6 border-b border-zinc-200 bg-white flex items-center relative",
          isCollapsed ? "justify-center px-2" : "justify-between"
        )}>
          <div className={clsx("flex items-center", isCollapsed ? "" : "space-x-3")}>
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="CortiGlow Logo" className="h-10 w-auto object-contain drop-shadow-md" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  CortiGlow
                </h1>
                <p className="text-xs text-zinc-600 font-medium">Panel Admin</p>
              </div>
            )}
          </div>
          {/* Toggle Collapse - Desktop only */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={clsx(
              "hidden lg:flex absolute -right-3 top-8 bg-white border border-zinc-200 shadow-sm rounded-full p-1 text-zinc-600 hover:text-zinc-900 transition-all z-10",
              isCollapsed && "rotate-180"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Close button - Mobile only */}
          <button 
            onClick={closeMobileMenu}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors absolute right-4"
          >
            <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={clsx(
                  'flex items-center rounded-xl mb-2 transition-all duration-300 min-h-[44px] transform relative group',
                  isCollapsed ? 'justify-center px-0 py-3.5' : 'space-x-3 px-4 py-3.5',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-bold border-l-4 border-amber-500 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-zinc-900 active:scale-95'
                )}
              >
                <div className={clsx(isCollapsed && !isActive && "group-hover:scale-110 transition-transform")}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                
                {/* Custom Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-zinc-700">
                    {item.name}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-zinc-700"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={clsx(
          "flex-shrink-0 p-4 border-t border-zinc-200 bg-white backdrop-blur-xl transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 mb-3 bg-white/70 rounded-xl p-2.5 shadow-sm">
              <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                <p className="text-xs text-zinc-600 font-medium">Administrador</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4 relative group cursor-pointer">
              <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-zinc-700">
                {user.email}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-zinc-700"></div>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className={clsx(
              "flex items-center justify-center text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all transform active:scale-95 font-medium shadow-sm hover:shadow-md min-h-[44px] relative group",
              isCollapsed ? "w-full p-2.5" : "w-full space-x-2 px-4 py-2.5 hover:scale-[1.02]"
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>Cerrar Sesión</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                Cerrar Sesión
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              {/* Mobile Hamburger + Title */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-zinc-50 active:scale-95 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shadow-sm"
                >
                  <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    {navItems.find((i) => {
                      if (i.path === '/') return location.pathname === '/';
                      return location.pathname.startsWith(i.path);
                    })?.name || 'Admin'}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-0.5 hidden sm:block font-medium">
                    Gestiona nuestro negocio eficientemente
                  </p>
                </div>
              </div>

              {/* Notification Bell - Hidden on small mobile */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button className="relative p-2.5 text-zinc-500 hover:text-zinc-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-zinc-50 active:scale-95 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-zinc-500 to-rose-500 rounded-full animate-pulse shadow-lg"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
}

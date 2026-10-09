import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import NotificationContainer from './NotificationContainer';
import { Users, FileText, ShoppingCart, Package, Tags, Layers, Box, BarChart3, Shield, History } from 'lucide-react';

export default function Layout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
          <div className="w-10 h-10 border-[3px] border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto" role="status" aria-label="Cargando" />
          <p className="mt-4 text-sm text-zinc-500 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user?.role === 'admin';

  const navItems = [
    ...(isAdmin
      ? [
          {
            name: 'Usuarios',
            path: '/users',
            icon: <Shield className="w-5 h-5" />,
          },
        ]
      : []),
    {
      name: 'Clientes',
      path: '/customers',
      icon: <Users className="w-5 h-5" />
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
      name: 'Productos',
      path: '/products',
      icon: <Package className="w-5 h-5" />
    },
    {
      name: 'Inventario',
      path: '/inventory',
      icon: <Box className="w-5 h-5" />
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
      name: 'Reportes',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />
    },
    ...(isAdmin
      ? [
          {
            name: 'Auditoría',
            path: '/audit',
            icon: <History className="w-5 h-5" />,
          },
        ]
      : []),
  ];

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
        "fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-60"
      )}>
        {/* Logo/Brand */}
        <div className={clsx(
          "flex-shrink-0 px-4 py-4 border-b border-zinc-200 bg-white flex items-center relative",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900" aria-label="Ir al panel principal">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="CortiGlow Logo" className="h-10 w-auto object-contain drop-shadow-md" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-base font-bold text-zinc-900 leading-tight">
                  CortiGlow
                </h1>
                <p className="text-xs text-zinc-500 font-medium">Panel Admin</p>
              </div>
            )}
          </Link>
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
                  'flex items-center rounded-xl mb-1 transition-colors min-h-[44px]',
                  isCollapsed ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-2.5',
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                <div className={clsx(isCollapsed && "group-hover:scale-110 transition-transform")}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                
                {/* Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div role="tooltip" className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex justify-between items-center">
              {/* Mobile Hamburger + Title */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Abrir menú de navegación"
                  className="lg:hidden p-2 hover:bg-zinc-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                    {location.pathname === '/' ? 'Dashboard' : (
                      navItems.find((i) => location.pathname.startsWith(i.path))?.name || 'Admin'
                    )}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block font-medium">
                    Gestiona el negocio
                  </p>
                </div>
              </div>

              {/* Notifications + Profile */}
              <div className="flex items-center gap-1.5">
                <button aria-label="Notificaciones" className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(v => !v)}
                    aria-label="Abrir menú de usuario"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                    className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 transition-colors"
                  >
                    <span className="font-bold text-sm" aria-hidden="true">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </button>
                  {isProfileOpen && (
                    <>
                      <button
                        aria-hidden="true"
                        tabIndex={-1}
                        onClick={() => setIsProfileOpen(false)}
                        className="fixed inset-0 z-40 cursor-default bg-transparent"
                      />
                      <div
                        role="menu"
                        aria-label="Menú de usuario"
                        onKeyDown={(e) => { if (e.key === 'Escape') setIsProfileOpen(false); }}
                        className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden"
                      >
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <span className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0" aria-hidden="true">
                            <span className="font-bold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-zinc-900 truncate">{user.email}</span>
                            <span className="mt-0.5 inline-block text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-100 rounded-md px-1.5 py-0.5">
                              {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                            </span>
                          </span>
                        </div>
                        <div className="border-t border-zinc-100 p-2">
                          <button
                            role="menuitem"
                            onClick={() => { setIsProfileOpen(false); signOut(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset transition-colors text-left"
                          >
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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

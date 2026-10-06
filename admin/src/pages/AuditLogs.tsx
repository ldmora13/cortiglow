import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, ChevronDown, ChevronUp, Calendar, User as UserIcon, Box, Activity, X, Filter } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../hooks/useUsers';

export default function AuditLogs() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [performedBy, setPerformedBy] = useState<string>('');
  
  const { users } = useUsers();

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entityType, actionFilter, dateFrom, dateTo, performedBy],
    queryFn: async () => {
      let url = `/audit?page=${page}`;
      if (entityType) url += `&entity_type=${entityType}`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      if (performedBy) url += `&performed_by=${performedBy}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: user?.role === 'admin',
    staleTime: 0,
    refetchOnMount: 'always'
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <History className="h-16 w-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-medium">Acceso Denegado</h2>
        <p className="mt-2">Solo los administradores pueden ver el historial de auditoría.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Creación';
      case 'UPDATE': return 'Edición';
      case 'DELETE': return 'Eliminación';
      case 'UPDATE_STATUS': return 'Cambio de Estado';
      case 'REGISTER_PAYMENT': return 'Registro de Pago';
      default: return action;
    }
  };

  const clearFilters = () => {
    setEntityType('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setPerformedBy('');
    setPage(1);
  };

  const hasActiveFilters = entityType || actionFilter || dateFrom || dateTo || performedBy;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Auditoría del Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">Historial detallado de todas las acciones importantes.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
            <Filter className="h-4 w-4" />
            <h3>Filtros de Búsqueda</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-full"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Desde
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 bg-white/50 text-gray-700 transition-colors hover:bg-white"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Hasta
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 bg-white/50 text-gray-700 transition-colors hover:bg-white"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Usuario
            </label>
            <select 
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 bg-white/50 text-gray-700 transition-colors hover:bg-white"
              value={performedBy}
              onChange={(e) => { setPerformedBy(e.target.value); setPage(1); }}
            >
              <option value="">Todos los usuarios</option>
              {users?.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
              <option value="SYSTEM">Sistema Automático</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5" /> Módulo
            </label>
            <select 
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 bg-white/50 text-gray-700 transition-colors hover:bg-white"
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
            >
              <option value="">Todos los módulos</option>
              <option value="PRODUCT">Productos</option>
              <option value="CUSTOMER">Clientes</option>
              <option value="ORDER">Órdenes</option>
              <option value="QUOTE">Cotizaciones</option>
              <option value="PROVIDER">Proveedores</option>
              <option value="INVENTORY">Inventario</option>
              <option value="USER">Usuarios</option>
              <option value="FINISH">Acabados</option>
              <option value="CATEGORY">Categorías</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Acción
            </label>
            <select 
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 bg-white/50 text-gray-700 transition-colors hover:bg-white"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todas las acciones</option>
              <option value="CREATE">Creación</option>
              <option value="UPDATE">Edición</option>
              <option value="DELETE">Eliminación</option>
              <option value="UPDATE_STATUS">Cambio Estado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl shadow-gray-200/20 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Módulo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Cargando historial...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay registros de auditoría aún.
                  </td>
                </tr>
              ) : (
                data?.data?.map((log: any) => (
                  <React.Fragment key={log.id}>
                    <tr className={`hover:bg-gray-50/50 transition-colors ${expandedId === log.id ? 'bg-gray-50/80' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shadow-inner">
                            {log.user?.full_name?.charAt(0) || log.user?.email?.charAt(0) || 'S'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{log.user?.full_name || 'Sistema'}</p>
                            <p className="text-xs text-gray-500">{log.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {log.entity_type}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">{log.entity_id.substring(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionName(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                          {expandedId === log.id ? 'Ocultar' : 'Ver JSON'}
                          {expandedId === log.id ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50/80 border-b border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Valores Anteriores (Antes)</h4>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto max-h-60 overflow-y-auto">
                                {log.old_values ? JSON.stringify(log.old_values, null, 2) : 'Ninguno / Registro Nuevo'}
                              </pre>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Valores Nuevos (Después)</h4>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto max-h-60 overflow-y-auto">
                                {log.new_values ? JSON.stringify(log.new_values, null, 2) : 'Ninguno / Eliminación'}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Setup */}
        {data?.meta && (
          <div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200">
            <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
              Mostrando {((page - 1) * (data.meta.limit || 15)) + 1} a {Math.min(page * (data.meta.limit || 15), data.meta.total)} de {data.meta.total} resultados
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.meta.total_pages, p + 1))}
                disabled={page === data.meta.total_pages}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Package, Calendar, FileText, Search } from 'lucide-react';

export default function InventoryMovements() {
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const { movements, isLoadingMovements } = useInventory();

  const filteredMovements = movements.filter((m: any) => {
    // Filtro por tipo
    if (filterType === 'IN' && m.quantity <= 0) return false;
    if (filterType === 'OUT' && m.quantity >= 0) return false;
    
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const productName = m.inventory?.product?.name?.toLowerCase() || '';
      const reason = m.reason?.toLowerCase() || '';
      const user = m.performed_by?.toLowerCase() || '';
      
      if (!productName.includes(query) && !reason.includes(query) && !user.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovements = filteredMovements.slice(startIndex, startIndex + itemsPerPage);

  const getMovementInfo = (quantity: number) => {
    if (quantity > 0) {
      return { label: 'Entrada', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />, sign: '+' };
    } else {
      return { label: 'Salida', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <ArrowDownRight className="w-3.5 h-3.5 mr-1" />, sign: '' };
    }
  };

  if (isLoadingMovements) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 md:pb-6 w-full">
      {movements.length > 0 ? (
        <>
          <div>
          <Link to="/inventory" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Inventario
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">Historial de Movimientos</h1>
              <p className="text-sm font-medium text-zinc-500">Registro de todas las entradas y salidas de stock</p>
            </div>
            
            <div className="flex bg-zinc-100 p-1 rounded-xl w-full md:w-auto">
              <button onClick={() => { setFilterType(''); setCurrentPage(1); }} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === '' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                Todos
              </button>
              <button onClick={() => { setFilterType('IN'); setCurrentPage(1); }} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'IN' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-emerald-600'}`}>
                <ArrowUpRight className="w-4 h-4" /> Entradas
              </button>
              <button onClick={() => { setFilterType('OUT'); setCurrentPage(1); }} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'OUT' ? 'bg-white text-rose-700 shadow-sm' : 'text-zinc-500 hover:text-rose-600'}`}>
                <ArrowDownRight className="w-4 h-4" /> Salidas
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 relative flex items-center transition-all focus-within:ring-2 focus-within:ring-zinc-900 focus-within:bg-white focus-within:border-transparent">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por producto, usuario o razón..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-11 pr-4 py-3.5 border-none bg-transparent focus:ring-0 font-medium text-sm text-zinc-800 placeholder-zinc-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="pr-4 text-zinc-400 hover:text-zinc-600 font-bold text-sm transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No se encontraron movimientos con este filtro.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Razón / Detalles</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {paginatedMovements.map((movement: any) => {
                  const info = getMovementInfo(movement.quantity);
                  const date = new Date(movement.created_at);
                  
                  return (
                    <tr key={movement.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">{date.toLocaleDateString()}</span>
                          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {movement.inventory?.product?.images?.[0] ? <img src={movement.inventory.product.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="w-5 h-5 text-zinc-300" />}
                          </div>
                          <div className="ml-3"><span className="text-sm font-bold text-zinc-900 block">{movement.inventory?.product?.name || 'Producto Desconocido'}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${info.color}`}>{info.icon}{info.label}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">{(movement.performed_by || 'S').charAt(0).toUpperCase()}</div>
                          <span className="text-sm font-bold text-zinc-700">{movement.performed_by || 'Sistema'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right"><span className={`text-lg font-bold ${movement.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{info.sign}{movement.quantity}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-zinc-600 font-medium bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 inline-block">{movement.reason}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMovements.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 font-medium text-center sm:text-left">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredMovements.length)} de {filteredMovements.length} movimientos
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-100 transition-colors bg-white"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
      </>
      ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-zinc-100">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Sin Movimientos</h3>
            <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto font-medium">Aún no se han registrado movimientos de inventario en el sistema.</p>
          </div>
        )}
    </div>
  );
}

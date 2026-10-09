// @ts-nocheck
import { useState, useEffect } from 'react';
import { formatCOP } from '../utils/currency';
import { notify } from '../hooks/useNotification';
import clsx from 'clsx';

interface Finish {
  id: string;
  name: string;
  price_type: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CurtainData {
  width_meters: number;
  height_meters: number;
  fabric_type: string;
  finish_id: string;
}

interface CurtainCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  finishes: Finish[];
  onAdd: (data: CurtainData & { square_meters: number; finish_price: number; subtotal: number }) => void;
}

export default function CurtainCalculator({
  isOpen,
  onClose,
  product,
  finishes,
  onAdd
}: CurtainCalculatorProps) {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [selectedFinishId, setSelectedFinishId] = useState('');

  // Resetear cuando se abre
  useEffect(() => {
    if (isOpen) {
      setWidth('');
      setHeight('');
      setFabricType('');
      setSelectedFinishId(finishes[0]?.id || '');
    }
  }, [isOpen, finishes]);

  const widthNum = parseFloat(width) || 0;
  const heightNum = parseFloat(height) || 0;
  const squareMeters = widthNum * heightNum;
  const fabricCost = squareMeters * product.price;
  
  const selectedFinish = finishes.find(f => f.id === selectedFinishId);
  
  // Calcular precio de terminación
  const calculateFinishPrice = (): number => {
    if (!selectedFinish) return 0;
    
    switch (selectedFinish.price_type) {
      case 'FIXED':
        return selectedFinish.price;
      case 'PER_METER':
        const linearMeters = Math.max(widthNum, heightNum);
        return selectedFinish.price * linearMeters;
      case 'PERCENTAGE':
        return (fabricCost * selectedFinish.price) / 100;
      default:
        return 0;
    }
  };
  
  const finishPrice = calculateFinishPrice();
  const subtotal = fabricCost + finishPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!width || !height || !fabricType || !selectedFinishId) {
      notify.warning('Por favor completa todos los campos');
      return;
    }
    
    if (widthNum <= 0 || heightNum <= 0) {
      notify.warning('Las dimensiones deben ser mayores a 0');
      return;
    }
    
    onAdd({
      width_meters: widthNum,
      height_meters: heightNum,
      fabric_type: fabricType,
      finish_id: selectedFinishId,
      square_meters: squareMeters,
      finish_price: finishPrice,
      subtotal
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] border border-zinc-200">
        {/* Header Modal */}
        <div className="relative p-5 pb-4 border-b border-zinc-100 bg-white z-20 flex-shrink-0">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 pr-8">
              <h2 className="text-base font-bold tracking-tight text-zinc-900 truncate">
                Configurar Cortina
              </h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5 truncate">
                {product.name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Dimensiones */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ancho (metros) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                placeholder="Ej: 2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Alto (metros) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                placeholder="Ej: 1.8"
              />
            </div>
          </div>

          {/* Metros cuadrados */}
          {squareMeters > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 border border-zinc-200">
              <p className="text-sm font-semibold text-zinc-600 mb-1">Área Total</p>
              <p className="text-3xl font-bold text-zinc-700">
                {squareMeters.toFixed(2)} m²
              </p>
            </div>
          )}

          {/* Tipo de Tela */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de Tela *
            </label>
            <input
              type="text"
              required
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              placeholder="Ej: Blackout, Sunscreen, Roller"
            />
          </div>

          {/* Terminación */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Terminación *
            </label>
            <select
              value={selectedFinishId}
              onChange={(e) => setSelectedFinishId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              required
            >
              <option value="">Selecciona una terminación</option>
              {finishes.map(finish => (
                <option key={finish.id} value={finish.id}>
                  {finish.name} - {
                    finish.price_type === 'FIXED' ? formatCOP(finish.price) :
                    finish.price_type === 'PER_METER' ? `${formatCOP(finish.price)}/m` :
                    `${finish.price}%`
                  }
                </option>
              ))}
            </select>
          </div>

          {/* Cálculo en Tiempo Real */}
          {squareMeters > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 border border-zinc-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>Desglose de Costos</span>
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">
                    Tela ({squareMeters.toFixed(2)} m² × {formatCOP(product.price)}/m²)
                  </span>
                  <span className="font-bold text-gray-900">{formatCOP(fabricCost)}</span>
                </div>
                
                {selectedFinish && finishPrice > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Terminación ({selectedFinish.name})
                    </span>
                    <span className="font-bold text-gray-900">{formatCOP(finishPrice)}</span>
                  </div>
                )}
                
                <div className="border-t-2 border-zinc-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                    <span className="text-3xl font-bold text-zinc-800">
                      {formatCOP(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones / Footer Modal */}
          <div className="pt-6 mt-6 border-t border-zinc-100 flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3.5 text-zinc-600 bg-white border-2 border-zinc-200 font-bold rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!width || !height || !fabricType || !selectedFinishId}
              className="flex-1 sm:flex-none px-6 py-3.5 text-white bg-zinc-900 border-2 border-zinc-900 font-bold rounded-xl hover:bg-zinc-800 hover:border-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              Agregar al Carrito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


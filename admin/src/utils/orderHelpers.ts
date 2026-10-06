// Generar número de orden único
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}-${random}`;
}

// Calcular total de orden
export function calculateOrderTotal(
  items: Array<{ quantity: number; unit_price: number }>,
  discount: number = 0,
  tax: number = 0,
  deliveryCost: number = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  const total = subtotal - discount + tax + deliveryCost;

  return { subtotal, total };
}

// Formatear estado de orden para display
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  return statusMap[status] || status;
}

// Obtener color del badge según el estado
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'gray',
    confirmed: 'blue',
    in_progress: 'yellow',
    completed: 'green',
    cancelled: 'red'
  };

  return colorMap[status] || 'gray';
}

// Formatear método de pago
export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    efectivo: 'Efectivo',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    pse: 'PSE',
    transferencia: 'Transferencia',
    tarjeta: 'Tarjeta'
  };

  return methodMap[method] || method;
}

// Calcular IVA (19% por defecto en Colombia)
export function calculateTax(amount: number, taxRate: number = 0.19): number {
  return Math.round(amount * taxRate);
}

// Validar stock disponible
export function validateStock(
  inventory: { quantity: number },
  requestedQuantity: number
): { valid: boolean; message?: string } {
  if (requestedQuantity <= 0) {
    return { valid: false, message: 'La cantidad debe ser mayor a 0' };
  }

  if (requestedQuantity > inventory.quantity) {
    return {
      valid: false,
      message: `Stock insuficiente. Disponible: ${inventory.quantity}`
    };
  }

  return { valid: true };
}

// Obtener fechas para filtros rápidos
export function getQuickDateRange(range: 'today' | 'week' | 'month' | 'year'): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        from: weekStart,
        to: now
      };
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        from: monthStart,
        to: now
      };
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return {
        from: yearStart,
        to: now
      };
    default:
      return { from: today, to: now };
  }
}





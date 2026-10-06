/**
 * Utilidades para formatear moneda colombiana (COP)
 */

export function formatCOP(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-CO').format(amount);
}

// Alias común en Colombia
export const formatPesos = formatCOP;





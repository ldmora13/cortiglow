/**
 * Utilidades para formatear moneda colombiana (COP) en el Admin Panel
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

export function parseCOPInput(input: string): number {
  // Remove currency symbols, dots (thousands separator) and spaces
  const cleaned = input.replace(/[$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// Alias común en Colombia
export const formatPesos = formatCOP;





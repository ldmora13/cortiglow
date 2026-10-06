import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un numero de cotizacion unico en formato QT-YYYY-NNNN
 * Ejemplo: QT-2024-0001
 */
export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  
  const lastQuote = await prisma.quote.findFirst({
    where: { 
      quote_number: { 
        startsWith: prefix 
      } 
    },
    orderBy: { quote_number: 'desc' }
  });
  
  let nextNumber = 1;
  if (lastQuote) {
    const lastNumberStr = lastQuote.quote_number.split('-')[2];
    const lastNumber = parseInt(lastNumberStr, 10);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Calcula el precio de una terminacion segun su tipo
 */
export function calculateFinishPrice(
  finish: { price_type: string; price: any },
  squareMeters: number,
  widthMeters: number,
  heightMeters: number,
  fabricCost: number
): number {
  const price = typeof finish.price === 'number' ? finish.price : parseFloat(finish.price.toString());
  
  switch (finish.price_type) {
    case 'FIXED':
      // Precio fijo por cortina
      return price;
      
    case 'PER_METER':
      // Precio por metro lineal (usa el mayor entre ancho y alto)
      const linearMeters = Math.max(widthMeters, heightMeters);
      return price * linearMeters;
      
    case 'PERCENTAGE':
      // Porcentaje sobre el costo de la tela
      return (fabricCost * price) / 100;
      
    default:
      return 0;
  }
}

/**
 * Calcula los valores de un item de cotizacion
 */
export interface QuoteItemCalculation {
  unit_price: number;
  square_meters?: number;
  finish_price?: number;
  subtotal: number;
}

export function calculateQuoteItem(
  item: {
    item_type: string;
    quantity: number;
    width_meters?: number;
    height_meters?: number;
  },
  product: { price: any },
  finish?: { price_type: string; price: any } | null
): QuoteItemCalculation {
  const productPrice = typeof product.price === 'number' 
    ? product.price 
    : parseFloat(product.price.toString());
  
  if (item.item_type === 'unit') {
    // Iluminacion: cantidad x precio unitario
    const subtotal = item.quantity * productPrice;
    return {
      unit_price: productPrice,
      subtotal
    };
  } else if (item.item_type === 'curtain') {
    // Cortinas: m² x precio + terminacion
    const widthMeters = item.width_meters || 0;
    const heightMeters = item.height_meters || 0;
    const squareMeters = widthMeters * heightMeters;
    const fabricCost = squareMeters * productPrice;
    
    let finishPrice = 0;
    if (finish) {
      finishPrice = calculateFinishPrice(
        finish,
        squareMeters,
        widthMeters,
        heightMeters,
        fabricCost
      );
    }
    
    const subtotal = fabricCost + finishPrice;
    
    return {
      unit_price: productPrice,
      square_meters: squareMeters,
      finish_price: finishPrice,
      subtotal
    };
  }
  
  // Tipo no reconocido
  return {
    unit_price: productPrice,
    subtotal: 0
  };
}

/**
 * Calcula los totales de una cotizacion
 */
export interface QuoteTotals {
  subtotal: number;
  discount: number;
  taxable_amount: number;
  tax: number;
  total: number;
}

export function calculateQuoteTotals(
  itemsSubtotal: number,
  discount: number = 0,
  taxRate: number = 0.19 // 19% IVA por defecto
): QuoteTotals {
  const subtotal = itemsSubtotal;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * taxRate;
  const total = subtotal - discount + tax;
  
  return {
    subtotal,
    discount,
    taxable_amount: taxableAmount,
    tax,
    total
  };
}





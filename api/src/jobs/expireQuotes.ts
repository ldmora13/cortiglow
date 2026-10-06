import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tarea programada para expirar cotizaciones automaticamente
 * Se ejecuta diariamente a las 00:00
 */
export function startQuoteExpirationJob() {
  // Ejecutar todos los dias a medianoche
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      
      const result = await prisma.quote.updateMany({
        where: {
          valid_until: { lt: now },
          status: { in: ['draft', 'sent'] }
        },
        data: { status: 'expired' }
      });
      
      if (result.count > 0) {
        console.log(`[${new Date().toISOString()}] Expired ${result.count} quotes`);
      }
    } catch (error) {
      console.error('[Quote Expiration Job] Error:', error);
    }
  });
  
  console.log('📅 Quote expiration cron job started - runs daily at 00:00');
}

/**
 * Funcion para ejecutar la expiracion manualmente (util para testing)
 */
export async function expireQuotesNow() {
  try {
    const now = new Date();
    
    const result = await prisma.quote.updateMany({
      where: {
        valid_until: { lt: now },
        status: { in: ['draft', 'sent'] }
      },
      data: { status: 'expired' }
    });
    
    console.log(`Expired ${result.count} quotes`);
    return result;
  } catch (error) {
    console.error('Error expiring quotes:', error);
    throw error;
  }
}





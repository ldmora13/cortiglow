import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';
import inventoryMovementsRoutes from './routes/inventory-movements';
import customerRoutes from './routes/customers';
import orderRoutes from './routes/orders';
import dashboardRoutes from './routes/dashboard';
import finishesRoutes from './routes/finishes';
import quotesRoutes from './routes/quotes';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import providerRoutes from './routes/providers';
import auditRoutes from './routes/audit.routes';
import path from 'path';
import { startQuoteExpirationJob } from './jobs/expireQuotes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes - Existing
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);

// Routes - Inventory & Sales System
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-movements', inventoryMovementsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Routes - Quotes System
app.use('/api/finishes', finishesRoutes);
app.use('/api/quotes', quotesRoutes);

app.get('/', (req, res) => {
  res.send('CortiGlow API Running - Inventory & Sales System Enabled');
});

// Ruta de salud que NO usa la base de datos (útil cuando la DB está apagada)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API running' });
});

// Manejador global de errores: si la DB está apagada, no caer el proceso
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err?.message || err);
  const isDbError = err?.code === 'P1001' || err?.message?.includes('connect') || err?.message?.includes('ECONNREFUSED');
  res.status(isDbError ? 503 : 500).json({
    error: isDbError ? 'Base de datos no disponible' : 'Error interno del servidor',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`✓ Products & Categories API`);
  console.log(`✓ Inventory Management API`);
  console.log(`✓ Orders & Sales API`);
  console.log(`✓ Dashboard & Reports API`);
  console.log(`✓ Quotes & Finishes API`);
  console.log(`✓ Health (sin DB): GET /api/health`);
  // Iniciar cron job para expirar cotizaciones
  startQuoteExpirationJob();
});



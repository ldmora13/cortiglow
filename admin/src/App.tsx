import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { JSX } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Providers from './pages/Providers';
import Inventory from './pages/Inventory';
import InventoryMovements from './pages/InventoryMovements';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import OrderDetail from './pages/OrderDetail';
import SalesDashboard from './pages/SalesDashboard';
import Finishes from './pages/Finishes';
import Quotes from './pages/Quotes';
import QuoteForm from './pages/QuoteForm';
import QuoteDetail from './pages/QuoteDetail';
import QuotePrint from './pages/QuotePrint';
import AuditLogs from './pages/AuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Siempre obtener datos frescos al cambiar de pantalla
    },
  },
});

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return children;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/quotes/:id/print" element={<QuotePrint />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductForm />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/users" element={<RequireAdmin><Users /></RequireAdmin>} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/movements" element={<InventoryMovements />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/reports" element={<SalesDashboard />} />
              <Route path="/finishes" element={<Finishes />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/quotes/new" element={<QuoteForm />} />
              <Route path="/quotes/:id" element={<QuoteDetail />} />
              <Route path="/audit" element={<RequireAdmin><AuditLogs /></RequireAdmin>} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

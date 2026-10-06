import { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export default function CatalogSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(`${API_URL}/products`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Server error');
        return res.text();
      })
      .then((text) => {
        if (cancelled) return [];
        const data = text ? JSON.parse(text) : [];
        return Array.isArray(data) ? data : [];
      })
      .then((list) => {
        if (!cancelled) {
          setProducts(list);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setError('No hay conexión con la base de datos. Por favor, intente más tarde.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <>
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm" role="alert">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-amber-800">Servicio temporalmente no disponible</p>
                <p className="text-sm text-amber-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="py-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                Catálogo CortiGlow
              </h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                Iluminación LED y Cortinas · {loading ? '...' : `${products.length} productos`}
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
              <a
                href="/categoria/iluminacion"
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium border border-neutral-800"
              >
                Iluminación
              </a>
              <a
                href="/categoria/cortinas"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Cortinas
              </a>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="inline-block w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p>Cargando catálogo...</p>
            </div>
          ) : (
            <ProductGrid initialProducts={products} />
          )}
        </div>
      </section>
    </>
  );
}

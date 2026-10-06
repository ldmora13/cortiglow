import { useState, useMemo } from 'react';
import { formatCOP } from '../utils/currency';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../services/product.service';
import type { Category } from '../services/category.service';
import QueryProvider from './QueryProvider';

interface Props {
  initialProducts?: Product[];
  categorySlug?: string;
}

function ProductGridContent({ initialProducts, categorySlug }: Props) {
  const { products, isLoadingProducts } = useProducts();
  const { categories, isLoadingCategories } = useCategories();
  
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  const isLoading = isLoadingProducts || isLoadingCategories;

  // Derive subcategories based on the target slug
  const targetCategory = useMemo(() => {
    return categorySlug ? categories.find(c => c.slug === categorySlug) : null;
  }, [categorySlug, categories]);

  const subcategories = useMemo(() => {
    if (!targetCategory) return [];
    return categories.filter(c => c.parent_id === targetCategory.id);
  }, [targetCategory, categories]);

  // Filter products for the current view
  const displayedProducts = useMemo(() => {
    let filteredProducts = initialProducts && initialProducts.length > 0 ? initialProducts : products;

    const getDescendantIds = (parentId: string): string[] => {
      const children = categories.filter((c: Category) => c.parent_id === parentId);
      let ids: string[] = [];
      for (const child of children) {
        ids.push(child.id);
        ids = ids.concat(getDescendantIds(child.id));
      }
      return ids;
    };

    if (categorySlug && targetCategory) {
      const activeFilterId = activeSubcategory || targetCategory.id;
      const validIds = [activeFilterId, ...getDescendantIds(activeFilterId)];
      return filteredProducts.filter(p => p.category_id && validIds.includes(p.category_id));
    }

    if (activeSubcategory) {
      const validIds = [activeSubcategory, ...getDescendantIds(activeSubcategory)];
      return filteredProducts.filter(p => p.category_id && validIds.includes(p.category_id));
    }

    return filteredProducts;
  }, [products, initialProducts, categorySlug, targetCategory, activeSubcategory, categories]);

  if (isLoading && (!initialProducts || initialProducts.length === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="group block relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 animate-pulse">
            <div className="aspect-[4/5] bg-trueblack-800 m-2 rounded-[1.5rem]"></div>
            <div className="p-6">
              <div className="h-6 bg-trueblack-800 rounded-md w-3/4 mb-4"></div>
              <div className="w-8 h-px bg-white/10 my-4"></div>
              <div className="flex items-end justify-between mt-4">
                <div className="h-8 bg-trueblack-800 rounded-md w-1/2"></div>
                <div className="w-10 h-10 rounded-full bg-trueblack-800"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-trueblack-900 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/10 to-transparent"></div>
        <div className="relative z-10 w-20 h-20 bg-trueblack-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(212,175,55,0.1)] border border-white/10">
          <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-3xl font-heading font-semibold text-white mb-3">Colección en Preparación</h3>
        <p className="text-gray-400 font-light">Estamos seleccionando las mejores piezas para nuestro catálogo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Subcategories Filter Pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveSubcategory(null)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg border ${
              activeSubcategory === null 
                ? 'bg-gold-500 text-trueblack-900 border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                : 'bg-trueblack-800 text-gray-300 border-white/10 hover:border-gold-500/50 hover:text-gold-400'
            }`}
          >
            Ver Todo
          </button>
          {subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcategory(sub.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg border ${
                activeSubcategory === sub.id 
                  ? 'bg-gold-500 text-trueblack-900 border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'bg-trueblack-800 text-gray-300 border-white/10 hover:border-gold-500/50 hover:text-gold-400'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayedProducts.map((product) => (
          <a 
            key={product.id} 
            href={`/producto/${product.id}`}
            className="group block relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[2rem] overflow-hidden transition-all duration-500 transform hover:-translate-y-2 border border-white/5 hover:border-gold-500/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
            data-astro-prefetch="viewport"
          >
            {/* Ambient Background Light for Card */}
            <div className="absolute -inset-1 bg-gradient-to-b from-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 z-0 pointer-events-none"></div>

            {/* Image Container */}
            <div className="aspect-[4/5] bg-trueblack-900 overflow-hidden relative z-10 m-2 rounded-[1.5rem]">
              <img 
                src={product.images?.[0] || 'https://via.placeholder.com/600'} 
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out mix-blend-lighten ${product.images?.length > 1 ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-110 opacity-90 group-hover:opacity-100'}`}
                style={{ viewTransitionName: `img-${product.id}` }}
                loading="lazy"
                decoding="async"
              />
              
              {product.images?.length > 1 && (
                <img 
                  src={product.images[1]} 
                  alt={`${product.name} alternate view`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out mix-blend-lighten opacity-0 scale-125 group-hover:opacity-100 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8 backdrop-blur-[2px]">
                <span className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2 hover:bg-white hover:text-black">
                  Detalles
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>

              {product.category && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-gray-200 text-xs font-medium tracking-widest uppercase rounded-full border border-white/10 shadow-lg">
                    {product.category.name}
                  </span>
                </div>
              )}
              
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] text-trueblack-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 relative z-10">
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-2 min-h-[3.5rem] leading-snug">
                {product.name}
              </h3>

              <div className="w-8 h-px bg-gold-500/30 my-4 group-hover:w-full transition-all duration-700 ease-in-out"></div>

              <div className="flex items-end justify-between mt-4">
                <div>
                  <div className="text-2xl font-heading font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-gold-300 group-hover:to-gold-500 transition-colors duration-500">
                    {formatCOP(product.price)}
                  </div>
                </div>
                
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-gold-500 group-hover:border-gold-500 transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-trueblack-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center pt-8 border-t border-white/5 flex items-center justify-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/10"></div>
        <p className="text-sm font-medium text-gray-500 tracking-widest uppercase">
          <span className="text-gold-400">{displayedProducts.length}</span> Piezas Exclusivas
        </p>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/10"></div>
      </div>
    </div>
  );
}

export default function ProductGrid(props: Props) {
  return (
    <QueryProvider>
      <ProductGridContent {...props} />
    </QueryProvider>
  );
}
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/product.service';
import type { Product } from '../services/product.service';
import { useCategories } from './useCategories';

export const useProducts = () => {
  const { categories, isLoadingCategories } = useCategories();

  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: ProductService.getProducts,
  });

  // Map category data to products
  const productsWithCategories = (query.data || []).map((product) => ({
    ...product,
    category: categories.find((c) => c.id === product.category_id),
  }));

  return {
    products: productsWithCategories,
    isLoadingProducts: query.isLoading || isLoadingCategories,
    isErrorProducts: query.isError,
  };
};

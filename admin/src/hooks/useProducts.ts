import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../services/product.service';
import type { Product, Category, Finish } from '../types/product.types';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: ProductService.getProducts,
  });

  const getProductQuery = (id: string) => useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => ProductService.getProduct(id),
    enabled: !!id,
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
  });

  const finishesQuery = useQuery<Finish[]>({
    queryKey: ['finishes'],
    queryFn: ProductService.getFinishes,
  });

  const createMutation = useMutation({
    mutationFn: ProductService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ProductService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    isErrorProducts: productsQuery.isError,
    
    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,

    finishes: finishesQuery.data || [],
    isLoadingFinishes: finishesQuery.isLoading,

    getProductQuery,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

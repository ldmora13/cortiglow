import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '../services/category.service';
import type { Category } from '../services/category.service';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: CategoryService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: CategoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => CategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CategoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: CategoryService.updateCategoryOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
    isErrorCategories: categoriesQuery.isError,
    refetchCategories: categoriesQuery.refetch,
    
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    reorderCategories: reorderMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
};

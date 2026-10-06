import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '../services/category.service';
import type { Category } from '../services/category.service';

export const useCategories = () => {
  const query = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: CategoryService.getCategories,
  });

  return {
    categories: query.data || [],
    isLoadingCategories: query.isLoading,
    isErrorCategories: query.isError,
  };
};

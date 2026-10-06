import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Provider } from '../types/product.types';

export function useProviders() {
  const queryClient = useQueryClient();

  const providersQuery = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data } = await api.get('/providers');
      return data;
    }
  });

  const getProviderQuery = (id: string) => useQuery<Provider>({
    queryKey: ['providers', id],
    queryFn: async () => {
      const { data } = await api.get(`/providers/${id}`);
      return data;
    },
    enabled: !!id
  });

  const createProviderMutation = useMutation({
    mutationFn: async (provider: Partial<Provider>) => {
      const { data } = await api.post('/providers', provider);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Provider> & { id: string }) => {
      const { data: result } = await api.put(`/providers/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/providers/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  return {
    providers: providersQuery.data || [],
    isLoading: providersQuery.isLoading,
    isError: providersQuery.isError,
    getProviderQuery,
    createProvider: createProviderMutation.mutateAsync,
    updateProvider: updateProviderMutation.mutateAsync,
    deleteProvider: deleteProviderMutation.mutateAsync,
    isCreating: createProviderMutation.isPending,
    isUpdating: updateProviderMutation.isPending,
    isDeleting: deleteProviderMutation.isPending,
  };
}

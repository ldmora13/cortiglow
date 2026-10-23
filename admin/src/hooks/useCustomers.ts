import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerService } from '../services/customer.service';
import type { Customer } from '../types/customer.types';

export const useCustomers = (filters?: { search?: string; limit?: number; sort?: 'sales' }) => {
  const queryClient = useQueryClient();

  const customersQuery = useQuery<Customer[]>({
    queryKey: ['customers', filters],
    queryFn: () => CustomerService.getCustomers(filters),
  });

  const getCustomerQuery = (id: string) => useQuery<Customer>({
    queryKey: ['customers', id],
    queryFn: () => CustomerService.getCustomer(id),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: CustomerService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => CustomerService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CustomerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    customers: customersQuery.data || [],
    isLoadingCustomers: customersQuery.isLoading,
    isErrorCustomers: customersQuery.isError,
    
    getCustomerQuery,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

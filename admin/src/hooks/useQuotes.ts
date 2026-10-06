import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuoteService } from '../services/quote.service';
import type { Quote, QuoteStatus } from '../types/quote.types';

export const useQuotes = (filters?: any) => {
  const queryClient = useQueryClient();

  const quotesQuery = useQuery<Quote[]>({
    queryKey: ['quotes', filters],
    queryFn: () => QuoteService.getQuotes(filters),
  });

  const getQuoteQuery = (id: string) => useQuery<Quote>({
    queryKey: ['quotes', id],
    queryFn: () => QuoteService.getQuote(id),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: QuoteService.createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) => QuoteService.updateQuoteStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const convertToOrderMutation = useMutation({
    mutationFn: ({ id, conversionData }: { id: string; conversionData: any }) => QuoteService.convertToOrder(id, conversionData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: QuoteService.deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    quotes: quotesQuery.data || [],
    isLoadingQuotes: quotesQuery.isLoading,
    isErrorQuotes: quotesQuery.isError,
    refetchQuotes: quotesQuery.refetch,
    
    getQuoteQuery,
    createQuote: createMutation.mutateAsync,
    updateQuoteStatus: updateStatusMutation.mutateAsync,
    convertQuoteToOrder: convertToOrderMutation.mutateAsync,
    deleteQuote: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isConverting: convertToOrderMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

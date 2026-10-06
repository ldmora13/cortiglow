import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinishService } from '../services/finish.service';
import type { Finish } from '../services/finish.service';

export const useFinishes = () => {
  const queryClient = useQueryClient();

  const finishesQuery = useQuery<Finish[]>({
    queryKey: ['finishes'],
    queryFn: FinishService.getFinishes,
  });

  const createMutation = useMutation({
    mutationFn: FinishService.createFinish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finishes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Finish> }) => FinishService.updateFinish(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finishes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: FinishService.deleteFinish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finishes'] });
    },
  });

  return {
    finishes: finishesQuery.data || [],
    isLoadingFinishes: finishesQuery.isLoading,
    isErrorFinishes: finishesQuery.isError,
    refetchFinishes: finishesQuery.refetch,
    
    createFinish: createMutation.mutateAsync,
    updateFinish: updateMutation.mutateAsync,
    deleteFinish: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '../services/inventory.service';


export const useInventory = (movementFilters?: any) => {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery<any[]>({
    queryKey: ['inventory'],
    queryFn: InventoryService.getInventory,
  });

  const movementsQuery = useQuery<any[]>({
    queryKey: ['inventory-movements', movementFilters],
    queryFn: () => InventoryService.getMovements(movementFilters),
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => InventoryService.updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const addMovementMutation = useMutation({
    mutationFn: InventoryService.addMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    inventory: inventoryQuery.data || [],
    isLoadingInventory: inventoryQuery.isLoading,
    isErrorInventory: inventoryQuery.isError,
    refetchInventory: inventoryQuery.refetch,
    
    movements: movementsQuery.data || [],
    isLoadingMovements: movementsQuery.isLoading,
    isErrorMovements: movementsQuery.isError,
    refetchMovements: movementsQuery.refetch,
    
    updateInventory: updateInventoryMutation.mutateAsync,
    addMovement: addMovementMutation.mutateAsync,
    
    isUpdatingInventory: updateInventoryMutation.isPending,
    isAddingMovement: addMovementMutation.isPending,
  };
};

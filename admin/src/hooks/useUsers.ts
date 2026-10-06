import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import type { User } from '../services/user.service';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: UserService.getUsers,
  });

  const createMutation = useMutation({
    mutationFn: UserService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => UserService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => UserService.updateUserPassword(id, password),
  });

  const deleteMutation = useMutation({
    mutationFn: UserService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: usersQuery.data || [],
    isLoadingUsers: usersQuery.isLoading,
    isErrorUsers: usersQuery.isError,
    refetchUsers: usersQuery.refetch,
    
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    updateUserPassword: updatePasswordMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

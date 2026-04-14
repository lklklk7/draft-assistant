import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRiotAccounts, connectRiotAccount, syncRiotAccount } from '../services/riot';

export function useRiotAccounts() {
  return useQuery({
    queryKey: ['riotAccounts'],
    queryFn: getRiotAccounts,
  });
}

export function useConnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectRiotAccount,
    onSuccess: () => {
      // Automatically refetch the accounts list after connecting
      queryClient.invalidateQueries({ queryKey: ['riotAccounts'] });
    },
  });
}

export function useSyncAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncRiotAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riotAccounts'] });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { getOverview, getChampionStats, getRecentMatches } from '../services/analytics';

export function useOverview(accountId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'overview', accountId],
    queryFn: () => getOverview(accountId!),
    enabled: !!accountId,
  });
}

export function useChampionStats(accountId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'champions', accountId],
    queryFn: () => getChampionStats(accountId!),
    enabled: !!accountId,
  });
}

export function useRecentMatches(accountId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', 'matches', accountId],
    queryFn: () => getRecentMatches(accountId!),
    enabled: !!accountId,
  });
}

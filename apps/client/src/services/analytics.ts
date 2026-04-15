import api from './api';

export interface Overview {
  totalGames: number;
  totalWins: number;
  winRate: number;
  topChampions: ChampionStat[];
}

export interface ChampionStat {
  championId: string;
  name: string;
  imageUrl: string;
  tags: string[];
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCs: number;
  kda: number;
}

export interface Match {
  id: string;
  championName: string;
  championImageUrl: string;
  role: string;
  result: 'WIN' | 'LOSS';
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gameDuration: number;
  gameDate: string;
  kda: number;
}

export async function getOverview(accountId: string): Promise<Overview> {
  const res = await api.get<Overview>('/api/analytics/overview', {
    params: { accountId },
  });
  return res.data;
}

export async function getChampionStats(accountId: string): Promise<ChampionStat[]> {
  const res = await api.get<{ champions: ChampionStat[] }>('/api/analytics/champions', {
    params: { accountId },
  });
  return res.data.champions;
}

export async function getRecentMatches(accountId: string): Promise<Match[]> {
  const res = await api.get<{ matches: Match[] }>('/api/analytics/matches', {
    params: { accountId },
  });
  return res.data.matches;
}

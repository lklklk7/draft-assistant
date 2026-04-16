import api from './api';

export interface Champion {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  riotKey: string;
}

export interface Recommendation {
  rank: number;
  championId: string;
  name: string;
  imageUrl: string;
  score: number;
  reasoning: string;
}

export async function getAllChampions(): Promise<Champion[]> {
  const res = await api.get<{ champions: Champion[] }>('/api/champions');
  return res.data.champions;
}

export async function getRecommendations(data: {
  accountId: string;
  role: string;
  allyChampionIds: string[];
  enemyChampionIds: string[];
}): Promise<{ simulationId: string; recommendations: Recommendation[] }> {
  const res = await api.post('/api/draft/recommend', data);
  return res.data;
}

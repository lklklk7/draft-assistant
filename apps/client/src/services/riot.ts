import api from './api';

export interface RiotAccount {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

export const REGIONS = [
  { value: 'na1', label: 'NA — North America' },
  { value: 'euw1', label: 'EUW — Europe West' },
  { value: 'eun1', label: 'EUNE — Europe Nordic & East' },
  { value: 'kr', label: 'KR — Korea' },
  { value: 'br1', label: 'BR — Brazil' },
  { value: 'jp1', label: 'JP — Japan' },
  { value: 'la1', label: 'LAN — Latin America North' },
  { value: 'la2', label: 'LAS — Latin America South' },
  { value: 'oc1', label: 'OCE — Oceania' },
  { value: 'tr1', label: 'TR — Turkey' },
  { value: 'ru', label: 'RU — Russia' },
] as const;

export async function getRiotAccounts(): Promise<RiotAccount[]> {
  const res = await api.get<{ accounts: RiotAccount[] }>('/api/riot/accounts');
  return res.data.accounts;
}

export async function connectRiotAccount(data: {
  gameName: string;
  tagLine: string;
  region: string;
}): Promise<RiotAccount> {
  const res = await api.post<{ account: RiotAccount }>('/api/riot/accounts', data);
  return res.data.account;
}

export async function syncRiotAccount(id: string): Promise<{ imported: number }> {
  const res = await api.post<{ message: string; imported: number }>(
    `/api/riot/accounts/${id}/sync`
  );
  return res.data;
}

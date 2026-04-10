// Maps platform regions to Riot's regional routing clusters
const REGIONAL_CLUSTER: Record<string, string> = {
  na1: 'americas', br1: 'americas', la1: 'americas', la2: 'americas',
  euw1: 'europe', eun1: 'europe', tr1: 'europe', ru: 'europe',
  kr: 'asia', jp1: 'asia',
  oc1: 'sea', ph2: 'sea', sg2: 'sea', th2: 'sea', tw2: 'sea', vn2: 'sea',
};

export class RiotApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'RiotApiError';
  }
}

// Types for the Riot API responses we use
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchParticipant {
  puuid: string;
  championId: number;
  championName: string;
  teamPosition: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
}

export interface RiotMatch {
  metadata: { matchId: string };
  info: {
    gameDuration: number;
    gameStartTimestamp: number;
    participants: MatchParticipant[];
  };
}

async function riotGet<T>(url: string): Promise<T> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey || apiKey === 'your-riot-api-key-here') {
    throw new RiotApiError(401, 'RIOT_API_KEY is not configured');
  }

  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } });

  if (!res.ok) {
    const msg = res.status === 404 ? 'Not found' : `Riot API error ${res.status}`;
    throw new RiotApiError(res.status, msg);
  }

  return res.json() as Promise<T>;
}

function cluster(region: string): string {
  return REGIONAL_CLUSTER[region.toLowerCase()] ?? 'americas';
}

export async function getAccountByRiotId(gameName: string, tagLine: string, region: string) {
  const url = `https://${cluster(region)}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotGet<RiotAccount>(url);
}

export async function getMatchIds(puuid: string, region: string, count = 20): Promise<string[]> {
  const url = `https://${cluster(region)}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
  return riotGet<string[]>(url);
}

export async function getMatch(matchId: string, region: string): Promise<RiotMatch> {
  const url = `https://${cluster(region)}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return riotGet<RiotMatch>(url);
}

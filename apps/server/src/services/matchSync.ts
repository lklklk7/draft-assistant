import prisma from '../lib/prisma';
import { getMatchIds, getMatch } from './riot';
import type { RiotMatch } from './riot';
type Result = 'WIN' | 'LOSS';

const ROLE_MAP: Record<string, string> = {
  TOP: 'TOP',
  JUNGLE: 'JUNGLE',
  MIDDLE: 'MID',
  BOTTOM: 'BOT',
  UTILITY: 'SUPPORT',
};

function normalizeRole(position: string): string {
  return ROLE_MAP[position] ?? 'UNKNOWN';
}

// Small delay to avoid hitting Riot's per-second rate limit
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncMatchHistory(riotAccountId: string): Promise<number> {
  const account = await prisma.riotAccount.findUniqueOrThrow({
    where: { id: riotAccountId },
  });

  // Fetch the last 100 match IDs from Riot (API maximum)
  const allMatchIds = await getMatchIds(account.puuid, account.region, 100);

  // Skip matches we have already imported
  const existing = await prisma.match.findMany({
    where: { riotAccountId },
    select: { riotMatchId: true },
  });
  const existingIds = new Set(existing.map((m) => m.riotMatchId));
  const newMatchIds = allMatchIds.filter((id) => !existingIds.has(id));

  let imported = 0;

  for (const matchId of newMatchIds) {
    try {
      await delay(100); // 100ms between requests — stay well under rate limit
      const matchData = await getMatch(matchId, account.region);
      await storeMatch(matchData, account.puuid, riotAccountId);
      imported++;
    } catch (err) {
      // Log and continue — one failed match shouldn't abort the whole sync
      console.error(`[matchSync] Failed to import ${matchId}:`, err);
    }
  }

  // Recompute champion stats after all matches are stored
  await recomputeChampionStats(riotAccountId);

  // Update the last synced timestamp
  await prisma.riotAccount.update({
    where: { id: riotAccountId },
    data: { lastSyncedAt: new Date() },
  });

  return imported;
}

async function storeMatch(
  matchData: RiotMatch,
  puuid: string,
  riotAccountId: string
): Promise<void> {
  const participant = matchData.info.participants.find((p) => p.puuid === puuid);
  if (!participant) return;

  // Look up our internal champion record by Riot's numeric ID
  const champion = await prisma.champion.findUnique({
    where: { riotId: participant.championId },
  });
  if (!champion) {
    console.warn(`[matchSync] Unknown champion ID ${participant.championId} — skipping match`);
    return;
  }

  await prisma.match.upsert({
    where: {
      riotAccountId_riotMatchId: {
        riotAccountId,
        riotMatchId: matchData.metadata.matchId,
      },
    },
    update: {},
    create: {
      riotAccountId,
      riotMatchId: matchData.metadata.matchId,
      championId: champion.id,
      role: normalizeRole(participant.teamPosition),
      result: (participant.win ? 'WIN' : 'LOSS') as Result,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
      gameDuration: matchData.info.gameDuration,
      gameDate: new Date(matchData.info.gameStartTimestamp),
      rawData: JSON.parse(JSON.stringify(matchData)),
    },
  });
}

async function recomputeChampionStats(riotAccountId: string): Promise<void> {
  const champions = await prisma.match.findMany({
    where: { riotAccountId },
    select: { championId: true },
    distinct: ['championId'],
  });

  for (const { championId } of champions) {
    const matches = await prisma.match.findMany({
      where: { riotAccountId, championId },
    });

    const gamesPlayed = matches.length;
    const wins = matches.filter((m) => m.result === 'WIN').length;
    const avgKills = matches.reduce((s, m) => s + m.kills, 0) / gamesPlayed;
    const avgDeaths = matches.reduce((s, m) => s + m.deaths, 0) / gamesPlayed;
    const avgAssists = matches.reduce((s, m) => s + m.assists, 0) / gamesPlayed;
    const avgCs = matches.reduce((s, m) => s + m.cs, 0) / gamesPlayed;

    await prisma.championStat.upsert({
      where: { riotAccountId_championId: { riotAccountId, championId } },
      update: { gamesPlayed, wins, avgKills, avgDeaths, avgAssists, avgCs },
      create: { riotAccountId, championId, gamesPlayed, wins, avgKills, avgDeaths, avgAssists, avgCs },
    });
  }
}

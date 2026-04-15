import prisma from '../lib/prisma';

export async function getOverview(riotAccountId: string) {
  const stats = await prisma.championStat.findMany({
    where: { riotAccountId },
    include: { champion: true },
    orderBy: { gamesPlayed: 'desc' },
  });

  const totalGames = stats.reduce((sum, s) => sum + s.gamesPlayed, 0);
  const totalWins = stats.reduce((sum, s) => sum + s.wins, 0);
  const winRate = totalGames > 0 ? totalWins / totalGames : 0;

  const topChampions = stats.slice(0, 5).map((s) => ({
    championId: s.championId,
    name: s.champion.name,
    imageUrl: s.champion.imageUrl,
    gamesPlayed: s.gamesPlayed,
    wins: s.wins,
    winRate: s.gamesPlayed > 0 ? s.wins / s.gamesPlayed : 0,
    kda: computeKda(s.avgKills, s.avgDeaths, s.avgAssists),
  }));

  return { totalGames, totalWins, winRate, topChampions };
}

export async function getChampionStats(riotAccountId: string) {
  const stats = await prisma.championStat.findMany({
    where: { riotAccountId },
    include: { champion: true },
    orderBy: { gamesPlayed: 'desc' },
  });

  return stats.map((s) => ({
    championId: s.championId,
    name: s.champion.name,
    imageUrl: s.champion.imageUrl,
    tags: s.champion.tags,
    gamesPlayed: s.gamesPlayed,
    wins: s.wins,
    losses: s.gamesPlayed - s.wins,
    winRate: s.gamesPlayed > 0 ? s.wins / s.gamesPlayed : 0,
    avgKills: s.avgKills,
    avgDeaths: s.avgDeaths,
    avgAssists: s.avgAssists,
    avgCs: s.avgCs,
    kda: computeKda(s.avgKills, s.avgDeaths, s.avgAssists),
  }));
}

export async function getRecentMatches(riotAccountId: string, limit = 20) {
  const matches = await prisma.match.findMany({
    where: { riotAccountId },
    include: { champion: true },
    orderBy: { gameDate: 'desc' },
    take: limit,
  });

  return matches.map((m) => ({
    id: m.id,
    riotMatchId: m.riotMatchId,
    championName: m.champion.name,
    championImageUrl: m.champion.imageUrl,
    role: m.role,
    result: m.result,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    cs: m.cs,
    gameDuration: m.gameDuration,
    gameDate: m.gameDate,
    kda: computeKda(m.kills, m.deaths, m.assists),
  }));
}

function computeKda(kills: number, deaths: number, assists: number): number {
  return parseFloat(((kills + assists) / Math.max(deaths, 1)).toFixed(2));
}

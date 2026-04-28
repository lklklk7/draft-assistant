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
  const [stats, matches] = await Promise.all([
    prisma.championStat.findMany({
      where: { riotAccountId },
      include: { champion: true },
      orderBy: { gamesPlayed: 'desc' },
    }),
    prisma.match.findMany({
      where: { riotAccountId },
      select: { championId: true, cs: true, gameDuration: true },
    }),
  ]);

  // Compute average CS per minute per champion from raw match data
  const cspmMap = new Map<string, number[]>();
  for (const match of matches) {
    if (match.gameDuration > 0) {
      const cspm = match.cs / (match.gameDuration / 60);
      if (!cspmMap.has(match.championId)) cspmMap.set(match.championId, []);
      cspmMap.get(match.championId)!.push(cspm);
    }
  }

  return stats.map((s) => {
    const cspmValues = cspmMap.get(s.championId) ?? [];
    const avgCsPerMin =
      cspmValues.length > 0
        ? parseFloat((cspmValues.reduce((sum, v) => sum + v, 0) / cspmValues.length).toFixed(1))
        : 0;

    return {
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
      avgCsPerMin,
      kda: computeKda(s.avgKills, s.avgDeaths, s.avgAssists),
    };
  });
}

export async function getRecentMatches(riotAccountId: string, limit = 100) {
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

import prisma from '../lib/prisma';
import type { RecommendInput } from '../schemas/draft';

interface Recommendation {
  rank: number;
  championId: string;
  name: string;
  imageUrl: string;
  score: number;
  reasoning: string;
}

export async function generateRecommendations(
  userId: string,
  input: RecommendInput
): Promise<{ simulationId: string; recommendations: Recommendation[] }> {
  const { accountId, role, allyChampionIds, enemyChampionIds } = input;

  // Verify account ownership
  const account = await prisma.riotAccount.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new Error('ACCOUNT_NOT_FOUND');

  // Get all champion stats for this account
  const stats = await prisma.championStat.findMany({
    where: { riotAccountId: accountId },
    include: { champion: true },
  });

  if (stats.length === 0) throw new Error('NO_STATS');

  const excluded = new Set([...allyChampionIds, ...enemyChampionIds]);

  const scored = stats
    .filter((s) => !excluded.has(s.championId) && s.gamesPlayed > 0)
    .map((s) => {
      const winRate = s.wins / s.gamesPlayed;
      const kda = (s.avgKills + s.avgAssists) / Math.max(s.avgDeaths, 1);
      const kdaNorm = Math.min(kda / 5.0, 1.0);
      const expScore = Math.min(s.gamesPlayed / 20, 1.0);
      const score = winRate * 0.5 + kdaNorm * 0.3 + expScore * 0.2;

      const reasoning = `${Math.round(winRate * 100)}% win rate over ${s.gamesPlayed} game${s.gamesPlayed !== 1 ? 's' : ''}`;

      return { stat: s, score, reasoning };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Save simulation and recommendations in one transaction
  const simulation = await prisma.draftSimulation.create({
    data: {
      userId,
      role,
      allyChampionIds,
      enemyChampionIds,
      recommendations: {
        create: scored.map(({ stat, score, reasoning }, i) => ({
          championId: stat.championId,
          score,
          reasoning,
          rank: i + 1,
        })),
      },
    },
  });

  const recommendations: Recommendation[] = scored.map(({ stat, score, reasoning }, i) => ({
    rank: i + 1,
    championId: stat.championId,
    name: stat.champion.name,
    imageUrl: stat.champion.imageUrl,
    score,
    reasoning,
  }));

  return { simulationId: simulation.id, recommendations };
}

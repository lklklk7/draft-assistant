import { z } from 'zod';

const ROLES = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'] as const;

export const recommendSchema = z.object({
  accountId: z.string().min(1),
  role: z.enum(ROLES),
  allyChampionIds: z.array(z.string()).max(4).default([]),
  enemyChampionIds: z.array(z.string()).max(5).default([]),
});

export type RecommendInput = z.infer<typeof recommendSchema>;

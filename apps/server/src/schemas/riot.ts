import { z } from 'zod';

const REGIONS = ['na1', 'euw1', 'kr', 'br1', 'la1', 'la2', 'eun1', 'tr1', 'ru', 'jp1', 'oc1'] as const;

export const connectAccountSchema = z.object({
  gameName: z.string().min(1, 'Game name is required'),
  tagLine: z.string().min(1, 'Tag line is required'),
  region: z.enum(REGIONS, { error: 'Invalid region' }),
});

export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;

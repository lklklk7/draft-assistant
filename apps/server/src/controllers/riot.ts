import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { connectAccountSchema } from '../schemas/riot';
import { getAccountByRiotId, RiotApiError } from '../services/riot';
import { syncMatchHistory } from '../services/matchSync';

export async function connectAccount(req: Request, res: Response): Promise<void> {
  const result = connectAccountSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', issues: result.error.issues });
    return;
  }

  const { gameName, tagLine, region } = result.data;
  const userId = req.user!.userId;

  try {
    // Verify the account exists on Riot's servers
    const riotAccount = await getAccountByRiotId(gameName, tagLine, region);

    // Check if this PUUID is already connected to this user
    const existing = await prisma.riotAccount.findFirst({
      where: { puuid: riotAccount.puuid, userId },
    });
    if (existing) {
      res.status(409).json({ error: 'This Riot account is already connected' });
      return;
    }

    const account = await prisma.riotAccount.create({
      data: {
        userId,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        puuid: riotAccount.puuid,
        region,
      },
    });

    res.status(201).json({ account });
  } catch (err) {
    if (err instanceof RiotApiError) {
      const status = err.status === 404 ? 404 : 502;
      const message = err.status === 404 ? 'Riot account not found' : 'Riot API error';
      res.status(status).json({ error: message });
      return;
    }
    console.error('[connectAccount]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAccounts(req: Request, res: Response): Promise<void> {
  const accounts = await prisma.riotAccount.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ accounts });
}

export async function syncAccount(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.userId;

  // Make sure this account belongs to the requesting user
  const account = await prisma.riotAccount.findFirst({
    where: { id, userId },
  });
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  try {
    const imported = await syncMatchHistory(id);
    res.json({ message: `Sync complete`, imported });
  } catch (err) {
    if (err instanceof RiotApiError) {
      res.status(502).json({ error: 'Riot API error during sync' });
      return;
    }
    console.error('[syncAccount]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

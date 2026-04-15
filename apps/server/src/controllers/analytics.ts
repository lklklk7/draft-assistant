import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getOverview, getChampionStats, getRecentMatches } from '../services/analytics';

// Verify the requested account belongs to the authenticated user
async function resolveAccount(req: Request, res: Response): Promise<string | null> {
  const accountId = req.query.accountId as string;
  if (!accountId) {
    res.status(400).json({ error: 'accountId query parameter is required' });
    return null;
  }

  const account = await prisma.riotAccount.findFirst({
    where: { id: accountId, userId: req.user!.userId },
  });

  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return null;
  }

  return accountId;
}

export async function overview(req: Request, res: Response): Promise<void> {
  const accountId = await resolveAccount(req, res);
  if (!accountId) return;

  try {
    const data = await getOverview(accountId);
    res.json(data);
  } catch (err) {
    console.error('[analytics/overview]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function championStats(req: Request, res: Response): Promise<void> {
  const accountId = await resolveAccount(req, res);
  if (!accountId) return;

  try {
    const data = await getChampionStats(accountId);
    res.json({ champions: data });
  } catch (err) {
    console.error('[analytics/champions]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function recentMatches(req: Request, res: Response): Promise<void> {
  const accountId = await resolveAccount(req, res);
  if (!accountId) return;

  try {
    const data = await getRecentMatches(accountId);
    res.json({ matches: data });
  } catch (err) {
    console.error('[analytics/matches]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

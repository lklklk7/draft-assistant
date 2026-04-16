import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', authenticate, async (_req, res) => {
  const champions = await prisma.champion.findMany({
    select: { id: true, name: true, imageUrl: true, tags: true, riotKey: true },
    orderBy: { name: 'asc' },
  });
  res.json({ champions });
});

export default router;

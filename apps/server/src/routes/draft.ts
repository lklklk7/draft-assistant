import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { recommendSchema } from '../schemas/draft';
import { generateRecommendations } from '../services/draft';

const router = Router();

router.use(authenticate);

router.post('/recommend', async (req, res) => {
  const result = recommendSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', issues: result.error.issues });
    return;
  }

  try {
    const data = await generateRecommendations(req.user!.userId, result.data);
    res.json(data);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'ACCOUNT_NOT_FOUND') {
        res.status(404).json({ error: 'Account not found' });
        return;
      }
      if (err.message === 'NO_STATS') {
        res.status(400).json({ error: 'Sync your matches first to get recommendations' });
        return;
      }
    }
    console.error('[draft/recommend]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { overview, championStats, recentMatches } from '../controllers/analytics';

const router = Router();

router.use(authenticate);

router.get('/overview', overview);
router.get('/champions', championStats);
router.get('/matches', recentMatches);

export default router;

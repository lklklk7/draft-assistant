import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { connectAccount, getAccounts, syncAccount } from '../controllers/riot';

const router = Router();

// All Riot routes require authentication
router.use(authenticate);

router.get('/accounts', getAccounts);
router.post('/accounts', connectAccount);
router.post('/accounts/:id/sync', syncAccount);

export default router;

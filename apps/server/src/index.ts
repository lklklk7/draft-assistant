import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import riotRoutes from './routes/riot';
import analyticsRoutes from './routes/analytics';
import championsRoutes from './routes/champions';
import draftRoutes from './routes/draft';
import { syncChampions } from './services/champions';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'league-draft-assistant-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/riot', riotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/champions', championsRoutes);
app.use('/api/draft', draftRoutes);

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);

  // Sync champion data from Data Dragon on startup
  syncChampions()
    .then((count) => console.log(`[champions] Synced ${count} champions`))
    .catch((err) => console.error('[champions] Sync failed:', err));
});

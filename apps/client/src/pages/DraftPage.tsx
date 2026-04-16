import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { getAllChampions, getRecommendations } from '../services/draft';
import type { Champion, Recommendation } from '../services/draft';
import { useRiotAccounts } from '../hooks/useRiot';
import { RoleSelector } from '../components/RoleSelector';
import type { Role } from '../components/RoleSelector';
import { ChampionPicker } from '../components/ChampionPicker';
import { useAuth } from '../context/AuthContext';

export function DraftPage() {
  const { user, logout } = useAuth();
  const { data: accounts } = useRiotAccounts();
  const activeAccountId = accounts?.[0]?.id;

  const [role, setRole] = useState<Role | null>(null);
  const [allies, setAllies] = useState<Champion[]>([]);
  const [enemies, setEnemies] = useState<Champion[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState('');

  const { data: allChampions = [] } = useQuery({
    queryKey: ['champions'],
    queryFn: getAllChampions,
  });

  const { mutate: recommend, isPending } = useMutation({
    mutationFn: getRecommendations,
    onSuccess: ({ recommendations }) => setRecommendations(recommendations),
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? 'Failed to get recommendations');
      }
    },
  });

  function handleSubmit() {
    if (!role || !activeAccountId) return;
    setError('');
    setRecommendations([]);
    recommend({
      accountId: activeAccountId,
      role,
      allyChampionIds: allies.map((c) => c.id),
      enemyChampionIds: enemies.map((c) => c.id),
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-yellow-400 font-bold text-lg">League Draft Assistant</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <span className="text-white font-medium">Draft</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.username}</span>
          <button
            onClick={() => { logout(); }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {!activeAccountId && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm rounded-xl px-5 py-4">
            Connect and sync a Riot account on the{' '}
            <Link to="/dashboard" className="underline">Dashboard</Link> to get recommendations.
          </div>
        )}

        {/* Role Selection */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Your Role</h2>
          <RoleSelector selected={role} onChange={setRole} />
        </section>

        {/* Champion Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <ChampionPicker
              label="Allied Champions"
              max={4}
              allChampions={allChampions}
              selected={allies}
              onAdd={(c) => setAllies((prev) => [...prev, c])}
              onRemove={(id) => setAllies((prev) => prev.filter((c) => c.id !== id))}
            />
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <ChampionPicker
              label="Enemy Champions"
              max={5}
              allChampions={allChampions}
              selected={enemies}
              onAdd={(c) => setEnemies((prev) => [...prev, c])}
              onRemove={(id) => setEnemies((prev) => prev.filter((c) => c.id !== id))}
            />
          </section>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!role || !activeAccountId || isPending}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl px-4 py-3 transition-colors"
        >
          {isPending ? 'Generating recommendations...' : 'Get Recommendations'}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Recommended for {role}</h2>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.championId}
                  className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-5 py-4"
                >
                  <span className="text-2xl font-bold text-gray-600 w-6 text-center">
                    {rec.rank}
                  </span>
                  <img
                    src={rec.imageUrl}
                    alt={rec.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{rec.name}</p>
                    <p className="text-sm text-gray-400">{rec.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-yellow-400 font-bold">
                      {(rec.score * 100).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

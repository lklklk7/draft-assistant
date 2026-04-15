import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRiotAccounts } from '../hooks/useRiot';
import { useOverview, useChampionStats, useRecentMatches } from '../hooks/useAnalytics';
import { RiotAccountCard } from '../components/RiotAccountCard';
import { ConnectAccountForm } from '../components/ConnectAccountForm';
import { StatCard } from '../components/StatCard';
import { ChampionStatsTable } from '../components/ChampionStatsTable';
import { MatchHistoryList } from '../components/MatchHistoryList';
import { formatWinRate, winRateColor } from '../utils/format';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: accounts, isLoading: accountsLoading } = useRiotAccounts();
  const [showForm, setShowForm] = useState(false);

  // Use the first connected account for analytics
  const activeAccountId = accounts?.[0]?.id;

  const { data: overview } = useOverview(activeAccountId);
  const { data: champions } = useChampionStats(activeAccountId);
  const { data: matches } = useRecentMatches(activeAccountId);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const bestChampion = overview?.topChampions[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-yellow-400 font-bold text-lg">League Draft Assistant</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Overview Stats */}
        {overview && overview.totalGames > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Total Games"
                value={String(overview.totalGames)}
                sub={`${overview.totalWins}W ${overview.totalGames - overview.totalWins}L`}
              />
              <StatCard
                label="Win Rate"
                value={formatWinRate(overview.winRate)}
                valueColor={winRateColor(overview.winRate)}
              />
              <StatCard
                label="Best Champion"
                value={bestChampion?.name ?? '—'}
                sub={bestChampion ? formatWinRate(bestChampion.winRate) : undefined}
                valueColor="text-yellow-400"
              />
            </div>
          </section>
        )}

        {/* Riot Accounts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Riot Accounts</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {showForm ? 'Cancel' : '+ Connect Account'}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
              <ConnectAccountForm />
            </div>
          )}

          {accountsLoading ? (
            <p className="text-gray-500 text-sm">Loading accounts...</p>
          ) : accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <RiotAccountCard key={account.id} account={account} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">No accounts connected yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
              >
                Connect your Riot account →
              </button>
            </div>
          )}
        </section>

        {/* Champion Stats */}
        {champions && champions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Champion Stats</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <ChampionStatsTable champions={champions} />
            </div>
          </section>
        )}

        {/* Recent Matches */}
        {matches && matches.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Matches</h2>
            <MatchHistoryList matches={matches} />
          </section>
        )}

        {/* Empty state */}
        {activeAccountId && !overview?.totalGames && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">Sync your account to see stats and match history.</p>
          </div>
        )}

      </main>
    </div>
  );
}

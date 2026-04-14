import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRiotAccounts } from '../hooks/useRiot';
import { RiotAccountCard } from '../components/RiotAccountCard';
import { ConnectAccountForm } from '../components/ConnectAccountForm';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: accounts, isLoading } = useRiotAccounts();
  const [showForm, setShowForm] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

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

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Riot Accounts Section */}
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

          {isLoading ? (
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

        {/* Analytics placeholder */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm">
              Sync your matches to see champion stats and win rates.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}

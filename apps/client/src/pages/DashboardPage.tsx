import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-yellow-400 font-bold text-lg">League Draft Assistant</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Welcome, {user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Analytics and draft tools coming next.</p>
      </main>
    </div>
  );
}

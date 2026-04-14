import { useState } from 'react';
import axios from 'axios';
import { REGIONS } from '../services/riot';
import { useConnectAccount } from '../hooks/useRiot';

export function ConnectAccountForm() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('na1');
  const [error, setError] = useState('');

  const { mutate: connect, isPending } = useConnectAccount();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    connect(
      { gameName, tagLine, region },
      {
        onSuccess: () => {
          setGameName('');
          setTagLine('');
        },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.error ?? 'Failed to connect account');
          } else {
            setError('Something went wrong');
          }
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-400 mb-1">Game Name</label>
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
            placeholder="Faker"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-gray-400 mb-1">Tag</label>
          <input
            value={tagLine}
            onChange={(e) => setTagLine(e.target.value)}
            required
            placeholder="KR1"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {isPending ? 'Connecting...' : 'Connect Account'}
      </button>
    </form>
  );
}

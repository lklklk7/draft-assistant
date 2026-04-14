import { useState } from 'react';
import type { RiotAccount } from '../services/riot';
import { useSyncAccount } from '../hooks/useRiot';

interface Props {
  account: RiotAccount;
}

export function RiotAccountCard({ account }: Props) {
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const { mutate: sync, isPending } = useSyncAccount();

  function handleSync() {
    setSyncResult(null);
    sync(account.id, {
      onSuccess: ({ imported }) => {
        setSyncResult(
          imported > 0 ? `Imported ${imported} new matches` : 'Already up to date'
        );
      },
      onError: () => setSyncResult('Sync failed — try again'),
    });
  }

  const lastSynced = account.lastSyncedAt
    ? new Date(account.lastSyncedAt).toLocaleDateString()
    : 'Never synced';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-white">
          {account.gameName}
          <span className="text-gray-400">#{account.tagLine}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {account.region.toUpperCase()} · {lastSynced}
        </p>
        {syncResult && (
          <p className="text-xs text-yellow-400 mt-1">{syncResult}</p>
        )}
      </div>

      <button
        onClick={handleSync}
        disabled={isPending}
        className="shrink-0 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
      >
        {isPending ? 'Syncing...' : 'Sync'}
      </button>
    </div>
  );
}

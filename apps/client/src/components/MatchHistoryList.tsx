import type { Match } from '../services/analytics';
import { formatDuration, formatDate } from '../utils/format';

interface Props {
  matches: Match[];
}

export function MatchHistoryList({ matches }: Props) {
  if (matches.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-6">No matches yet.</p>;
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <div
          key={m.id}
          className={`flex items-center gap-4 rounded-xl px-4 py-3 border ${
            m.result === 'WIN'
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}
        >
          <img
            src={m.championImageUrl}
            alt={m.championName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm">{m.championName}</p>
            <p className="text-xs text-gray-500">{m.role}</p>
          </div>

          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              m.result === 'WIN'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {m.result}
          </span>

          <div className="text-center hidden sm:block">
            <p className="text-sm text-white font-medium">
              {m.kills}/{m.deaths}/{m.assists}
            </p>
            <p className="text-xs text-gray-500">{m.kda} KDA</p>
          </div>

          <div className="text-right hidden md:block shrink-0">
            <p className="text-xs text-gray-400">{formatDuration(m.gameDuration)}</p>
            <p className="text-xs text-gray-500">{formatDate(m.gameDate)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

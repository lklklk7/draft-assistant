import type { ChampionStat } from '../services/analytics';
import { formatWinRate, winRateColor } from '../utils/format';

interface Props {
  champions: ChampionStat[];
}

export function ChampionStatsTable({ champions }: Props) {
  if (champions.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-6">No champion data yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-800">
            <th className="pb-3 font-medium">Champion</th>
            <th className="pb-3 font-medium text-center">Games</th>
            <th className="pb-3 font-medium text-center">Win Rate</th>
            <th className="pb-3 font-medium text-center">KDA</th>
            <th className="pb-3 font-medium text-center">Avg CS</th>
            <th className="pb-3 font-medium text-center">CS/Min</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {champions.map((c) => (
            <tr key={c.championId} className="hover:bg-gray-800/50 transition-colors">
              <td className="py-3 flex items-center gap-3">
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-white">{c.name}</span>
              </td>
              <td className="py-3 text-center text-gray-300">{c.gamesPlayed}</td>
              <td className={`py-3 text-center font-semibold ${winRateColor(c.winRate)}`}>
                {formatWinRate(c.winRate)}
              </td>
              <td className="py-3 text-center text-gray-300">{c.kda}</td>
              <td className="py-3 text-center text-gray-300">{c.avgCs.toFixed(1)}</td>
              <td className="py-3 text-center text-gray-300">{c.avgCsPerMin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

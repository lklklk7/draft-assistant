import { useState } from 'react';
import type { Champion } from '../services/draft';

interface Props {
  label: string;
  max: number;
  allChampions: Champion[];
  selected: Champion[];
  onAdd: (champion: Champion) => void;
  onRemove: (championId: string) => void;
}

export function ChampionPicker({ label, max, allChampions, selected, onAdd, onRemove }: Props) {
  const [search, setSearch] = useState('');

  const selectedIds = new Set(selected.map((c) => c.id));

  const filtered = search.length > 0
    ? allChampions
        .filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) &&
            !selectedIds.has(c.id)
        )
        .slice(0, 8)
    : [];

  function handleAdd(champion: Champion) {
    if (selected.length >= max) return;
    onAdd(champion);
    setSearch('');
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        {label} ({selected.length}/{max})
      </p>

      {/* Selected champions */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
        {selected.map((c) => (
          <button
            key={c.id}
            onClick={() => onRemove(c.id)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white transition-colors"
            title="Click to remove"
          >
            <img src={c.imageUrl} alt={c.name} className="w-5 h-5 rounded-full" />
            {c.name}
            <span className="text-gray-500">×</span>
          </button>
        ))}
      </div>

      {/* Search input */}
      {selected.length < max && (
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search champion..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />

          {filtered.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleAdd(c)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition-colors text-left"
                >
                  <img src={c.imageUrl} alt={c.name} className="w-7 h-7 rounded-full" />
                  <span className="text-sm text-white">{c.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{c.tags.join(', ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

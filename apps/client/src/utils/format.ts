export function formatWinRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function winRateColor(rate: number): string {
  if (rate >= 0.55) return 'text-green-400';
  if (rate >= 0.45) return 'text-yellow-400';
  return 'text-red-400';
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

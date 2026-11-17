import type { Color, Score } from '@/types';

export const MATE_VALUE = 10000;

export function scoreToCp(score: Score): number {
  if (score.type === 'cp') return score.value;
  if (score.value === 0) return -MATE_VALUE;
  return Math.sign(score.value) * (MATE_VALUE - Math.abs(score.value));
}

export function winPercent(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export function isGameEndScore(score: Score): boolean {
  return score.type === 'cp' && Math.abs(score.value) >= MATE_VALUE;
}

export function formatEval(score: Score): string {
  if (score.type === 'mate') {
    return `${score.value < 0 ? '-' : ''}M${Math.abs(score.value)}`;
  }
  if (isGameEndScore(score)) return score.value > 0 ? '1-0' : '0-1';
  const pawns = score.value / 100;
  if (Math.abs(pawns) < 0.05) return '0.0';
  return `${pawns > 0 ? '+' : ''}${pawns.toFixed(2)}`;
}

export function formatEvalShort(score: Score): string {
  if (score.type === 'mate') return formatEval(score);
  if (isGameEndScore(score)) return formatEval(score);
  const pawns = score.value / 100;
  if (Math.abs(pawns) < 0.05) return '0.0';
  return `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
}

export function whiteWinShare(score: Score): number {
  return winPercent(scoreToCp(score));
}

export function toMoverCp(score: Score, color: Color): number {
  const cp = scoreToCp(score);
  return color === 'w' ? cp : -cp;
}

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

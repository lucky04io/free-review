import type { Classification, Color, MoveAnalysis, PlayerSummary } from '@/types';

export function moveAccuracy(winBefore: number, winAfter: number): number {
  const raw = 103.1668 * Math.exp(-0.04354 * (winBefore - winAfter)) - 3.1668;
  return Math.min(100, Math.max(0, raw));
}

export function harmonicMean(values: number[]): number {
  if (values.length === 0) return 0;
  const inverseSum = values.reduce((sum, v) => sum + 1 / Math.max(v, 0.1), 0);
  return values.length / inverseSum;
}

const EMPTY_COUNTS: Record<Classification, number> = {
  brilliant: 0,
  great: 0,
  best: 0,
  excellent: 0,
  good: 0,
  book: 0,
  inaccuracy: 0,
  mistake: 0,
  blunder: 0,
  miss: 0,
};

export function summarizeColor(moves: MoveAnalysis[], color: Color): PlayerSummary {
  const own = moves.filter((m) => m.color === color);
  const counts = { ...EMPTY_COUNTS };
  for (const move of own) counts[move.classification] += 1;
  const acpl = own.length ? own.reduce((sum, m) => sum + m.cpLoss, 0) / own.length : 0;
  return {
    accuracy: harmonicMean(own.map((m) => m.accuracy)),
    acpl,
    counts,
  };
}

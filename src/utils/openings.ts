import { OPENINGS } from '@/data/openings';
import type { OpeningMatch } from '@/types';

export function detectOpening(sans: string[]): OpeningMatch | null {
  let best: OpeningMatch | null = null;
  for (const entry of OPENINGS) {
    const line = entry.moves.split(' ');
    if (line.length > sans.length) continue;
    const matches = line.every((san, i) => san === sans[i]);
    if (!matches) continue;
    if (!best || line.length > best.bookLength) {
      best = { eco: entry.eco, name: entry.name, description: entry.description, bookLength: line.length };
    }
  }
  return best;
}

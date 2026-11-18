import type { Classification, GameAnalysis, MoveAnalysis, ParsedGame, ParsedMove, PositionEval } from '@/types';
import { MATE_VALUE, scoreToCp, winPercent } from '@/utils/eval';
import { moveAccuracy, summarizeColor } from '@/utils/accuracy';
import { detectOpening } from '@/utils/openings';
import { opponentCanCapture, uciToSan } from '@/utils/chess';

export interface ClassificationMeta {
  label: string;
  color: string;
  glyph?: string;
  icon?: 'check' | 'thumbs-up' | 'star' | 'book' | 'x';
  description: string;
}

export const CLASSIFICATION_META: Record<Classification, ClassificationMeta> = {
  brilliant: { label: 'Brilliant', color: '#26c2a2', glyph: '!!', description: 'A sound sacrifice that creates a major evaluation swing.' },
  great: { label: 'Great', color: '#5c8bb0', glyph: '!', description: 'The only good move in a sharp position.' },
  best: { label: 'Best', color: '#96bc4b', icon: 'star', description: 'Matches the engine top choice.' },
  excellent: { label: 'Excellent', color: '#7fb04b', icon: 'thumbs-up', description: 'Loses at most 10 centipawns.' },
  good: { label: 'Good', color: '#9ab36a', icon: 'check', description: 'Loses at most 25 centipawns.' },
  book: { label: 'Book', color: '#b58863', icon: 'book', description: 'A known opening move.' },
  inaccuracy: { label: 'Inaccuracy', color: '#f4c431', glyph: '?!', description: 'Loses 25 to 75 centipawns.' },
  mistake: { label: 'Mistake', color: '#e58f2a', glyph: '?', description: 'Loses 75 to 150 centipawns.' },
  blunder: { label: 'Blunder', color: '#ca3431', glyph: '??', description: 'Loses more than 150 centipawns or misses a forced mate.' },
  miss: { label: 'Miss', color: '#e0556a', icon: 'x', description: 'Missed a winning chance that the opponent had set up.' },
};

const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const MATE_THRESHOLD = MATE_VALUE - 1000;

function isSacrifice(move: ParsedMove, previous: ParsedMove | undefined): boolean {
  if (move.piece === 'k') return false;
  const isRecapture = previous?.captured !== undefined && previous.to === move.to;
  if (isRecapture) return false;
  const materialGiven = PIECE_VALUE[move.piece] - (move.captured ? PIECE_VALUE[move.captured] : 0);
  return materialGiven >= 2 && opponentCanCapture(move.fenAfter, move.to);
}

interface ClassifyContext {
  isBook: boolean;
  isBest: boolean;
  sacrifice: boolean;
  missedMate: boolean;
  cpLoss: number;
  cpBefore: number;
  evaluationGain: number;
  prevCpLoss: number;
  gap: number | null;
}

function classifyMove(c: ClassifyContext): Classification {
  if (c.isBook) return 'book';
  if (c.missedMate) return 'blunder';
  if (c.sacrifice && c.evaluationGain >= 100 && c.cpLoss <= 10) return 'brilliant';
  if (c.isBest) {
    if (c.sacrifice && c.gap !== null && c.gap >= 50) return 'brilliant';
    if (c.gap !== null && c.gap >= 150) return 'great';
    return 'best';
  }
  if (c.cpLoss > 75 && c.prevCpLoss >= 150 && c.cpBefore >= 150) return 'miss';
  if (c.cpLoss <= 10) return 'excellent';
  if (c.cpLoss <= 25) return 'good';
  if (c.cpLoss <= 75) return 'inaccuracy';
  if (c.cpLoss <= 150) return 'mistake';
  return 'blunder';
}

export function buildGameAnalysis(game: ParsedGame, positions: PositionEval[], depth: number): GameAnalysis {
  const opening = detectOpening(game.moves.map((m) => m.san));
  const moves: MoveAnalysis[] = [];
  let prevCpLoss = 0;

  game.moves.forEach((move, i) => {
    const before = positions[i];
    const after = positions[i + 1];
    const sign = move.color === 'w' ? 1 : -1;
    const cpBefore = sign * scoreToCp(before.score);
    const cpAfter = sign * scoreToCp(after.score);
    const isBest = before.bestUci === move.uci;
    const cpLoss = isBest ? 0 : Math.max(0, cpBefore - cpAfter);
    const secondLine = before.lines[1];
    const gap = secondLine ? cpBefore - sign * scoreToCp(secondLine.score) : null;

    const classification = classifyMove({
      isBook: opening !== null && i < opening.bookLength,
      isBest,
      sacrifice: isSacrifice(move, game.moves[i - 1]),
      missedMate: cpBefore >= MATE_THRESHOLD && cpAfter < MATE_THRESHOLD && !isBest,
      cpLoss,
      cpBefore,
      evaluationGain: cpAfter - cpBefore,
      prevCpLoss,
      gap,
    });

    moves.push({
      index: i,
      san: move.san,
      uci: move.uci,
      color: move.color,
      cpLoss,
      accuracy: isBest ? 100 : moveAccuracy(winPercent(cpBefore), winPercent(cpAfter)),
      classification,
      bestUci: before.bestUci,
      bestSan: before.bestUci ? uciToSan(before.fen, before.bestUci) : null,
      clock: move.clock,
    });
    prevCpLoss = cpLoss;
  });

  return {
    depth,
    positions,
    moves,
    summary: { w: summarizeColor(moves, 'w'), b: summarizeColor(moves, 'b') },
    opening,
  };
}

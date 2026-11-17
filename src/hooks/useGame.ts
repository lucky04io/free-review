import { useCallback, useState } from 'react';
import type { ParsedGame, ParsedMove } from '@/types';

export function useGame(game: ParsedGame, initialPly: number) {
  const total = game.moves.length;
  const [ply, setPly] = useState(() => Math.min(Math.max(initialPly, 0), total));

  const goTo = useCallback((target: number) => {
    setPly(Math.min(Math.max(target, 0), total));
  }, [total]);

  const lastMove: ParsedMove | null = ply > 0 ? game.moves[ply - 1] : null;

  return {
    ply,
    total,
    fen: game.positions[ply],
    lastMove,
    goTo,
    next: () => goTo(ply + 1),
    prev: () => goTo(ply - 1),
    first: () => goTo(0),
    last: () => goTo(total),
  };
}

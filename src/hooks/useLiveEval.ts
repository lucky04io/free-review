import { useEffect, useState } from 'react';
import type { PositionEval } from '@/types';
import type { StockfishEngine } from '@/engine/stockfish';
import { evaluatePosition } from '@/engine/evaluate';

export function useLiveEval(
  fen: string | null,
  depth: number,
  enabled: boolean,
  getEngine: () => StockfishEngine,
) {
  const [result, setResult] = useState<PositionEval | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
    if (!fen || !enabled) return;

    let active = true;
    const engine = getEngine();
    evaluatePosition(engine, fen, depth)
      .then((evaluation) => {
        if (active) setResult(evaluation);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Live analysis stopped.');
      });

    return () => {
      active = false;
      engine.stop();
    };
  }, [fen, depth, enabled, getEngine]);

  return { evaluation: fen && enabled ? result : null, error };
}

import { useCallback, useEffect, useRef } from 'react';
import { StockfishEngine } from '@/engine/stockfish';

export function useEngine(): () => StockfishEngine {
  const engineRef = useRef<StockfishEngine | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current || engineRef.current.failed) {
      engineRef.current?.terminate();
      engineRef.current = new StockfishEngine();
    }
    return engineRef.current;
  }, []);

  useEffect(
    () => () => {
      engineRef.current?.terminate();
      engineRef.current = null;
    },
    [],
  );

  return getEngine;
}

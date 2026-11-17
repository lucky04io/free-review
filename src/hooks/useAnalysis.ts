import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameAnalysis, ParsedGame } from '@/types';
import type { StockfishEngine } from '@/engine/stockfish';
import { evaluatePositions } from '@/engine/evaluate';
import { buildGameAnalysis } from '@/engine/classify';
import { hashText, readCachedAnalysis, writeCachedAnalysis } from '@/utils/analysisCache';

export type AnalysisStatus = 'idle' | 'running' | 'done' | 'error';

export function useAnalysis(game: ParsedGame, depth: number, getEngine: () => StockfishEngine) {
  const cacheKey = `${hashText(game.pgn)}:${depth}`;
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState({ done: 0, total: game.positions.length });
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = readCachedAnalysis(cacheKey);
    setAnalysis(cached);
    setStatus(cached ? 'done' : 'idle');
    setError(null);
    setProgress({ done: 0, total: game.positions.length });
    return () => {
      controllerRef.current?.abort();
    };
  }, [cacheKey, game.positions.length]);

  const start = useCallback(async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('running');
    setError(null);
    setProgress({ done: 0, total: game.positions.length });
    try {
      const positions = await evaluatePositions({
        positions: game.positions,
        depth,
        engine: getEngine(),
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      const result = buildGameAnalysis(game, positions, depth);
      writeCachedAnalysis(cacheKey, result);
      setAnalysis(result);
      setStatus('done');
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus(analysis ? 'done' : 'idle');
        return;
      }
      setError(err instanceof Error ? err.message : 'The analysis stopped unexpectedly.');
      setStatus('error');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [analysis, cacheKey, depth, game, getEngine]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    getEngine().stop();
  }, [getEngine]);

  return { status, progress, analysis, error, start, cancel };
}

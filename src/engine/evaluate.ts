import { Chess } from 'chess.js';
import type { Color, PositionEval, Score } from '@/types';
import { MATE_VALUE } from '@/utils/eval';
import { isGameOver, playUciMoves } from '@/utils/chess';
import type { StockfishEngine } from '@/engine/stockfish';

export const MULTI_PV = 3;

function toWhiteScore(cp: number | undefined, mate: number | undefined, sideToMove: Color): Score {
  const sign = sideToMove === 'w' ? 1 : -1;
  return cp !== undefined ? { type: 'cp', value: sign * cp } : { type: 'mate', value: sign * (mate ?? 0) };
}

function terminalEval(fen: string, depth: number): PositionEval {
  const chess = new Chess(fen);
  let score: Score = { type: 'cp', value: 0 };
  if (chess.isCheckmate()) {
    score = { type: 'cp', value: chess.turn() === 'w' ? -MATE_VALUE : MATE_VALUE };
  }
  return { fen, depth, score, bestUci: null, lines: [] };
}

export async function evaluatePosition(engine: StockfishEngine, fen: string, depth: number): Promise<PositionEval> {
  if (isGameOver(fen)) return terminalEval(fen, depth);

  const sideToMove = fen.split(' ')[1] as Color;
  const result = await engine.analyze(fen, depth, MULTI_PV);
  const lines = result.lines.map((line) => {
    const pvUci = line.pvUci;
    return {
      rank: line.rank,
      depth: line.depth,
      score: toWhiteScore(line.cp, line.mate, sideToMove),
      pvUci,
      pvSan: playUciMoves(fen, pvUci).sans,
    };
  });
  const top = lines[0];
  if (!top) throw new Error('The engine did not return an evaluation for a position.');

  return { fen, depth, score: top.score, bestUci: result.bestMove, lines };
}

export interface AnalyzeOptions {
  positions: string[];
  depth: number;
  engine: StockfishEngine;
  signal: AbortSignal;
  onProgress: (done: number, total: number) => void;
}

export async function evaluatePositions({ positions, depth, engine, signal, onProgress }: AnalyzeOptions): Promise<PositionEval[]> {
  const results: PositionEval[] = [];
  for (const fen of positions) {
    if (signal.aborted) throw new DOMException('Analysis cancelled', 'AbortError');
    results.push(await evaluatePosition(engine, fen, depth));
    onProgress(results.length, positions.length);
  }
  if (signal.aborted) throw new DOMException('Analysis cancelled', 'AbortError');
  return results;
}

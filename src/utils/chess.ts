import { Chess } from 'chess.js';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function isGameOver(fen: string): boolean {
  return new Chess(fen).isGameOver();
}

export function playUciMoves(fen: string, uciMoves: string[]): { fens: string[]; sans: string[] } {
  const chess = new Chess(fen);
  const fens: string[] = [];
  const sans: string[] = [];
  for (const uci of uciMoves) {
    try {
      const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      sans.push(move.san);
      fens.push(chess.fen());
    } catch {
      break;
    }
  }
  return { fens, sans };
}

export function uciToSan(fen: string, uci: string): string | null {
  return playUciMoves(fen, [uci]).sans[0] ?? null;
}

export function legalMovesFrom(fen: string, square: string): { to: string; capture: boolean }[] {
  return new Chess(fen)
    .moves({ square: square as never, verbose: true })
    .map((m) => ({ to: m.to, capture: m.captured !== undefined }));
}

export function opponentCanCapture(fen: string, square: string): boolean {
  return new Chess(fen).moves({ verbose: true }).some((m) => m.to === square);
}

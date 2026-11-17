import { Chess } from 'chess.js';
import type { GameAnalysis, ParsedGame, ParsedMove } from '@/types';
import { formatEval } from '@/utils/eval';

const CLOCK_PATTERN = /\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/;

function parseClock(comment: string): number | undefined {
  const match = CLOCK_PATTERN.exec(comment);
  if (!match) return undefined;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

export function parseGame(pgn: string): ParsedGame {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn.trim());
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown problem';
    throw new Error(`This PGN could not be read. Check the moves and headers. (${reason})`);
  }

  const history = chess.history({ verbose: true });
  if (history.length === 0) throw new Error('No moves were found in this PGN.');

  const clocks = new Map<string, number>();
  for (const { fen, comment } of chess.getComments()) {
    const clock = parseClock(comment);
    if (clock !== undefined) clocks.set(fen, clock);
  }

  const moves: ParsedMove[] = history.map((move, index) => ({
    index,
    san: move.san,
    uci: `${move.from}${move.to}${move.promotion ?? ''}`,
    color: move.color,
    piece: move.piece,
    captured: move.captured,
    from: move.from,
    to: move.to,
    fenBefore: move.before,
    fenAfter: move.after,
    clock: clocks.get(move.after),
  }));

  return {
    pgn,
    headers: chess.getHeaders(),
    moves,
    positions: [moves[0].fenBefore, ...moves.map((m) => m.fenAfter)],
    result: chess.getHeaders().Result ?? '*',
  };
}

const HEADER_ORDER = [
  'Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result',
  'WhiteElo', 'BlackElo', 'TimeControl', 'ECO', 'Opening', 'Termination',
];

function formatComment(analysis: GameAnalysis, index: number): string {
  const after = analysis.positions[index + 1];
  return `{${formatEval(after.score)}/${analysis.depth}}`;
}

export function buildAnnotatedPgn(game: ParsedGame, analysis: GameAnalysis | null): string {
  const headers = Object.entries(game.headers)
    .sort(([a], [b]) => {
      const ia = HEADER_ORDER.indexOf(a);
      const ib = HEADER_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([key, value]) => `[${key} "${value.replace(/"/g, '\\"')}"]`);

  const tokens: string[] = [];
  game.moves.forEach((move, index) => {
    if (move.color === 'w') tokens.push(`${Math.floor(index / 2) + 1}.`);
    tokens.push(move.san);
    if (analysis) tokens.push(formatComment(analysis, index));
  });
  tokens.push(game.result);

  const lines: string[] = [];
  let current = '';
  for (const token of tokens) {
    if (current && current.length + token.length + 1 > 80) {
      lines.push(current);
      current = token;
    } else {
      current = current ? `${current} ${token}` : token;
    }
  }
  if (current) lines.push(current);

  return `${headers.join('\n')}\n\n${lines.join('\n')}\n`;
}

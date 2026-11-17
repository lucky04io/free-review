import type { PieceSymbol } from 'chess.js';

export type Color = 'w' | 'b';

export type BoardThemeId = 'green' | 'brown' | 'blue';

export type PieceSetId = 'classic' | 'glyph';

export type Classification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'miss';

export type Score = { type: 'cp'; value: number } | { type: 'mate'; value: number };

export interface EngineLine {
  rank: number;
  depth: number;
  score: Score;
  pvUci: string[];
  pvSan: string[];
}

export interface PositionEval {
  fen: string;
  depth: number;
  score: Score;
  bestUci: string | null;
  lines: EngineLine[];
}

export interface ParsedMove {
  index: number;
  san: string;
  uci: string;
  color: Color;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  from: string;
  to: string;
  fenBefore: string;
  fenAfter: string;
  clock?: number;
}

export interface ParsedGame {
  pgn: string;
  headers: Record<string, string>;
  moves: ParsedMove[];
  positions: string[];
  result: string;
}

export interface OpeningMatch {
  eco: string;
  name: string;
  description: string;
  bookLength: number;
}

export interface MoveAnalysis {
  index: number;
  san: string;
  uci: string;
  color: Color;
  cpLoss: number;
  accuracy: number;
  classification: Classification;
  bestSan: string | null;
  bestUci: string | null;
  clock?: number;
}

export interface PlayerSummary {
  accuracy: number;
  acpl: number;
  counts: Record<Classification, number>;
}

export interface GameAnalysis {
  depth: number;
  positions: PositionEval[];
  moves: MoveAnalysis[];
  summary: Record<Color, PlayerSummary>;
  opening: OpeningMatch | null;
}

export type ThemeMode = 'dark' | 'light';

export interface Settings {
  theme: ThemeMode;
  boardTheme: BoardThemeId;
  pieceSet: PieceSetId;
  depth: number;
  autoplayMs: number;
}

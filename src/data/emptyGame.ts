import type { ParsedGame } from '@/types';
import { START_FEN } from '@/utils/chess';

/** Placeholder shown on the board before any game has been imported. */
export const EMPTY_GAME: ParsedGame = {
  pgn: '',
  headers: {},
  moves: [],
  positions: [START_FEN],
  result: '*',
};

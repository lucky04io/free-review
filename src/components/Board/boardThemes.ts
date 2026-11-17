import type { BoardThemeId, PieceSetId } from '@/types';

export const BOARD_THEMES: Record<BoardThemeId, { label: string; light: string; dark: string }> = {
  green: { label: 'Green', light: '#eeeed2', dark: '#769656' },
  brown: { label: 'Walnut', light: '#f0d9b5', dark: '#b58863' },
  blue: { label: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
};

export const PIECE_SETS: Record<PieceSetId, { label: string; description: string }> = {
  classic: { label: 'Classic', description: 'Traditional engraved pieces' },
  glyph: { label: 'Glyph', description: 'Bold chess symbols' },
};

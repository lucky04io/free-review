/* eslint-disable react-refresh/only-export-components -- file exports a piece-renderer map, not a component tree */
import type { ReactElement } from 'react';

const GLYPHS = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
} as const;

type PieceKey = keyof typeof GLYPHS;

function glyphPiece(key: PieceKey) {
  const isWhite = key.startsWith('w');
  return function GlyphPiece({ squareWidth }: { squareWidth: number }): ReactElement {
    return (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: squareWidth * 0.78,
          lineHeight: 1,
          color: isWhite ? '#ffffff' : '#111111',
          textShadow: isWhite
            ? '0 0 2px #111, 0 0 2px #111, 1px 1px 0 #111'
            : '0 0 3px rgba(255,255,255,0.35)',
          userSelect: 'none',
        }}
      >
        {GLYPHS[key]}
      </div>
    );
  };
}

export const GLYPH_PIECES = Object.fromEntries(
  (Object.keys(GLYPHS) as PieceKey[]).map((key) => [key, glyphPiece(key)]),
);

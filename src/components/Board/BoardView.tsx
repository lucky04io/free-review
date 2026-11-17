import { useMemo, useState, type ComponentProps } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import type { BoardThemeId, Classification, PieceSetId } from '@/types';
import { legalMovesFrom } from '@/utils/chess';
import { BOARD_THEMES } from '@/components/Board/boardThemes';
import { GLYPH_PIECES } from '@/components/Board/GlyphPieces';
import { ClassificationBadge } from '@/components/MoveList/ClassificationBadge';

type BoardProps = ComponentProps<typeof Chessboard>;
type Square = Parameters<NonNullable<BoardProps['onSquareClick']>>[0];

export interface BoardArrow {
  from: string;
  to: string;
  color: string;
}

export interface BoardBadge {
  square: string;
  classification: Classification;
}

interface BoardViewProps {
  fen: string;
  orientation: 'white' | 'black';
  boardTheme: BoardThemeId;
  pieceSet: PieceSetId;
  width: number;
  lastMove: { from: string; to: string } | null;
  arrows: BoardArrow[];
  badge: BoardBadge | null;
  interactive: boolean;
  onUserMove: (fen: string) => void;
}

const LAST_MOVE_OVERLAY = 'inset 0 0 0 200px rgba(255, 255, 51, 0.42)';
const CHECK_GRADIENT = 'radial-gradient(ellipse at center, rgba(255,0,0,0.85) 0%, rgba(255,0,0,0.35) 45%, transparent 75%)';
const MOVE_DOT = 'radial-gradient(circle, rgba(0,0,0,0.22) 22%, transparent 24%)';
const CAPTURE_RING = 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.22) 62%)';
const FILES = 'abcdefgh';

function badgeOffset(square: string, orientation: 'white' | 'black', boardWidth: number, badgePx: number) {
  const file = FILES.indexOf(square.charAt(0));
  const rank = Number(square.charAt(1));
  const col = orientation === 'white' ? file : 7 - file;
  const row = orientation === 'white' ? 8 - rank : rank - 1;
  const cell = boardWidth / 8;
  return {
    left: Math.min((col + 1) * cell - badgePx * 0.72, boardWidth - badgePx - 1),
    top: Math.max(row * cell - badgePx * 0.28, 1),
  };
}

export function BoardView({ fen, orientation, boardTheme, pieceSet, width, lastMove, arrows, badge, interactive, onUserMove }: BoardViewProps) {
  const [selection, setSelection] = useState<{ fen: string; square: string } | null>(null);
  const selected = interactive && selection && selection.fen === fen ? selection.square : null;
  const theme = BOARD_THEMES[boardTheme];

  const targets = useMemo(() => (selected ? legalMovesFrom(fen, selected) : []), [fen, selected]);

  const squareStyles = useMemo(() => {
    const styles: Partial<Record<Square, Record<string, string>>> = {};
    const set = (square: string, style: Record<string, string>) => {
      styles[square as Square] = { ...styles[square as Square], ...style };
    };
    if (lastMove) {
      set(lastMove.from, { boxShadow: LAST_MOVE_OVERLAY });
      set(lastMove.to, { boxShadow: LAST_MOVE_OVERLAY });
    }
    const chess = new Chess(fen);
    if (chess.inCheck()) {
      const king = chess.board().flat().find((p) => p?.type === 'k' && p.color === chess.turn());
      if (king) set(`${king.square}`, { backgroundImage: CHECK_GRADIENT });
    }
    if (selected) set(selected, { boxShadow: 'inset 0 0 0 200px rgba(20, 85, 30, 0.45)' });
    for (const target of targets) {
      set(target.to, { backgroundImage: target.capture ? CAPTURE_RING : MOVE_DOT });
    }
    return styles;
  }, [fen, lastMove, selected, targets]);

  const tryMove = (from: string, to: string): boolean => {
    const chess = new Chess(fen);
    try {
      chess.move({ from, to, promotion: 'q' });
    } catch {
      return false;
    }
    setSelection(null);
    onUserMove(chess.fen());
    return true;
  };

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;
    if (selected && targets.some((t) => t.to === square)) {
      tryMove(selected, square);
      return;
    }
    setSelection(legalMovesFrom(fen, square).length ? { fen, square } : null);
  };

  const badgePx = Math.max(20, Math.round(width / 8 * 0.42));
  const badgePos = badge ? badgeOffset(badge.square, orientation, width, badgePx) : null;

  return (
    <div className="relative" style={{ width, height: width }}>
      <Chessboard
        id={`board-${boardTheme}-${pieceSet}`}
        position={fen}
        boardWidth={width}
        boardOrientation={orientation}
        arePiecesDraggable={interactive}
        onPieceDragBegin={(_piece, square) => {
          setSelection(legalMovesFrom(fen, square).length ? { fen, square } : null);
        }}
        onPieceDrop={(source, target) => tryMove(source, target)}
        onSquareClick={handleSquareClick}
        customDarkSquareStyle={{ backgroundColor: theme.dark }}
        customLightSquareStyle={{ backgroundColor: theme.light }}
        customSquareStyles={squareStyles}
        customArrows={arrows.map((a) => [a.from as Square, a.to as Square, a.color])}
        customBoardStyle={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.35)' }}
        customPieces={pieceSet === 'glyph' ? GLYPH_PIECES : undefined}
        animationDuration={200}
      />
      {badge && badgePos && (
        <div className="pointer-events-none absolute z-20" style={badgePos}>
          <ClassificationBadge classification={badge.classification} size={badgePx} />
        </div>
      )}
    </div>
  );
}

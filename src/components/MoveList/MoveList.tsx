import { useEffect, useRef } from 'react';
import type { MoveAnalysis, ParsedMove } from '@/types';
import { formatClock } from '@/utils/eval';
import { figurine } from '@/utils/figurine';
import { ClassificationBadge } from '@/components/MoveList/ClassificationBadge';

interface MoveListProps {
  moves: ParsedMove[];
  analysis: MoveAnalysis[] | null;
  ply: number;
  onSelect: (ply: number) => void;
}

const TIME_TROUBLE_SECONDS = 10;

export function MoveList({ moves, analysis, ply, onSelect }: MoveListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = listRef.current;
    const active = container?.querySelector<HTMLElement>('[data-active="true"]');
    if (!container || !active) return;
    const top = active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2;
    container.scrollTo({ top, behavior: 'smooth' });
  }, [ply]);

  const rows: number[] = [];
  for (let i = 0; i < moves.length; i += 2) rows.push(i);

  const renderCell = (index: number) => {
    const move = moves[index];
    if (!move) return <div className="flex-1" />;
    const annotation = analysis?.[index];
    const isActive = ply === index + 1;
    const lowTime = move.clock !== undefined && move.clock < TIME_TROUBLE_SECONDS;
    return (
      <button
        type="button"
        data-active={isActive}
        onClick={() => onSelect(index + 1)}
        className={`flex min-w-0 flex-1 items-center gap-1.5 rounded px-2 py-1.5 text-left text-[15px] transition-colors ${
          isActive ? 'bg-raised font-bold text-ink' : 'font-semibold text-muted hover:bg-raised/60 hover:text-ink'
        }`}
      >
        {annotation && <ClassificationBadge classification={annotation.classification} />}
        <span className="truncate">{figurine(move.san)}</span>
        {move.clock !== undefined && (
          <span className={`ml-auto font-mono text-[11px] font-normal tabular-nums ${lowTime ? 'text-error-400' : 'text-subtle'}`}>
            {formatClock(move.clock)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div ref={listRef} className="relative min-h-0 flex-1 overflow-y-auto">
      {moves.length === 0 ? (
        <p className="p-4 text-sm text-muted">No moves in this game.</p>
      ) : (
        <ol>
          {rows.map((i) => (
            <li key={i} className={`flex items-stretch ${(i / 2) % 2 === 1 ? 'bg-deep/50' : ''}`}>
              <span className="flex w-10 shrink-0 items-center justify-center bg-deep text-xs font-semibold tabular-nums text-subtle">
                {i / 2 + 1}
              </span>
              {renderCell(i)}
              {renderCell(i + 1)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

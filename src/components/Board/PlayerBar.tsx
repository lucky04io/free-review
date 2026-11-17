import type { Color } from '@/types';
import { formatClock } from '@/utils/eval';

export const PLAYER_BAR_HEIGHT = 44;
const LOW_TIME_SECONDS = 10;

interface PlayerBarProps {
  name: string;
  elo?: string;
  color: Color;
  clock?: number;
}

export function PlayerBar({ name, elo, color, clock }: PlayerBarProps) {
  const isWhite = color === 'w';
  const lowTime = clock !== undefined && clock < LOW_TIME_SECONDS;
  const clockText = lowTime ? (isWhite ? 'text-error-500' : 'text-error-400') : isWhite ? 'text-[#262522]' : 'text-white';

  return (
    <div className="flex items-center gap-2.5" style={{ height: PLAYER_BAR_HEIGHT }}>
      <span
        aria-hidden
        className={`grid h-8 w-8 shrink-0 place-items-center rounded text-sm font-extrabold ${
          isWhite ? 'bg-[#e8e6e3] text-[#262522] ring-1 ring-black/15' : 'bg-[#1d1c1a] text-white ring-1 ring-white/10'
        }`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate text-sm font-bold text-ink">{name}</span>
        {elo && <span className="shrink-0 text-xs text-muted">({elo})</span>}
      </div>
      {clock !== undefined && (
        <span
          className={`ml-auto rounded px-2.5 py-1 font-mono text-[15px] font-bold tabular-nums ${
            isWhite ? 'bg-[#f0efed] ring-1 ring-black/15' : 'bg-[#1d1c1a]'
          } ${clockText}`}
        >
          {formatClock(clock)}
        </span>
      )}
    </div>
  );
}

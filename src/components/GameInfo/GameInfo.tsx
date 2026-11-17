import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { GameAnalysis, OpeningMatch, ParsedGame } from '@/types';
import { formatClock } from '@/utils/eval';
import { ClassificationBadge } from '@/components/MoveList/ClassificationBadge';

interface GameInfoProps {
  game: ParsedGame;
  analysis: GameAnalysis | null;
  ply: number;
}

const RESULT_LABELS: Record<string, string> = {
  '1-0': 'White wins',
  '0-1': 'Black wins',
  '1/2-1/2': 'Draw',
  '*': 'In progress',
};

function OpeningDetails({ opening }: { opening: OpeningMatch | null }) {
  const [open, setOpen] = useState(false);
  if (!opening) return null;
  const wiki = `https://www.chess.com/openings/${opening.eco}`;
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-raised"
        aria-expanded={open}
      >
        <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-xs font-bold text-primary-400">{opening.eco}</span>
        <span className="flex-1 truncate text-sm font-semibold text-ink">{opening.name}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="animate-fade-up space-y-2 px-4 pb-3 text-sm text-muted">
          <p className="leading-relaxed">{opening.description}</p>
          <a
            href={wiki}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary-400 transition-colors hover:text-primary-500"
          >
            Explore this opening on Chess.com <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

export function GameInfo({ game, analysis, ply }: GameInfoProps) {
  const { headers } = game;
  const timeControl = headers.TimeControl ?? '-';
  const baseSeconds = timeControl.split('+')[0];
  const isRealTime = Number(baseSeconds) > 0 && baseSeconds !== '-';
  const lastMove = analysis?.moves[ply - 1];
  const clock = game.moves[ply - 1]?.clock;

  const rows: [string, string][] = [
    ['Event', headers.Event ?? 'Casual game'],
    ['Date', headers.Date ?? 'Unknown date'],
    ['Time control', isRealTime ? `${timeControl}${headers.TimeControl?.includes('+') ? ' inc' : ''}` : timeControl],
    ['Round', headers.Round ?? '-'],
  ];

  return (
    <div>
      <OpeningDetails opening={analysis?.opening ?? null} />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2 rounded-lg bg-raised/70 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-[#f5f5f0] ring-1 ring-line" />
            <span className="truncate font-semibold text-ink">{headers.White ?? 'White'}</span>
          </div>
          {headers.WhiteElo && <span className="shrink-0 text-xs text-muted">{headers.WhiteElo}</span>}
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg bg-raised/70 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-[#1f1e1b] ring-1 ring-line" />
            <span className="truncate font-semibold text-ink">{headers.Black ?? 'Black'}</span>
          </div>
          {headers.BlackElo && <span className="shrink-0 text-xs text-muted">{headers.BlackElo}</span>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Result</span>
          <span className="font-semibold text-ink">
            {RESULT_LABELS[game.result] ?? game.result}
            {headers.Termination ? ` · ${headers.Termination.replace(/^Game /i, '')}` : ''}
          </span>
        </div>

        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2 text-sm">
            <span className="shrink-0 text-muted">{label}</span>
            <span className="truncate text-right text-ink">{value}</span>
          </div>
        ))}

        {clock !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Clock at this move</span>
            <span className="font-mono font-semibold tabular-nums text-ink">{formatClock(clock)}</span>
          </div>
        )}

        {lastMove && (
          <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="text-muted">Played here</span>
            <span className="flex items-center gap-2">
              <span className="font-mono font-semibold text-ink">{lastMove.san}</span>
              <ClassificationBadge classification={lastMove.classification} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

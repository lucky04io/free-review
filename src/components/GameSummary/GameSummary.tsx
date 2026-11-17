import type { Classification, GameAnalysis } from '@/types';
import { CLASSIFICATION_META } from '@/engine/classify';
import { estimateRating } from '@/utils/rating';
import { ClassificationBadge } from '@/components/MoveList/ClassificationBadge';

interface GameSummaryProps {
  analysis: GameAnalysis;
  white: { name: string; elo?: string };
  black: { name: string; elo?: string };
}

const DISPLAY_ORDER: Classification[] = [
  'brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'miss', 'blunder',
];

const MIN_MOVES_FOR_RATING = 6;
const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_84px_84px] items-center gap-x-2';

function ScoreBox({ value, side }: { value: string; side: 'w' | 'b' }) {
  return (
    <div
      className={`rounded-md py-1.5 text-center text-lg font-extrabold tabular-nums ${
        side === 'w' ? 'bg-[#f0efed] text-[#262522] ring-1 ring-black/15' : 'bg-[#1d1c1a] text-white'
      }`}
    >
      {value}
    </div>
  );
}

export function GameSummary({ analysis, white, black }: GameSummaryProps) {
  const { w, b } = analysis.summary;
  const moveCount = (counts: Record<Classification, number>) => DISPLAY_ORDER.reduce((sum, key) => sum + counts[key], 0);
  const rating = (summary: typeof w) =>
    moveCount(summary.counts) >= MIN_MOVES_FOR_RATING ? String(estimateRating(summary.accuracy)) : '—';

  return (
    <div className="space-y-3">
      <div className={COLUMNS}>
        <span />
        <span className="truncate text-center text-xs font-bold text-ink" title={white.name}>{white.name}</span>
        <span className="truncate text-center text-xs font-bold text-ink" title={black.name}>{black.name}</span>
      </div>

      <div className={COLUMNS}>
        <span className="text-sm font-semibold text-muted">Accuracy</span>
        <ScoreBox side="w" value={w.accuracy.toFixed(1)} />
        <ScoreBox side="b" value={b.accuracy.toFixed(1)} />
      </div>

      <div className={COLUMNS}>
        <span className="text-sm font-semibold text-muted" title="Estimated from accuracy. Not an official rating.">
          Game rating
        </span>
        <ScoreBox side="w" value={rating(w)} />
        <ScoreBox side="b" value={rating(b)} />
      </div>

      <div className="space-y-1 border-t border-line pt-3">
        {DISPLAY_ORDER.map((key) => {
          const meta = CLASSIFICATION_META[key];
          return (
            <div key={key} className={`${COLUMNS} py-0.5`}>
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: meta.color }}>
                <ClassificationBadge classification={key} size="md" />
                {meta.label}
              </span>
              {([w, b] as const).map((summary, i) => (
                <span
                  key={i}
                  className={`text-center text-sm font-bold tabular-nums ${summary.counts[key] > 0 ? 'text-ink' : 'text-subtle'}`}
                >
                  {summary.counts[key]}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <p className="pt-1 text-xs leading-relaxed text-subtle">
        Game rating is an estimate based on accuracy, not an official rating. Average centipawn loss: {w.acpl.toFixed(0)} (White), {b.acpl.toFixed(0)} (Black).
      </p>
    </div>
  );
}

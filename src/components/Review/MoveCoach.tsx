import type { ReactNode } from 'react';
import type { Classification, MoveAnalysis, ParsedMove, PositionEval } from '@/types';
import { CLASSIFICATION_META } from '@/engine/classify';
import { formatEvalShort } from '@/utils/eval';
import { figurine } from '@/utils/figurine';
import { ClassificationBadge } from '@/components/MoveList/ClassificationBadge';

const PHRASE: Record<Classification, string> = {
  brilliant: 'a brilliant move',
  great: 'a great move',
  best: 'the best move',
  excellent: 'an excellent move',
  good: 'a good move',
  book: 'a book move',
  inaccuracy: 'an inaccuracy',
  mistake: 'a mistake',
  blunder: 'a blunder',
  miss: 'a miss',
};

const ERRORS: Classification[] = ['inaccuracy', 'mistake', 'miss', 'blunder'];

interface MoveCoachProps {
  ply: number;
  move: ParsedMove | undefined;
  annotation: MoveAnalysis | undefined;
  evaluation: PositionEval | null;
  openingName: string | null;
  hasAnalysis: boolean;
}

export function MoveCoach({ ply, move, annotation, evaluation, openingName, hasAnalysis }: MoveCoachProps) {
  if (!move || ply === 0) {
    return (
      <div className="px-4 py-3 text-sm text-muted">
        {hasAnalysis
          ? 'Step through the game with the arrow keys or pick a move below.'
          : 'Pick a move below, or start the review to rate every move.'}
      </div>
    );
  }

  if (!annotation) {
    return (
      <div className="px-4 py-3">
        <p className="text-[15px] font-bold text-ink">{figurine(move.san)}</p>
        <p className="mt-0.5 text-sm text-muted">Start the review to see how this move rates.</p>
      </div>
    );
  }

  const isError = ERRORS.includes(annotation.classification);
  const color = CLASSIFICATION_META[annotation.classification].color;
  const nextBest = evaluation?.lines[0]?.pvSan[0];
  const whiteAhead = evaluation ? (evaluation.score.type === 'cp' ? evaluation.score.value >= 0 : evaluation.score.value > 0) : true;

  let detail: ReactNode = null;
  if (annotation.classification === 'book') {
    detail = openingName ? <span>{openingName}</span> : null;
  } else if (isError && annotation.bestSan) {
    detail = (
      <span>
        Best was <strong className="font-bold text-primary-400">{figurine(annotation.bestSan)}</strong>
      </span>
    );
  } else if (nextBest) {
    detail = (
      <span>
        Engine suggests <strong className="font-bold text-primary-400">{figurine(nextBest)}</strong> next
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <ClassificationBadge classification={annotation.classification} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold" style={{ color }}>
          {figurine(move.san)} is {PHRASE[annotation.classification]}
        </p>
        {detail && <p className="mt-0.5 truncate text-sm text-muted">{detail}</p>}
      </div>
      {evaluation && (
        <span
          className={`shrink-0 rounded px-2 py-1 font-mono text-sm font-bold tabular-nums ${
            whiteAhead ? 'bg-[#f0efed] text-[#262522] ring-1 ring-black/15' : 'bg-[#1d1c1a] text-white'
          }`}
        >
          {formatEvalShort(evaluation.score)}
        </span>
      )}
    </div>
  );
}

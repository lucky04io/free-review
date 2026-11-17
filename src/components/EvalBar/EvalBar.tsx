import type { Score } from '@/types';
import { formatEval, formatEvalShort, isGameEndScore, whiteWinShare } from '@/utils/eval';

interface EvalBarProps {
  score: Score | null;
  orientation: 'white' | 'black';
}

export function EvalBar({ score, orientation }: EvalBarProps) {
  const whiteShare = score ? whiteWinShare(score) : 50;
  const whiteAhead = whiteShare >= 50;
  const label = score ? (isGameEndScore(score) ? formatEval(score) : formatEvalShort(score)) : '0.0';
  const whiteOnBottom = orientation === 'white';
  const labelAtBottom = whiteAhead === whiteOnBottom;
  const whiteFillPercent = whiteOnBottom ? whiteShare : 100 - whiteShare;

  return (
    <div
      className="relative h-full w-7 shrink-0 overflow-hidden rounded bg-[#403d39] ring-1 ring-inset ring-black/25"
      role="meter"
      aria-label="Evaluation bar"
      aria-valuetext={label}
    >
      <div
        className="absolute inset-x-0 bottom-0 bg-[#f0efed] transition-[height] duration-500 ease-out"
        style={{ height: `${whiteFillPercent}%` }}
      />
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#8b8987]/50" />
      <span
        className={`absolute inset-x-0 text-center text-[11px] font-bold tabular-nums ${
          labelAtBottom ? 'bottom-1 text-[#403d39]' : 'top-1 text-[#f0efed]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

import { useMemo, useState } from 'react';
import type { PositionEval } from '@/types';
import { formatEvalShort, whiteWinShare } from '@/utils/eval';

interface EvalGraphProps {
  positions: PositionEval[] | null;
  ply: number;
  onSelect: (ply: number) => void;
}

const HEIGHT = 80;

export function EvalGraph({ positions, ply, onSelect }: EvalGraphProps) {
  const [hover, setHover] = useState<number | null>(null);

  const path = useMemo(() => {
    if (!positions || positions.length < 2) return null;
    const total = positions.length - 1;
    return positions
      .map((p, i) => {
        const x = (i / total) * 100;
        const y = HEIGHT * (1 - whiteWinShare(p.score) / 100);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [positions]);

  if (!positions || !path) return null;

  const total = positions.length - 1;
  const toPly = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(total, Math.round(((clientX - rect.left) / rect.width) * total)));

  return (
    <div className="relative w-full select-none overflow-hidden rounded-md" style={{ height: HEIGHT }}>
      <svg
        viewBox={`0 0 100 ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full cursor-pointer"
        onClick={(e) => onSelect(toPly(e.clientX, e.currentTarget.getBoundingClientRect()))}
        onMouseMove={(e) => setHover(toPly(e.clientX, e.currentTarget.getBoundingClientRect()))}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Evaluation graph"
      >
        <rect x="0" y="0" width="100" height={HEIGHT} fill="#403d39" />
        <path d={`${path} L100,${HEIGHT} L0,${HEIGHT} Z`} fill="#f0efed" />
        <line x1="0" y1={HEIGHT / 2} x2="100" y2={HEIGHT / 2} stroke="#8b8987" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" opacity="0.7" />
        <line
          x1={(ply / total) * 100}
          y1="0"
          x2={(ply / total) * 100}
          y2={HEIGHT}
          stroke="#e58f2a"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {hover !== null && positions[hover] && (
        <div
          className="pointer-events-none absolute top-1 rounded bg-black/80 px-2 py-0.5 font-mono text-[11px] text-white"
          style={{ left: `min(max(0px, calc(${(hover / total) * 100}% - 28px)), calc(100% - 78px))` }}
        >
          {hover === 0 ? 'Start' : `${Math.ceil(hover / 2)}${hover % 2 === 0 ? '…' : '.'}`} {formatEvalShort(positions[hover].score)}
        </div>
      )}
    </div>
  );
}

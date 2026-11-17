import type { EngineLine } from '@/types';
import { formatEval } from '@/utils/eval';
import { playUciMoves } from '@/utils/chess';
import { figurine } from '@/utils/figurine';

interface EngineLinesProps {
  lines: EngineLine[] | null;
  fen: string;
  emptyMessage: string;
  onPreview: (fen: string) => void;
}

const PREVIEW_MOVES = 10;

function moveNumberLabel(fen: string, k: number): string | null {
  const [, turn, , , , fullMoveText] = fen.split(' ');
  const fullMove = Number(fullMoveText);
  const isWhiteMove = (turn === 'w') === (k % 2 === 0);
  const number = fullMove + Math.floor((k + (turn === 'w' ? 0 : 1)) / 2);
  if (isWhiteMove) return `${number}.`;
  return k === 0 ? `${number}...` : null;
}

export function EngineLines({ lines, fen, emptyMessage, onPreview }: EngineLinesProps) {
  if (!lines || lines.length === 0) {
    return <p className="p-4 text-sm leading-relaxed text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {lines.map((line) => {
        const favorsWhite = line.score.type === 'cp' ? line.score.value >= 0 : line.score.value > 0;
        return (
          <li key={line.rank} className="rounded-lg border border-line bg-raised/60 p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums ${
                  favorsWhite ? 'bg-[#f5f5f0] text-[#262522]' : 'bg-[#1f1e1b] text-[#f5f5f0]'
                }`}
              >
                {formatEval(line.score)}
              </span>
              <span className="text-[11px] text-subtle">depth {line.depth}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-0.5 gap-y-0.5 text-[13px] leading-6">
              {line.pvSan.slice(0, PREVIEW_MOVES).map((san, k) => {
                const label = moveNumberLabel(fen, k);
                return (
                  <button
                    key={`${line.rank}-${k}`}
                    type="button"
                    onClick={() => {
                      const { fens } = playUciMoves(fen, line.pvUci.slice(0, k + 1));
                      onPreview(fens[fens.length - 1] ?? fen);
                    }}
                    className="rounded px-1 font-medium text-ink transition-colors hover:bg-primary-500/20 hover:text-primary-400"
                  >
                    {label && <span className="mr-0.5 text-subtle">{label}</span>}
                    {figurine(san)}
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

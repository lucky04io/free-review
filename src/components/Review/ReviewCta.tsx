import { Loader2, Search, Square } from 'lucide-react';
import type { AnalysisStatus } from '@/hooks/useAnalysis';

interface ReviewCtaProps {
  status: AnalysisStatus;
  progress: { done: number; total: number };
  depth: number;
  error: string | null;
  onStart: () => void;
  onCancel: () => void;
}

export function ReviewCta({ status, progress, depth, error, onStart, onCancel }: ReviewCtaProps) {
  if (status === 'running') {
    const percent = Math.round((progress.done / Math.max(progress.total, 1)) * 100);
    return (
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-ink">
            <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
            Reviewing… {percent}%
          </span>
          <button type="button" className="btn-ghost h-8 gap-1.5 px-2 text-xs font-semibold" onClick={onCancel}>
            <Square className="h-3 w-3" /> Stop
          </button>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-raised">
          <div className="h-full rounded-full bg-primary-500 transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-subtle">
          Position {Math.min(progress.done + 1, progress.total)} of {progress.total}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && <p className="mb-3 rounded-md bg-error-500/15 px-3 py-2 text-sm text-ink">{error}</p>}
      <button type="button" className="btn-primary w-full py-3 text-base" onClick={onStart}>
        <Search className="h-5 w-5" /> Start review
      </button>
      <p className="mt-3 text-center text-xs text-subtle">Stockfish 16 · depth {depth} · runs in your browser</p>
    </div>
  );
}

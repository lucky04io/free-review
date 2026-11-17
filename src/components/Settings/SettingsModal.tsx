import { X } from 'lucide-react';
import type { Settings } from '@/types';
import { BOARD_THEMES, PIECE_SETS } from '@/components/Board/boardThemes';

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const DEPTH_MIN = 12;
const DEPTH_MAX = 24;

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-raised p-1" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
            value === option.id ? 'bg-panel text-ink shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Swatches({ value, colors, onSelect }: { value: string; colors: { id: string; label: string; light: string; dark: string }[]; onSelect: (id: never) => void }) {
  return (
    <div className="flex gap-2">
      {colors.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id as never)}
          aria-pressed={value === theme.id}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            value === theme.id ? 'border-primary-500 text-ink' : 'border-line text-muted hover:text-ink'
          }`}
        >
          <span className="flex overflow-hidden rounded border border-line">
            <span className="h-5 w-3" style={{ backgroundColor: theme.light }} />
            <span className="h-5 w-3" style={{ backgroundColor: theme.dark }} />
          </span>
          {theme.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsModal({ open, settings, onChange, onClose }: SettingsModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card flex max-w-md flex-col animate-fade-up" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="panel-header">
          Settings
          <button type="button" className="btn-ghost -mr-2 h-8 w-8 rounded-md p-1" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 p-4">
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink">Appearance</p>
            <SegmentedControl
              ariaLabel="Color theme"
              value={settings.theme}
              onChange={(theme) => onChange({ theme })}
              options={[
                { id: 'dark', label: 'Dark' },
                { id: 'light', label: 'Light' },
              ]}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink">Board theme</p>
            <Swatches
              value={settings.boardTheme}
              colors={Object.entries(BOARD_THEMES).map(([id, t]) => ({ id, ...t }))}
              onSelect={(id) => onChange({ boardTheme: id as Settings['boardTheme'] })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink">Piece set</p>
            <SegmentedControl
              ariaLabel="Piece set"
              value={settings.pieceSet}
              onChange={(pieceSet) => onChange({ pieceSet })}
              options={Object.entries(PIECE_SETS).map(([id, p]) => ({ id: id as Settings['pieceSet'], label: p.label }))}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <p className="text-sm font-semibold text-ink">Engine depth</p>
              <span className="font-mono text-sm text-primary-400">{settings.depth}</span>
            </div>
            <input
              type="range"
              min={DEPTH_MIN}
              max={DEPTH_MAX}
              value={settings.depth}
              onChange={(e) => onChange({ depth: Number(e.target.value) })}
              className="w-full accent-[rgb(var(--c-primary-500))]"
              aria-label="Engine depth"
            />
            <div className="mt-1 flex justify-between text-xs text-subtle">
              <span>Faster ({DEPTH_MIN})</span>
              <span>Stronger ({DEPTH_MAX})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

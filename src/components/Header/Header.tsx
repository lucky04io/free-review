import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Moon, Settings as SettingsIcon, Sun, Upload } from 'lucide-react';

interface HeaderProps {
  onImport: () => void;
  onSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

interface NavControlsProps {
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export function Header({ onImport, onSettings, theme, onToggleTheme }: HeaderProps) {
  const iconButton = 'btn-ghost h-9 w-9';
  return (
    <header className="sticky top-0 z-40 bg-deep">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
              <circle cx="12" cy="6.5" r="3.3" />
              <path d="M9.4 10.6h5.2l1.2 4.9H8.2l1.2-4.9z" />
              <path d="M6.2 20.5c0-2.2 1.5-3.8 3.4-4.3h4.8c1.9.5 3.4 2.1 3.4 4.3H6.2z" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">ChessSight</span>
          <span className="hidden text-sm font-semibold text-subtle sm:inline">Game Review</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" className={iconButton} onClick={onToggleTheme} aria-label="Switch light or dark theme">
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button type="button" className={iconButton} onClick={onSettings} aria-label="Open settings">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </button>
          <button type="button" className="btn-outline ml-1 shrink-0 whitespace-nowrap" onClick={onImport}>
            <Upload className="h-4 w-4" /> Import PGN
          </button>
        </div>
      </div>
    </header>
  );
}

export function NavControls({ onFirst, onPrev, onNext, onLast, canPrev, canNext }: NavControlsProps) {
  const button = 'btn-ghost h-11 flex-1 bg-raised/70 text-ink hover:bg-raised';
  const icon = 'h-5 w-5';
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={button} onClick={onFirst} disabled={!canPrev} aria-label="First move">
        <ChevronsLeft className={icon} />
      </button>
      <button type="button" className={button} onClick={onPrev} disabled={!canPrev} aria-label="Previous move">
        <ChevronLeft className={icon} />
      </button>
      <button type="button" className={button} onClick={onNext} disabled={!canNext} aria-label="Next move">
        <ChevronRight className={icon} />
      </button>
      <button type="button" className={button} onClick={onLast} disabled={!canNext} aria-label="Last move">
        <ChevronsRight className={icon} />
      </button>
    </div>
  );
}

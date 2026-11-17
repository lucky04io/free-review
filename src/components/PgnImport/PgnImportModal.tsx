import { useRef, useState } from 'react';
import { FileUp, Search, X } from 'lucide-react';

interface PgnFormProps {
  onImport: (pgn: string) => void;
  onCancel?: () => void;
  textareaClassName?: string;
}

export function PgnForm({ onImport, onCancel, textareaClassName = 'h-52' }: PgnFormProps) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = async (file: File) => {
    setFileName(file.name);
    setText(await file.text());
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <textarea
        className={`field resize-none font-mono text-xs leading-relaxed ${textareaClassName}`}
        placeholder={'Paste a PGN from Chess.com or Lichess…\n\n[White "..."]\n[Black "..."]\n\n1. e4 e5 2. Nf3 Nc6 …'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="PGN text"
        autoFocus
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-outline" onClick={() => fileRef.current?.click()}>
          <FileUp className="h-4 w-4" /> Upload .pgn
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pgn,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void loadFile(file);
            e.target.value = '';
          }}
        />
        {fileName && <span className="max-w-40 truncate text-xs text-muted">{fileName}</span>}
        <div className="ml-auto flex items-center gap-2">
          {onCancel && (
            <button type="button" className="btn-outline" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            disabled={!text.trim()}
            onClick={() => {
              onImport(text.trim());
              setText('');
              setFileName(null);
            }}
          >
            <Search className="h-4 w-4" /> Review game
          </button>
        </div>
      </div>
    </div>
  );
}

interface PgnImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (pgn: string) => void;
}

export function PgnImportModal({ open, onClose, onImport }: PgnImportProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card flex max-w-2xl animate-fade-up flex-col" role="dialog" aria-modal="true" aria-label="Import PGN">
        <div className="panel-header">
          Import a game
          <button type="button" className="btn-ghost -mr-2 h-8 w-8" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex p-4">
          <PgnForm onImport={onImport} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}

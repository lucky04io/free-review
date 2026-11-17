import { useEffect } from 'react';

interface KeyboardHandlers {
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onFlip: () => void;
  enabled: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useKeyboard({ onPrev, onNext, onFirst, onLast, onFlip, enabled }: KeyboardHandlers) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      switch (event.key) {
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'Home':
          onFirst();
          break;
        case 'End':
          onLast();
          break;
        case 'f':
        case 'F':
          onFlip();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onPrev, onNext, onFirst, onLast, onFlip]);
}

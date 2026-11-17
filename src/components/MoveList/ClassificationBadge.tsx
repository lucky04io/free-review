import { BookOpen, Check, Star, ThumbsUp, X } from 'lucide-react';
import type { Classification } from '@/types';
import { CLASSIFICATION_META } from '@/engine/classify';

const ICONS = {
  check: Check,
  'thumbs-up': ThumbsUp,
  star: Star,
  book: BookOpen,
  x: X,
} as const;

const SIZES = { sm: 18, md: 24, lg: 34 } as const;

interface ClassificationBadgeProps {
  classification: Classification;
  size?: keyof typeof SIZES | number;
}

export function ClassificationBadge({ classification, size = 'sm' }: ClassificationBadgeProps) {
  const meta = CLASSIFICATION_META[classification];
  const px = typeof size === 'number' ? size : SIZES[size];
  const Icon = meta.icon ? ICONS[meta.icon] : null;
  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-black leading-none tracking-tighter shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
      style={{
        width: px,
        height: px,
        fontSize: px * 0.5,
        backgroundColor: meta.color,
        color: classification === 'inaccuracy' ? '#1b1a18' : '#ffffff',
      }}
    >
      {Icon ? <Icon size={px * 0.58} strokeWidth={3} fill={classification === 'best' ? 'currentColor' : 'none'} /> : meta.glyph}
    </span>
  );
}

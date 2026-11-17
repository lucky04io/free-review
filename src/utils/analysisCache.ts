import type { GameAnalysis } from '@/types';

const CACHE_PREFIX = 'chesssight:analysis:v1:';
const CACHE_INDEX_KEY = 'chesssight:analysis:index:v1';
const MAX_CACHED_GAMES = 8;

export function hashText(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${(hash >>> 0).toString(16)}${text.length.toString(16)}`;
}

export function readCachedAnalysis(key: string): GameAnalysis | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameAnalysis;
    return Array.isArray(parsed.moves) && Array.isArray(parsed.positions) ? parsed : null;
  } catch {
    return null;
  }
}

function readCacheIndex(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CACHE_INDEX_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

export function writeCachedAnalysis(key: string, analysis: GameAnalysis): void {
  try {
    const index = readCacheIndex().filter((k) => k !== key);
    index.unshift(key);
    for (const stale of index.splice(MAX_CACHED_GAMES)) {
      localStorage.removeItem(CACHE_PREFIX + stale);
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(analysis));
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch {
    // Storage full or disabled: analysis still works, it just is not cached.
  }
}

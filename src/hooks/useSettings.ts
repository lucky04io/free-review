import { useEffect, useState } from 'react';
import type { Settings } from '@/types';

const SETTINGS_KEY = 'chesssight:settings:v1';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  boardTheme: 'green',
  pieceSet: 'classic',
  depth: 14,
  autoplayMs: 1200,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    // Existing installs persisted the old default of 18. Move those users to
    // the faster default while preserving any other saved preferences.
    const depth = parsed.depth === 18 ? DEFAULT_SETTINGS.depth : parsed.depth;
    return { ...DEFAULT_SETTINGS, ...parsed, depth };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  return { settings, updateSettings };
}

const SHARE_PARAM = 'game';
const PLY_PARAM = 'ply';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildShareHash(pgn: string, ply: number): string {
  return `#${SHARE_PARAM}=${toBase64Url(pgn)}&${PLY_PARAM}=${ply}`;
}

export function readShareHash(hash: string): { pgn: string; ply: number } | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const encoded = params.get(SHARE_PARAM);
  if (!encoded) return null;
  try {
    const ply = Number(params.get(PLY_PARAM) ?? 0);
    return { pgn: fromBase64Url(encoded), ply: Number.isFinite(ply) ? Math.max(0, Math.floor(ply)) : 0 };
  } catch {
    return null;
  }
}

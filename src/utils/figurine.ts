const FIGURINES: Record<string, string> = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞' };

/** Replaces the leading piece letter of a SAN move with its figurine, e.g. "Nf3" -> "♞f3". */
export function figurine(san: string): string {
  const glyph = FIGURINES[san.charAt(0)];
  return glyph ? glyph + san.slice(1) : san;
}

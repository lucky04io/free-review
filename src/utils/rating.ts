// Rough accuracy -> rating curve. This is an estimate, not an official rating.
const CURVE: [accuracy: number, rating: number][] = [
  [40, 300], [55, 550], [65, 800], [72, 1000], [78, 1300], [82, 1500],
  [87, 1800], [90, 2000], [93, 2300], [96, 2600], [99, 2900], [100, 3000],
];

export function estimateRating(accuracy: number): number {
  const [firstX, firstY] = CURVE[0];
  if (accuracy <= firstX) return firstY;
  for (let i = 1; i < CURVE.length; i++) {
    const [x0, y0] = CURVE[i - 1];
    const [x1, y1] = CURVE[i];
    if (accuracy <= x1) {
      const t = (accuracy - x0) / (x1 - x0);
      return Math.round((y0 + t * (y1 - y0)) / 50) * 50;
    }
  }
  return CURVE[CURVE.length - 1][1];
}

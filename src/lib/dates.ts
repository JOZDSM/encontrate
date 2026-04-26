/** Parse YYYY-MM-DD as UTC date-only (noon UTC avoids DST edge cases in storage). */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Half-open overlap: [aStart, aEnd) vs [bStart, bEnd) */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

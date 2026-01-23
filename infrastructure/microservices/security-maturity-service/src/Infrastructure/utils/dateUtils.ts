export function isValidDate(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

export function diffMinutesNonNegative(later: Date, earlier: Date): number | null {
  if (!isValidDate(later) || !isValidDate(earlier)) return null;
  const ms = later.getTime() - earlier.getTime();
  if (ms < 0) return null;
  return ms / 60000;
}

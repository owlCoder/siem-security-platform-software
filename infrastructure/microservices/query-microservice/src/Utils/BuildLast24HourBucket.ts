import { floorToHour } from "./FloorToHour";

export function buildLast24HourBuckets(now: Date = new Date()): Date[] {
  const endHour = floorToHour(now);
  const startHour = new Date(endHour.getTime() - 23 * 60 * 60 * 1000);

  const buckets: Date[] = [];
  for (let i = 0; i < 24; i++) {
    buckets.push(new Date(startHour.getTime() + i * 60 * 60 * 1000));
  }
  return buckets;
}
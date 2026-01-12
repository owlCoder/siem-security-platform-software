export function formatHourHH(date: Date): string {
  return String(date.getHours()).padStart(2, "0");
}
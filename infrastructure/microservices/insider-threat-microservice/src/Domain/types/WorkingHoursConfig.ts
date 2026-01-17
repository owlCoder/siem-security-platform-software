export type WorkingHoursConfig = {
  startHour: number;  // 0-23
  endHour: number;    // 0-23
  workingDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
}
import { ScoreInput } from "../Domain/types/ScoreInput";

function limitValue(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateScore(input: ScoreInput): number {
  const { mttdMinutes, mttrMinutes, falseAlarmRate, totalAlerts } = input;

  const normalizedMTTD =
    mttdMinutes === null ? 0.5 : limitValue(1 - mttdMinutes / 120);

  const normalizedMTTR =
    mttrMinutes === null ? 0.5 : limitValue(1 - mttrMinutes / 240);

  const normalizedFalseAlarm = limitValue(1 - falseAlarmRate);

  const noramlizedVolume = limitValue(Math.log10(totalAlerts + 1) / 2);

  const score =
    normalizedMTTD * 30 +
    normalizedMTTR * 30 +
    normalizedFalseAlarm * 25 +
    noramlizedVolume * 15;

  return Math.round(score);
}

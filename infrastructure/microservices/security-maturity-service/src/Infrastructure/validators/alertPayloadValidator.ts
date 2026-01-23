import { AlertPayloadDto } from "../../Domain/types/AlertPayloadDto";

export function validateAlertPayloadDto(payload: AlertPayloadDto): string[] {
  const errors: string[] = [];

  if (payload.id === null || payload.id === undefined) errors.push("id missing");
  if (!payload.createdAt) errors.push("createdAt missing");

  if (!payload.oldestCorrelatedEventAt) errors.push("oldestCorrelatedEventAt missing");
  if (!payload.category || payload.category.trim().length === 0) errors.push("category missing/empty");

  if (payload.isFalseAlarm === null || payload.isFalseAlarm === undefined) errors.push("isFalseAlarm missing");

  return errors;
}

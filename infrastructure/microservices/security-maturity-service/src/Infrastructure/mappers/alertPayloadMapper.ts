import { AlertPayloadDto } from "../../Domain/types/AlertPayloadDto";
import { AlertForKpi } from "../../Domain/types/AlertForKpi";
import { isValidDate } from "../utils/dateUtils";
import { validateAlertPayloadDto } from "../validators/alertPayloadValidator";
import { parseAlertCategory } from "../clients/parseAlertCategory";

export function mapAlertPayloadToDomain(payload: AlertPayloadDto, log?: (msg: string, meta?: unknown) => void): AlertForKpi | null {
  const errs = validateAlertPayloadDto(payload);
  if (errs.length > 0) {
    log?.("[KpiSnapshotService] Alert payload contract violation", { id: payload.id, errs });
    return null;
  }

  const createdAt = new Date(payload.createdAt);
  if (!isValidDate(createdAt)) {
    log?.("[KpiSnapshotService] Invalid createdAt for alert", { id: payload.id, createdAt: payload.createdAt });
    return null;
  }

  const resolvedAt = payload.resolvedAt ? new Date(payload.resolvedAt) : null;
  if (resolvedAt && !isValidDate(resolvedAt)) {
    log?.("[KpiSnapshotService] Invalid resolvedAt for alert", { id: payload.id, resolvedAt: payload.resolvedAt });
    return null;
  }

  const oldest = new Date(payload.oldestCorrelatedEventAt);
  if (!isValidDate(oldest)) {
    log?.("[KpiSnapshotService] Invalid oldestCorrelatedEventAt for alert", { id: payload.id, oldest: payload.oldestCorrelatedEventAt });
    return null;
  }
  const category = parseAlertCategory(payload.category);

  return {
    id: payload.id,
    createdAt,
    resolvedAt,
    oldestCorrelatedEventAt: oldest,
    category,
    isFalseAlarm: payload.isFalseAlarm,
  };
}

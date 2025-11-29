import { AlertStatus } from "../enums/AlertStatus";

export interface ResolveAlertDTO {
  resolvedBy: string;
  status: AlertStatus;
}

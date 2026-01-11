import { AlertStatus } from "../../../enums/AlertStatus";
import { AlertDTO } from "../../../models/alerts/AlertDTO";

export interface RecentAlertsTableProps {
  alerts: AlertDTO[];
  onSelectAlert: (id: number) => void;
  onResolve: (id: number, resolvedBy: string) => void;
  onUpdateStatus: (id: number, status: AlertStatus) => void; 
}
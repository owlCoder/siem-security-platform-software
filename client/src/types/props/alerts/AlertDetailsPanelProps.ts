import { AlertDTO } from "../../../models/alerts/AlertDTO";

export interface AlertDetailsPanelProps {
  alert: AlertDTO;
  onClose: () => void;
  onResolve: (id: number, resolvedBy: string) => void;
}
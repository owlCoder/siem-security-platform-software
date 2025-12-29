import { AlertDTO } from "../../../models/alerts/AlertDTO";

export interface AlertToastProps {
  alert: AlertDTO;
  onClose: () => void;
  onViewDetails?: (id: number) => void;
}
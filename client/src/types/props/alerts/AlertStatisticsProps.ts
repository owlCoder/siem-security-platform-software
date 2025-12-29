import { AlertDTO } from "../../../models/alerts/AlertDTO";

export interface AlertStatisticsProps {
  alerts: AlertDTO[];
  lastAlertTime: string;
}
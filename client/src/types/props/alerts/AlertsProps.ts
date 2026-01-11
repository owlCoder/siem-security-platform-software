import { IAlertAPI } from "../../../api/alerts/IAlertAPI";
import { DesktopNotificationService } from "../../../services/DesktopNotificationService";

export interface AlertsProps{
  alertsApi:IAlertAPI;
  desktopNotification:DesktopNotificationService;
}

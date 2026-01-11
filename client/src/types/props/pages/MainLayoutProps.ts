import { IAlertAPI } from "../../../api/alerts/IAlertAPI";
import { IParserAPI } from "../../../api/parser/IParserAPI";
import { IQueryAPI } from "../../../api/query/IQueryAPI";
import { IStorageAPI } from "../../../api/storage/IStorageAPI";
import { DesktopNotificationService } from "../../../services/DesktopNotificationService";

export interface MainLayoutProps {
    alertsAPI: IAlertAPI;
    parserAPI: IParserAPI;
    queryAPI: IQueryAPI;
    storageAPI: IStorageAPI;
    desktopNotification:DesktopNotificationService;
}
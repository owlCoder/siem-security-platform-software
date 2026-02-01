import { IAlertAPI } from "../../../api/alerts/IAlertAPI";
import { IParserAPI } from "../../../api/parser/IParserAPI";
import { IQueryAPI } from "../../../api/query/IQueryAPI";
import { IStorageAPI } from "../../../api/storage/IStorageAPI";
import { ISimulatorAPI } from "../../../api/simulator/ISimulatorAPI";
import { DesktopNotificationService } from "../../../services/DesktopNotificationService";
import { IRiskScoreAPI } from "../../../api/risk-score/IRiskScoreAPI";
import { IFirewallAPI } from "../../../api/firewall/IFirewallAPI";
import { IBackupValidationAPI } from "../../../api/backup/IBackupValdationAPI";
import { IIntegrityAPI } from "../../../api/integrity/IIntegrityAPI";
import { IInsiderThreatAPI } from "../../../api/insider-threat/IInsiderThreatAPI";

export interface MainLayoutProps {
    alertsAPI: IAlertAPI;
    parserAPI: IParserAPI;
    queryAPI: IQueryAPI;
    storageAPI: IStorageAPI;
    simulatorAPI: ISimulatorAPI;
    desktopNotification: DesktopNotificationService;
    riskScoreApi: IRiskScoreAPI;
    firewallApi: IFirewallAPI;
    backupApi: IBackupValidationAPI;
    integrityApi: IIntegrityAPI;
}

import { ISecurityMaturityAPI } from "../../../api/security-maturity/ISecurityMaturityAPI";

export interface MainLayoutProps {
  alertsAPI: IAlertAPI;
  parserAPI: IParserAPI;
  queryAPI: IQueryAPI;
  storageAPI: IStorageAPI;
  simulatorAPI: ISimulatorAPI;
  desktopNotification: DesktopNotificationService;
  riskScoreApi: IRiskScoreAPI;
  firewallApi: IFirewallAPI;
  backupApi: IBackupValidationAPI;
  insiderThreatApi: IInsiderThreatAPI;
  securityMaturityApi: ISecurityMaturityAPI;
  integrityApi: IIntegrityAPI;
}

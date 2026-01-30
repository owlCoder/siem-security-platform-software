import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import MainLayout from "./pages/MainLayout";
import { IAlertAPI } from "./api/alerts/IAlertAPI";
import { AlertAPI } from "./api/alerts/AlertAPI";
import { IParserAPI } from "./api/parser/IParserAPI";
import { ParserAPI } from "./api/parser/ParserAPI";
import { IQueryAPI } from "./api/query/IQueryAPI";
import { QueryAPI } from "./api/query/QueryAPI";
import { IStorageAPI } from "./api/storage/IStorageAPI";
import { StorageAPI } from "./api/storage/StorageAPI";
import { DesktopNotificationService } from "./services/DesktopNotificationService";
import { ISimulatorAPI } from "./api/simulator/ISimulatorAPI";
import { SimulatorAPI } from "./api/simulator/SimulatorAPI";
import { IRiskScoreAPI } from "./api/risk-score/IRiskScoreAPI";
import { RiskScoreAPI } from "./api/risk-score/RiskScoreAPI";
import { IFirewallAPI } from "./api/firewall/IFirewallAPI";
import { FirewallAPI } from "./api/firewall/FirewallAPI";
import { IBackupValidationAPI } from "./api/backup/IBackupValdationAPI";
import { BackupValidationAPI } from "./api/backup/BackupValidationAPI";
import { IInsiderThreatAPI } from "./api/insider-threat/IInsiderThreatAPI";
import { InsiderThreatAPI } from "./api/insider-threat/InsiderThreatAPI";
import { ISecurityMaturityAPI } from "./api/security-maturity/ISecurityMaturityAPI";
import { SecurityMaturityAPI } from "./api/security-maturity/SecurityMaturityAPI";

const auth_api: IAuthAPI = new AuthAPI();
const alerts_api: IAlertAPI = new AlertAPI();
const parser_api: IParserAPI = new ParserAPI();
const query_api: IQueryAPI = new QueryAPI();
const storage_api: IStorageAPI = new StorageAPI();
const simulator_api: ISimulatorAPI = new SimulatorAPI();
const desktopNotification = new DesktopNotificationService();
const risk_score_api: IRiskScoreAPI = new RiskScoreAPI();
const firewall_api: IFirewallAPI = new FirewallAPI();
const backup_api: IBackupValidationAPI = new BackupValidationAPI();
const insider_threat_api: IInsiderThreatAPI = new InsiderThreatAPI(); 
const securityMaturityApi: ISecurityMaturityAPI = new SecurityMaturityAPI();

function App() {
  return (
    <>
      <Routes>
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin,seller">
              <DashboardPage userAPI={user_api} anotherAPI={API} />
            </ProtectedRoute>
          }
        /> */}
        <Route path="/" element={<AuthPage authAPI={auth_api} />} />

        {/* Temporary unprotected route — should require authentication */}
        <Route path="/mainLayout" element={<MainLayout alertsAPI={alerts_api}
          parserAPI={parser_api} queryAPI={query_api} storageAPI={storage_api}
          simulatorAPI={simulator_api} desktopNotification={desktopNotification}
          riskScoreApi={risk_score_api} firewallApi={firewall_api} backupApi={backup_api} 
          insiderThreatApi={insider_threat_api} securityMaturityApi={securityMaturityApi}/>} />
      </Routes>
    </>
  );
}

export default App;
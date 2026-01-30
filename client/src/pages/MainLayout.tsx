import { useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import Dashboard from '../components/views/Dashboard';
import Events from '../components/views/Events';
import Statistics from '../components/views/Statistics';
import Storage from '../components/views/Storage';
import Alerts from '../components/views/Alerts';
import Simulator from '../components/views/Simulator';
import InsiderThreats from '../components/views/InsiderThreats';
import { MainLayoutProps } from '../types/props/pages/MainLayoutProps';
import RiskScore from '../components/views/RiskScore';
import Firewall from '../components/views/Firewall';
import Backup from '../components/views/Backup';
import SecurityMaturity from '../components/views/SecurityMaturity';

export default function MainLayout({
  alertsAPI,
  parserAPI,
  queryAPI,
  storageAPI,
  simulatorAPI,
  insiderThreatApi, 
  desktopNotification,
  riskScoreApi,
  firewallApi,
  backupApi,
  securityMaturityApi
}: MainLayoutProps) {  
  const [sideMenuPage, setSideMenuPage] = useState<number>(0);

  return (
    <div className="flex fixed top-10 left-0 right-5 bottom-10 gap-4">
      <Sidebar setSideMenuPage={setSideMenuPage} />

      <div className="flex-1 p-4 bg-[#202020] h-full overflow-y-scroll">
        {sideMenuPage === 0 && (
          <Dashboard queryApi={queryAPI} storageApi={storageAPI} />
        )}
        {sideMenuPage === 1 && (
          <Events queryApi={queryAPI} parserApi={parserAPI} />
        )}
        {sideMenuPage === 2 && (
          <Statistics queryApi={queryAPI} storageApi={storageAPI} />
        )}
        {sideMenuPage === 3 && <Storage storageApi={storageAPI} />}
        {sideMenuPage === 4 && (
          <Alerts
            alertsApi={alertsAPI}
            desktopNotification={desktopNotification}
          />
        )}
        {sideMenuPage === 5 && (
          <Simulator simulatorApi={simulatorAPI} />
        )}
        {sideMenuPage === 6 && (
          <InsiderThreats insiderThreatApi={insiderThreatApi} />
        )}
        {sideMenuPage === 7 && (
          <RiskScore riskScoreApi={riskScoreApi} queryApi={queryAPI} />
        )}
        {sideMenuPage === 8 && (
          <Firewall firewallApi={firewallApi} />
        )}
        {sideMenuPage === 9 && (
          <Backup backupApi={backupApi}/>
        )}
        {sideMenuPage === 10 && (
          <SecurityMaturity securityMaturityApi={securityMaturityApi}/>
        )}
      </div>
    </div>
  );
}

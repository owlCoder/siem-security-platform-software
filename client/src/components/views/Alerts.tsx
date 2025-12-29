import { useState, useEffect } from "react";
import { useAlerts } from "../../hooks/useAlerts";
import { AlertStatistics } from "../alerts/AlertStatistics";
import { AlertFilters } from "../alerts/AlertFilters";
import RecentAlertsTable from "../tables/RecentAlertsTable";
import { AlertQueryDTO } from "../../models/alerts/AlertQueryDTO";
import AlertDetailsPanel from "../alerts/AlertDetailsPanel";
import AlertToast from "../alerts/AlertToast";
import { Pagination } from "../common/Pagination";
import { AlertSSEService } from "../../services/AlertSSEService";
import { DesktopNotificationService } from "../../services/DesktopNotificationService";
import { useAuth } from "../../hooks/useAuthHook";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertsProps } from "../../types/props/alerts/AlertsProps";

const desktopNotification = new DesktopNotificationService();

export default function Alerts({alertsApi}:AlertsProps) {
  const { token } = useAuth();
  const { 
    alerts, 
    isLoading, 
    pagination,
    searchAlerts, 
    resolveAlert, 
    updateStatus, 
    addAlert, 
    updateAlert 
  } = useAlerts(alertsApi);
  
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [toastAlert, setToastAlert] = useState<AlertDTO | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<AlertQueryDTO>({ page: 1, limit: 10 });

    /*const testAlerts: AlertDTO[] = [
    {
      id: 1,
      title: "Database Connection Lost",
      description: "Cannot reach database.",
      severity: AlertSeverity.CRITICAL,
      status: AlertStatus.ACTIVE,
      correlatedEvents: [],
      source: "Database",
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
    },
    {
      id: 2,
      title: "Multiple Login Failures",
      description: "User attempted 5 wrong passwords.",
      severity: AlertSeverity.HIGH,
      status: AlertStatus.INVESTIGATING,
      correlatedEvents: [],
      source: "Auth Service",
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
    },
    {
      id: 3,
      title: "New User Signup",
      description: "User registered successfully.",
      severity: AlertSeverity.LOW,
      status: AlertStatus.RESOLVED,
      correlatedEvents: [],
      source: "Auth Service",
      createdAt: new Date(),
      resolvedAt: new Date(),
      resolvedBy: "admin",
    },
  ]; TEST*/

  //const activeAlerts = testAlerts; TEST


  // Request desktop notification permission on mount
  useEffect(() => {
    desktopNotification.requestPermission().then((granted) => {
      if (granted) {
        console.log("Desktop notifications enabled");
      } else {
        console.warn("Desktop notifications denied");
      }
    });
  }, []);

  // Initialize SSE connection
  useEffect(() => {
    if (!token) return;

    const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
    const service = new AlertSSEService(gatewayUrl);

    // Register callbacks
    service.onNewAlert((alert) => {
      console.log("🆕 New alert received:", alert);
      addAlert(alert);
      setToastAlert(alert);
      
      // Show desktop notification for critical/high alerts
      desktopNotification.showAlertNotification(alert, () => {
        setSelectedAlertId(alert.id);
      });
    });

    service.onAlertUpdate((alert, updateType) => {
      console.log(`🔄 Alert updated (${updateType}):`, alert);
      updateAlert(alert);
    });

    service.onConnectionStatus((connected) => {
      console.log(`📡 SSE connection status: ${connected ? "Connected" : "Disconnected"}`);
      setSseConnected(connected);
    });

    service.onError((error) => {
      console.error("❌ SSE error:", error);
    });

    service.connect();

    // Cleanup on unmount
    return () => {
      service.disconnect();
    };
  }, [token]);

  const handleSearch = (query: AlertQueryDTO) => {
    const fullQuery = { ...query, page: 1 };
    setCurrentQuery(fullQuery);
    searchAlerts(fullQuery);
  };

  const handlePageChange = (page: number) => {
    const newQuery = { ...currentQuery, page };
    setCurrentQuery(newQuery);
    searchAlerts(newQuery);
  };

  const handlePageSizeChange = (limit: number) => {
    const newQuery = { ...currentQuery, page: 1, limit };
    setCurrentQuery(newQuery);
    searchAlerts(newQuery);
  };

  const handleSelectAlert = (id: number) => {
    setSelectedAlertId(id);
  };

  const handleCloseDetails = () => {
    setSelectedAlertId(null);
  };

  const handleResolve = async (id: number, resolvedBy: string) => {
    await resolveAlert(id, resolvedBy, "RESOLVED");
    setSelectedAlertId(null);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await updateStatus(id, status);
  };

  const handleCloseToast = () => {
    setToastAlert(null);
  };

  const handleViewDetailsFromToast = (id: number) => {
    setSelectedAlertId(id);
    setToastAlert(null);
  };

  const lastAlert = alerts.length > 0 ? alerts[0] : null;
  //const lastAlert = activeAlerts.length > 0 ? activeAlerts[0] : null; // NEW - TEST

  const lastAlertTime = lastAlert
    ? new Date(lastAlert.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : "--:--";

  const selectedAlert = selectedAlertId 
    ? alerts.find(a => a.id === selectedAlertId) || null
    : null;
  
    /*const selectedAlert = selectedAlertId
    ? activeAlerts.find(a => a.id === selectedAlertId) || null
    : null; // NEW - TEST */

  return (
  <>
    <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-6! relative">
      <div className="flex justify-between items-center mb-[24px]!">
        <h2 className="m-0">Alert Dashboard</h2>
        
        <div className="flex items-center gap-4">
          {/* SSE STATUS */}
          <div className={`flex items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold
            ${sseConnected
              ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
              : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${sseConnected ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"}`}
            ></div>
            {sseConnected ? "Live Updates Active" : "Connecting..."}
          </div>

          {/* DESKTOP NOTIFICATIONS */}
          {desktopNotification.canShowNotifications() && (
            <div className="flex items-center gap-2 rounded-[8px] border border-[rgba(96,165,250,0.3)] bg-[rgba(96,165,250,0.15)] px-3! py-1.5! text-[12px] text-[#60a5fa]">
              🔔 Desktop Notifications Enabled
            </div>
          )}
        </div>
      </div>

      <AlertStatistics alerts={alerts} lastAlertTime={lastAlertTime} />
      <AlertFilters onSearch={handleSearch} />
      
      {isLoading && (
        <div className="text-center p-10">
          <div className="spinner"></div>
        </div>
      )}

      {!isLoading && (
        <>
          <RecentAlertsTable
            alerts={alerts}
            onSelectAlert={handleSelectAlert}
            onResolve={handleResolve}
            onUpdateStatus={handleUpdateStatus}
          />

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              totalItems={pagination.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}

      {selectedAlert && (
        <AlertDetailsPanel
          alert={selectedAlert}
          onClose={handleCloseDetails}
          onResolve={handleResolve}
        />
      )}

      {toastAlert && (
        <AlertToast
          alert={toastAlert}
          onClose={handleCloseToast}
          onViewDetails={handleViewDetailsFromToast}
        />
      )}
    </div>
  </>
);
}
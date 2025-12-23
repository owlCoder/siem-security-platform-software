import { useState, useEffect } from "react";
import { AlertAPI } from "../../api/alerts/AlertAPI";
import { useAlerts } from "../../hooks/useAlerts";
import { AlertStatistics } from "../alerts/AlertStatistics";
import { AlertFilters } from "../alerts/AlertFilters";
import RecentAlertsTable from "../tables/RecentAlertsTable";
import { AlertQueryDTO } from "../../models/alerts/AlertQueryDTO";
import AlertDetailsPanel from "../alerts/AlertDetailsPanel";
import AlertToast from "../alerts/AlertToast";
import { useAuth } from "../../hooks/useAuthHook";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertSSEService } from "../../services/AlertSSEService";

const alertAPI = new AlertAPI();

export default function Alerts() {
  const { token } = useAuth();
  const { alerts, isLoading, searchAlerts, resolveAlert, updateStatus, addAlert, updateAlert } = useAlerts(alertAPI);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [toastAlert, setToastAlert] = useState<AlertDTO | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

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

  // Initialize SSE connection
  useEffect(() => {
    if (!token) return;

    const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
    const service = new AlertSSEService(gatewayUrl);

    // Register callbacks
    service.onNewAlert((alert) => {
      console.log("New alert received:", alert);
      addAlert(alert);
      setToastAlert(alert);
    });

    service.onAlertUpdate((alert, updateType) => {
      console.log(`Alert updated (${updateType}):`, alert);
      updateAlert(alert);
    });

    service.onConnectionStatus((connected) => {
      console.log(`SSE connection status: ${connected ? "Connected" : "Disconnected"}`);
      setSseConnected(connected);
    });

    service.onError((error) => {
      console.error("SSE error:", error);
    });

    service.connect();

    // Cleanup on unmount
    return () => {
      service.disconnect();
    };
  }, [token]);

  const handleSearch = (query: AlertQueryDTO) => {
    searchAlerts(query);
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

  {/*const selectedAlert = selectedAlertId
    ? activeAlerts.find(a => a.id === selectedAlertId) || null
    : null; // NEW - TEST */}

  return (
    <>
      {/*<style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style> it should work without*/}

      <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-6! relative">
        <div className="flex justify-between items-center mb-[24px]!">
          <h2 className="m-0">Alert Dashboard</h2>

          <div className={`flex items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold
    ${sseConnected
              ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
              : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${sseConnected ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"
                }`}
            ></div>
            {sseConnected ? "Live Updates Active" : "Connecting..."}
          </div>
        </div>

        <AlertStatistics alerts={alerts} lastAlertTime={lastAlertTime} />
        {/* <AlertStatistics alerts={activeAlerts} lastAlertTime={lastAlertTime} /> {/* NEW - TEST */}

        <AlertFilters onSearch={handleSearch} />

        {isLoading && (
          <div className="text-center p-10">
            <div className="spinner"></div>
          </div>
        )}

        <RecentAlertsTable
          alerts={alerts}
          onSelectAlert={handleSelectAlert}
          onResolve={handleResolve}
          onUpdateStatus={handleUpdateStatus}
        />

        {/*<RecentAlertsTable
          alerts={activeAlerts}
          onSelectAlert={handleSelectAlert}
          onResolve={handleResolve}
          onUpdateStatus={handleUpdateStatus}
        /> {/* NEW - TEST*/}


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

import { useState, useEffect } from "react";
import { useAlerts } from "../../hooks/useAlerts";
import AlertStatistics from "../alerts/AlertStatistics";
import AlertFilters from "../alerts/AlertFilters";
import RecentAlertsTable from "../tables/alerts/RecentAlertsTable";
import { AlertQueryDTO } from "../../models/alerts/AlertQueryDTO";
import AlertDetailsPanel from "../alerts/AlertDetailsPanel";
import AlertToast from "../alerts/AlertToast";
import Pagination from "../common/Pagination";
import { AlertSSEService } from "../../services/AlertSSEService";
import { useAuth } from "../../hooks/useAuthHook";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertsProps } from "../../types/props/alerts/AlertsProps";



export default function Alerts({ alertsApi, desktopNotification }: AlertsProps) {
  const { token } = useAuth();
  const {
    alerts,
    isLoading,
    pagination,
    searchAlerts,
    resolveAlert,
    updateStatus,
    addAlert,
    updateAlert,
  } = useAlerts(alertsApi);

  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [toastAlert, setToastAlert] = useState<AlertDTO | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<AlertQueryDTO>({ page: 1, limit: 10 });


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
      addAlert(alert);
      setToastAlert(alert);

      // Show desktop notification for critical/high alerts
      desktopNotification.showAlertNotification(alert, () => {
        setSelectedAlertId(alert.id);
      });
    });

    service.onAlertUpdate((alert) => {
      updateAlert(alert);
    });

    service.onConnectionStatus((connected) => {
      setSseConnected(connected);
    });

    service.onError((error) => {
      console.error(" SSE error:", error);
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
    await resolveAlert(id, resolvedBy, AlertStatus.RESOLVED);
    setSelectedAlertId(null);
  };

  const handleUpdateStatus = (id: number, status: AlertStatus) => {
    updateStatus(id, status);
  };

  const handleCloseToast = () => {
    setToastAlert(null);
  };

  const handleViewDetailsFromToast = (id: number) => {
    setSelectedAlertId(id);
    setToastAlert(null);
  };

  const lastAlert = alerts.length > 0 ? alerts[0] : null;
  const lastAlertTime = lastAlert
    ? new Date(lastAlert.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "No alerts";

  const selectedAlert = selectedAlertId
    ? alerts.find((a) => a.id === selectedAlertId) || null
    : null;

  return (
    <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-6! relative">
      <div className="flex justify-between items-center mb-[24px]!">
        <h2 className="m-0">Alert Dashboard</h2>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-9.5! py-1.5! rounded-[8px] text-[12px] font-semibold ${sseConnected
                ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
                : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${sseConnected ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"
                }`}
            ></div>
            {sseConnected ? "Live Updates Active" : "Connecting..."}
          </div>
          {desktopNotification.canShowNotifications() && (
            <div className="flex items-center gap-2 rounded-[8px] border border-[rgba(96,165,250,0.3)] bg-[rgba(96,165,250,0.15)] px-6.5! py-1.5! text-[12px] text-[#60a5fa]">
              Notifications Enabled
            </div>
          )}
        </div>
      </div>

      <AlertStatistics alerts={alerts} lastAlertTime={lastAlertTime} />
      <AlertFilters onSearch={handleSearch} />

      {isLoading && (
        <div className="text-center p-10">
          <div className="spinner"></div>
          <p className="text-gray-400 mt-4">Loading alerts...</p>
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
  );
}
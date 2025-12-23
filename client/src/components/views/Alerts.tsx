import React, { useState, useEffect } from "react";
import { AlertAPI } from "../../api/alerts/AlertAPI";
import { useAlerts } from "../../hooks/useAlerts";
import { AlertStatistics } from "../alerts/AlertStatistics";
import { AlertFilters } from "../alerts/AlertFilters";
import RecentAlertsTable from "../tables/RecentAlertsTable";
import { AlertQueryDTO } from "../../models/alerts/AlertQueryDTO";
import AlertDetailsPanel from "../alerts/AlertDetailsPanel";
import AlertToast from "../alerts/AlertToast";
import { AlertSSEService } from "../../services/AlertSSEService";
import { useAuth } from "../../hooks/useAuthHook";
import { AlertDTO } from "../../models/alerts/AlertDTO";

const alertAPI = new AlertAPI();

export default function Alerts() {
  const { token } = useAuth();
  const { alerts, isLoading, searchAlerts, resolveAlert, updateStatus, addAlert, updateAlert } = useAlerts(alertAPI);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [toastAlert, setToastAlert] = useState<AlertDTO | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

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
  const lastAlertTime = lastAlert 
    ? new Date(lastAlert.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : "--:--";

  const selectedAlert = selectedAlertId 
    ? alerts.find(a => a.id === selectedAlertId) || null
    : null;

  const containerStyle: React.CSSProperties = {
    border: "2px solid #282A28",
    backgroundColor: "transparent",
    borderRadius: "14px",
    padding: "24px",
    position: "relative"
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  };

  const connectionIndicatorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    background: sseConnected ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
    color: sseConnected ? "#4ade80" : "#f87171",
    border: `1px solid ${sseConnected ? "rgba(74, 222, 128, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
  };

  const indicatorDotStyle: React.CSSProperties = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: sseConnected ? "#4ade80" : "#f87171",
    animation: sseConnected ? "pulse 2s infinite" : "none",
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, color: "#fff" }}>Alert Dashboard</h2>
          
          <div style={connectionIndicatorStyle}>
            <div style={indicatorDotStyle}></div>
            {sseConnected ? "Live Updates Active" : "Connecting..."}
          </div>
        </div>

        <AlertStatistics alerts={alerts} lastAlertTime={lastAlertTime} />
        <AlertFilters onSearch={handleSearch} />

        {isLoading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner"></div>
          </div>
        )}

        {!isLoading && (
          <RecentAlertsTable 
            alerts={alerts}
            onSelectAlert={handleSelectAlert}
            onResolve={handleResolve}
            onUpdateStatus={handleUpdateStatus}
          />
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

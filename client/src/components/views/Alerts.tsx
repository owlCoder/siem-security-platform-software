import { useState, useEffect } from "react";
import AlertStatistics from "../alerts/AlertStatistics";
import AlertFilters from "../alerts/AlertFilters";
import RecentAlertsTable from "../tables/alerts/RecentAlertsTable";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../../models/alerts/AlertQueryDTO";
import AlertDetailsPanel from "../alerts/AlertDetailsPanel";
import Pagination from "../common/Pagination";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertSeverity } from "../../enums/AlertSeverity";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertsProps } from "../../types/props/alerts/AlertsProps";
import { useAuth } from "../../hooks/useAuthHook";

export default function Alerts({ alertsApi }: AlertsProps) {
  const { token } = useAuth();

  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [severity, setSeverity] = useState<AlertSeverity | "all">("all");
  const [status, setStatus] = useState<AlertStatus | "all">("all");
  const [source, setSource] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [sortBy, setSortBy] = useState<'createdAt' | 'severity' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const totalPages = Math.ceil(totalItems / pageSize);

  // Sortiraj alerts lokalno
  const sortedAlerts = [...alerts].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'severity') {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };
      comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    }

    return sortOrder === 'ASC' ? comparison : -comparison;
  });

  const loadAlertsWithQuery = async (
    targetPage: number = 1,
    currentLimit: number = pageSize,
    queryOverride?: AlertQueryDTO
  ) => {
    if (!token) {
      console.error("No auth token available.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Koristi queryOverride ako postoji, inače state
      const querySeverity = queryOverride?.severity ?? severity;
      const queryStatus = queryOverride?.status ?? status;
      const querySource = queryOverride?.source ?? source;
      const queryStartDate = queryOverride?.startDate ?? startDate;
      const queryEndDate = queryOverride?.endDate ?? endDate;

      const query: AlertQueryDTO = {
        page: targetPage,
        limit: currentLimit,
      };

      // Dodaj opcione parametre ako postoje
      if (querySeverity && querySeverity !== "all") {
        query.severity = querySeverity;
      }
      if (queryStatus && queryStatus !== "all") {
        query.status = queryStatus;
      }
      if (querySource && querySource.trim() !== "") {
        query.source = querySource;
      }
      if (queryStartDate) {
        query.startDate = queryStartDate;
      }
      if (queryEndDate) {
        query.endDate = queryEndDate;
      }

      const response: PaginatedAlertsDTO = await alertsApi.searchAlerts(query, token);

      setAlerts(response.data);
      setTotalItems(response.pagination.total);
      setPage(response.pagination.page);
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError("Failed to load alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void loadAlertsWithQuery(1);
  }, [token]);

  const handleSearch = (query: AlertQueryDTO) => {
    setSeverity(query.severity || "all");
    setStatus(query.status || "all");
    setSource(query.source || "");
    setStartDate(query.startDate);
    setEndDate(query.endDate);
    if (query.sortBy) setSortBy(query.sortBy);
    if (query.sortOrder) setSortOrder(query.sortOrder);
    loadAlertsWithQuery(1, pageSize, query);
  };

  const handleSort = (column: 'createdAt' | 'severity' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  const handleSelectAlert = (id: number) => {
    setSelectedAlertId(id);
  };

  const handleCloseDetails = () => {
    setSelectedAlertId(null);
  };

  const handleResolve = async (id: number, resolvedBy: string, markedFalse: boolean) => {
    try {
      await alertsApi.resolveAlert(id, resolvedBy, markedFalse ? "true" : "false", token!);

      // Update local state
      setAlerts(prev => prev.map(a =>
        a.id === id
          ? { ...a, status: markedFalse ? AlertStatus.MARKED_FALSE : AlertStatus.RESOLVED }
          : a
      ));

      setSelectedAlertId(null);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: AlertStatus) => {
    try {
      await alertsApi.updateAlertStatus(id, newStatus, token!);

      // Update local state
      setAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const lastAlert = alerts.length > 0 ? alerts[0] : null;
  const lastAlertTime = lastAlert
    ? new Date(lastAlert.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "No alerts";

  const selectedAlert = selectedAlertId
    ? alerts.find((a) => a.id === selectedAlertId) || null
    : null;

  return (
    <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-3! relative">
      <div className="flex justify-between items-center mb-[24px]!">
        <h2 className="m-0">Alert Dashboard</h2>
        <div className="flex items-center gap-3">
          <div
            className={`flex w-[150px]! items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold ${!isLoading
              ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
              : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${!isLoading ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"
                }`}
            ></div>
            {!isLoading ? "Live Updates Active" : "Connecting..."}
          </div>
        </div>
      </div>

      <AlertStatistics alerts={alerts} lastAlertTime={lastAlertTime} />
      <AlertFilters
        onSearch={handleSearch}
        severity={severity}
        status={status}
        searchText={source}
      />

      {error && !isLoading && (
        <div className="text-red-400 text-[14px] ml-1! mb-3">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center p-10">
          <div className="spinner"></div>
          <p className="text-gray-400 mt-4">Loading alerts...</p>
        </div>
      )}

      {!isLoading && alerts.length === 0 && (
        <div className="text-center p-10 text-gray-400">No alerts found</div>
      )}

      {!isLoading && alerts.length > 0 && (
        <RecentAlertsTable
          alerts={sortedAlerts}
          onSelectAlert={handleSelectAlert}
          onUpdateStatus={handleUpdateStatus}
          onResolve={handleResolve}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(newPage) => loadAlertsWithQuery(newPage, pageSize)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          loadAlertsWithQuery(1, newSize);
        }}
      />

      {selectedAlert && (
        <AlertDetailsPanel
          alert={selectedAlert}
          onClose={handleCloseDetails}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { IAlertAPI } from "../api/alerts/IAlertAPI";
import { AlertDTO } from "../models/alerts/AlertDTO";
import { AlertQueryDTO } from "../models/alerts/AlertQueryDTO";
import { useAuth } from "./useAuthHook";

export const useAlerts = (alertAPI: IAlertAPI) => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load - fetch all alerts
  useEffect(() => {
    if (token) {
      loadAlerts();
    }
  }, [token]);

  const loadAlerts = async () => {
    //if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await alertAPI.getAllAlerts(token!);
      setAlerts(data);
    } catch (err) {
      setError("Failed to load alerts");
      console.error("Error loading alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAlerts = async (query: AlertQueryDTO) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await alertAPI.searchAlerts(query, token);
      setAlerts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to search alerts");
      console.error("Error searching alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = async (id: number, resolvedBy: string, status: string) => {
    if (!token) return;

    try {
      const updatedAlert = await alertAPI.resolveAlert(id, resolvedBy, status, token!);

      // Update local state
      setAlerts(prev =>
        prev.map(alert => alert.id === id ? updatedAlert : alert)
      );
    } catch (err) {
      setError("Failed to resolve alert");
      console.error("Error resolving alert:", err);
      throw err;
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;

    try {
      const updatedAlert = await alertAPI.updateAlertStatus(id, status, token);

      // Update local state
      setAlerts(prev =>
        prev.map(alert => alert.id === id ? updatedAlert : alert)
      );
    } catch (err) {
      setError("Failed to update alert status");
      console.error("Error updating alert status:", err);
      throw err;
    }
  };

  // Method to add new alert (for SSE)
  const addAlert = (alert: AlertDTO) => {
    setAlerts(prev => [alert, ...prev]);
  };

  // Method to update existing alert (for SSE)
  const updateAlert = (updatedAlert: AlertDTO) => {
    setAlerts(prev =>
      prev.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert)
    );
  };

  // Pagination state
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  return {
    alerts,
    isLoading,
    error,
    pagination,
    searchAlerts,
    resolveAlert,
    updateStatus,
    loadAlerts,
    addAlert,
    updateAlert
  };
};
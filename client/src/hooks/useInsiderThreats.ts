import { useState, useEffect, useCallback } from "react";
import { IInsiderThreatAPI } from "../api/insider-threat/IInsiderThreatAPI";
import { InsiderThreatDTO } from "../models/insider-threat/InsiderThreatDTO";
import { UserRiskProfileDTO } from "../models/insider-threat/UserRiskProfileDTO";
import { ThreatQueryDTO } from "../models/insider-threat/ThreatQueryDTO";
import { useAuth } from "./useAuthHook";

export const useInsiderThreats = (insiderThreatAPI: IInsiderThreatAPI) => {
  const { token: authToken } = useAuth(); 
    const getToken = useCallback(() => {
    const token = authToken || localStorage.getItem("token");
    console.log("[useInsiderThreats]  Token source:", authToken ? "useAuth" : "localStorage");
    console.log("[useInsiderThreats]  Token value:", token ? token.substring(0, 20) + "..." : "MISSING");
    return token;
  }, [authToken]);
  
  const [threats, setThreats] = useState<InsiderThreatDTO[]>([]);
  const [userRiskProfiles, setUserRiskProfiles] = useState<UserRiskProfileDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const loadThreats = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      console.error("[useInsiderThreats]  No token available - cannot load threats");
      setError("Authentication required");
      return;
    }
    
    console.log("[useInsiderThreats]  Loading threats...");
    setIsLoading(true);
    setError(null);
    try {
      const data = await insiderThreatAPI.getAllThreats(token);
      setThreats(data);
    } catch (err) {
      setError("Failed to load insider threats");
      console.error("Error loading threats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, insiderThreatAPI]);

  const loadUserRiskProfiles = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      console.error("[useInsiderThreats]  No token available - cannot load user risk profiles");
      return;
    }
    
    console.log("[useInsiderThreats]  Loading user risk profiles...");
    
    try {
      const data = await insiderThreatAPI.getAllUserRiskProfiles(token);
      setUserRiskProfiles(data);
    } catch (err: any) {
      console.error("[useInsiderThreats]  Error loading user risk profiles:", err);
    }
  }, [getToken, insiderThreatAPI]);

  useEffect(() => {
    const token = getToken();
    
    if (token) {
      loadThreats();
      loadUserRiskProfiles();
    } else {
      console.warn("[useInsiderThreats]  No token - skipping initial load");
    }
  }, [authToken, loadThreats, loadUserRiskProfiles, getToken]);

  const searchThreats = useCallback(async (query: ThreatQueryDTO) => {
    const token = getToken();
    if (!token) {
      setError("Authentication required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await insiderThreatAPI.searchThreats(query, token);
      setThreats(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to search threats");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, insiderThreatAPI]);

  const resolveThreat = useCallback(async (id: number, resolvedBy: string, resolutionNotes?: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }    
    try {
      const updatedThreat = await insiderThreatAPI.resolveThreat(id, resolvedBy, resolutionNotes, token);
      
      setThreats(prev =>
        prev.map(threat => threat.id === id ? updatedThreat : threat)
      );
    } catch (err) {
      setError("Failed to resolve threat");
      throw err;
    }
  }, [getToken, insiderThreatAPI]);

  const getHighRiskUsers = useCallback(async (): Promise<UserRiskProfileDTO[]> => {
    const token = getToken();
    if (!token) return [];
    try {
      const result = await insiderThreatAPI.getHighRiskUsers(token);
      return result;
    } catch (err: any) {
      console.error("[useInsiderThreats]  Error fetching high-risk users:", err);
      return [];
    }
  }, [getToken, insiderThreatAPI]);

  const getUserRiskAnalysis = useCallback(async (userId: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
        try {
      return await insiderThreatAPI.getUserRiskAnalysis(userId, token);
    } catch (err) {
      console.error("Error fetching user risk analysis:", err);
      throw err;
    }
  }, [getToken, insiderThreatAPI]);

  return {
    threats,
    userRiskProfiles,
    isLoading,
    error,
    pagination,
    searchThreats,
    resolveThreat,
    loadThreats,
    loadUserRiskProfiles,
    getHighRiskUsers,
    getUserRiskAnalysis
  };
};
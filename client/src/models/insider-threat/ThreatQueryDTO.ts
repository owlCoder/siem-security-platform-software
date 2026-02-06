import { InsiderThreatDTO } from "./InsiderThreatDTO";

export interface ThreatQueryDTO {
  page?: number;
  limit?: number;
  userId?: number;
  threatType?: "MASS_DATA_READ" | "PERMISSION_CHANGE" | "OFF_HOURS_ACCESS" | "SUSPICIOUS_LOGIN" | "DATA_EXFILTRATION";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate?: Date;
  endDate?: Date;
  isResolved?: boolean;
  sortBy?: 'detectedAt' | 'riskLevel' | 'userId';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedThreatsDTO {
  data: InsiderThreatDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
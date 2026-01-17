
import { RiskLevel } from "../enums/RiskLevel";
import { ThreatType } from "../enums/ThreatType";
import { InsiderThreatDTO } from "./InsiderThreatDTO";

export interface ThreatQueryDTO {
  page?: number;
  limit?: number;
  userId?: string;
  threatType?: ThreatType;
  riskLevel?: RiskLevel;
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
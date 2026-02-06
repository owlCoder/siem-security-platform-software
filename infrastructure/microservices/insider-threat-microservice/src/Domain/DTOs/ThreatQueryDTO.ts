import { ThreatType } from "../enums/ThreatType";
import { RiskLevel } from "../enums/RiskLevel";
import { InsiderThreatDTO } from "./InsiderThreatDTO";

export type ThreatQueryDTO = {
  page?: number;
  limit?: number;
  userId?: number; 
  threatType?: ThreatType;
  riskLevel?: RiskLevel;
  startDate?: Date;
  endDate?: Date;
  isResolved?: boolean;
  sortBy?: 'detectedAt' | 'riskLevel' | 'threatType';
  sortOrder?: 'ASC' | 'DESC';
}

export type PaginatedThreatsDTO = {
  data: InsiderThreatDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
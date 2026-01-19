import { RiskEntityType } from "../enums/RiskEntityType";

export interface SecurityMetricsDTO {
  entityType: RiskEntityType;
  entityId: string;

  totalEventCount: number;
  errorEventCount: number;
  eventRate: number;

  alertsBySeverity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };

  anomalyRate: number;
  burstAnomaly: boolean;

  uniqueServiceCount?: number; 
  uniqueIpCount?: number;      

  createdAt: Date;
  riskScore: number;
}

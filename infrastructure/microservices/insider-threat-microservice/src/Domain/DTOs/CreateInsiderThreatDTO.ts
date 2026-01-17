import { RiskLevel } from "../enums/RiskLevel";
import { ThreatType } from "../enums/ThreatType";



export interface CreateInsiderThreatDTO {
  userId: string;
  username: string;
  threatType: ThreatType;
  riskLevel: RiskLevel;
  description: string;
  metadata?: Record<string, any>;
  correlatedEventIds: number[];
  ipAddress?: string;
  source: string;
}
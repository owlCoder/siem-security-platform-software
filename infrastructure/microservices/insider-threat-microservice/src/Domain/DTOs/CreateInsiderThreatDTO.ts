import { ThreatType } from "../enums/ThreatType";
import { RiskLevel } from "../enums/RiskLevel";
export type CreateInsiderThreatDTO = {
  userId: number;
  threatType: ThreatType;
  riskLevel: RiskLevel;
  description: string;
  metadata?: Record<string, any>;
  correlatedEventIds: number[];
  ipAddress?: string;
  source: string;
}
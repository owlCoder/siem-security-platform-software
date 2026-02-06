import { RiskLevel } from "../enums/RiskLevel";
import { ThreatType } from "../enums/ThreatType";


export type InsiderThreatDTO = {
  id: number;
  userId: number; 
  threatType: ThreatType;
  riskLevel: RiskLevel;
  description: string;
  metadata: Record<string, any> | null;
  correlatedEventIds: number[];
  ipAddress: string | null;
  source: string;
  detectedAt: Date;
  isResolved: boolean;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
}
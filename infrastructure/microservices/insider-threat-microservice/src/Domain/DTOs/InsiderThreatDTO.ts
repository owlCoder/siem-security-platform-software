import { RiskLevel } from "../enums/RiskLevel";
import { ThreatType } from "../enums/ThreatType";



export interface InsiderThreatDTO {
  id: number;
  userId: string;
  username: string;
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
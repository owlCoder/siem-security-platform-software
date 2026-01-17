import { ThreatType } from "../enums/ThreatType";
import { RiskLevel } from "../enums/RiskLevel";

export type DetectionResult = {
  isDetected: boolean;
  threatType: ThreatType;
  riskLevel: RiskLevel;
  description: string;
  metadata?: Record<string, any>;
  correlatedEventIds: number[];
}
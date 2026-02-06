import { RiskLevel } from "../enums/RiskLevel";

export type UserRiskProfileDTO = {
  id: number;
  userId: number;  
  riskScore: number;
  currentRiskLevel: RiskLevel;
  totalThreatsDetected: number;
  criticalThreatsCount: number;
  highThreatsCount: number;
  mediumThreatsCount: number;
  lowThreatsCount: number;
  lastThreatDetectedAt: Date | null;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  recentActivities: Array<{
    threatType: string;
    detectedAt: Date;
    riskLevel: string;
  }> | null;
  updatedAt: Date;
}
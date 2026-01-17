import { RiskLevel } from "../enums/RiskLevel";



export interface UserRiskProfileDTO {
  id: number;
  userId: string;
  username: string;
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
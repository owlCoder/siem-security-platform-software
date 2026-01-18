export interface UserRiskProfileDTO {
  id: number;
  userId: string;
  username: string;
  riskScore: number;
  currentRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
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
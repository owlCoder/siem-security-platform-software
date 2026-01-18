export interface UserRiskAnalysisDTO {
  userId: string;
  username: string;
  currentRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskScore: number;
  threatsSummary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentThreats: Array<{
    id: number;
    threatType: string;
    riskLevel: string;
    detectedAt: Date;
    description: string;
  }>;
  behaviorPatterns: {
    offHoursAccesses: number;
    massDataReads: number;
    permissionChanges: number;
    failedLogins: number;
  };
  recommendation: string;
}
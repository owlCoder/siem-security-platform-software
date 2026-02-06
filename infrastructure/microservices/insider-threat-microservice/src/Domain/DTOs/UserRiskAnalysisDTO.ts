import { RiskLevel } from "../enums/RiskLevel";


export type UserRiskAnalysisDTO = {
  userId: number;
  currentRiskLevel: RiskLevel;
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
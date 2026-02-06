import { UserRiskProfile } from "../../Domain/models/UserRiskProfile";
import { UserRiskProfileDTO } from "../../Domain/DTOs/UserRiskProfileDTO";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

export function toUserRiskProfileDTO(profile: UserRiskProfile): UserRiskProfileDTO {
  return {
    id: profile.id,
    userId: profile.userId,
    riskScore: profile.riskScore,
    currentRiskLevel: profile.currentRiskLevel,
    totalThreatsDetected: profile.totalThreatsDetected,
    criticalThreatsCount: profile.criticalThreatsCount,
    highThreatsCount: profile.highThreatsCount,
    mediumThreatsCount: profile.mediumThreatsCount,
    lowThreatsCount: profile.lowThreatsCount,
    lastThreatDetectedAt: profile.lastThreatDetectedAt,
    lastLoginAt: profile.lastLoginAt,
    failedLoginAttempts: profile.failedLoginAttempts,
    recentActivities: profile.recentActivities,
    updatedAt: profile.updatedAt
  };
}

export function createEmptyUserRiskProfileDTO(): UserRiskProfileDTO {
  return {
    id: -1,
    userId: -1,
    riskScore: 0,
    currentRiskLevel: RiskLevel.LOW,
    totalThreatsDetected: 0,
    criticalThreatsCount: 0,
    highThreatsCount: 0,
    mediumThreatsCount: 0,
    lowThreatsCount: 0,
    lastThreatDetectedAt: null,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    recentActivities: null,
    updatedAt: new Date()
  };
}
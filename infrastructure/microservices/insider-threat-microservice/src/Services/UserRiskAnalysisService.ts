import { IUserRiskAnalysisService } from "../Domain/services/IUserRiskAnalysisService";
import { IUserRiskRepositoryService } from "../Domain/services/IUserRiskRepositoryService";
import { IInsiderThreatRepositoryService } from "../Domain/services/IInsiderThreatRepositoryService";
import { UserRiskProfile } from "../Domain/models/UserRiskProfile";
import { UserRiskAnalysisDTO } from "../Domain/DTOs/UserRiskAnalysisDTO";
import { UserRiskProfileDTO } from "../Domain/DTOs/UserRiskProfileDTO";
import { RiskLevel } from "../Domain/enums/RiskLevel";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { toUserRiskProfileDTO } from "../Utils/Converters/UserRiskProfileConverter";
export class UserRiskAnalysisService implements IUserRiskAnalysisService {
  constructor(
    private readonly riskRepository: IUserRiskRepositoryService,
    private readonly threatRepository: IInsiderThreatRepositoryService,
    private readonly logger: ILoggerService
  ) {}

  async updateUserRiskAfterThreat(userId: number, threatId: number): Promise<UserRiskProfile> {
    let profile = await this.riskRepository.findByUserId(userId);
    
    if (!profile) {
      profile = await this.riskRepository.create({
        userId,
        riskScore: 0,
        currentRiskLevel: RiskLevel.LOW,
        totalThreatsDetected: 0,
        criticalThreatsCount: 0,
        highThreatsCount: 0,
        mediumThreatsCount: 0,
        lowThreatsCount: 0,
        failedLoginAttempts: 0,
        lastThreatDetectedAt: null,
        lastLoginAt: null,
        recentActivities: []
      });
    }

    const threat = await this.threatRepository.findById(threatId);
    if (!threat) {
      throw new Error(`Threat ${threatId} not found`);
    }

    profile.totalThreatsDetected++;
    
    switch (threat.riskLevel) {
      case RiskLevel.CRITICAL:
        profile.criticalThreatsCount++;
        profile.riskScore += 50;
        break;
      case RiskLevel.HIGH:
        profile.highThreatsCount++;
        profile.riskScore += 30;
        break;
      case RiskLevel.MEDIUM:
        profile.mediumThreatsCount++;
        profile.riskScore += 15;
        break;
      case RiskLevel.LOW:
        profile.lowThreatsCount++;
        profile.riskScore += 5;
        break;
    }

    profile.currentRiskLevel = this.calculateRiskLevel(profile.riskScore);
    profile.lastThreatDetectedAt = threat.detectedAt;

    if (!profile.recentActivities) {
      profile.recentActivities = [];
    }
    profile.recentActivities.unshift({
      threatType: threat.threatType,
      detectedAt: threat.detectedAt,
      riskLevel: threat.riskLevel
    });
    
    if (profile.recentActivities.length > 10) {
      profile.recentActivities = profile.recentActivities.slice(0, 10);
    }

    return await this.riskRepository.update(profile.id, profile);
  }

  async getUserRiskAnalysis(userId: number): Promise<UserRiskAnalysisDTO> {
    const profile = await this.riskRepository.findByUserId(userId);
    
    if (!profile) {
      throw new Error(`User risk profile not found for userId: ${userId}`);
    }

    const allThreats = await this.threatRepository.findByUserId(userId);
    const recentThreats = allThreats
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        threatType: t.threatType,
        riskLevel: t.riskLevel,
        detectedAt: t.detectedAt,
        description: t.description
      }));

    const behaviorPatterns = {
      offHoursAccesses: allThreats.filter(t => t.threatType === "OFF_HOURS_ACCESS").length,
      massDataReads: allThreats.filter(t => t.threatType === "MASS_DATA_READ").length,
      permissionChanges: allThreats.filter(t => t.threatType === "PERMISSION_CHANGE").length,
      failedLogins: profile.failedLoginAttempts
    };

    const recommendation = this.generateRecommendation(profile, behaviorPatterns);

    return {
      userId: profile.userId,
      currentRiskLevel: profile.currentRiskLevel,
      riskScore: profile.riskScore,
      threatsSummary: {
        total: profile.totalThreatsDetected,
        critical: profile.criticalThreatsCount,
        high: profile.highThreatsCount,
        medium: profile.mediumThreatsCount,
        low: profile.lowThreatsCount
      },
      recentThreats,
      behaviorPatterns,
      recommendation
    };
  }

  async recalculateUserRisk(userId: number): Promise<UserRiskProfile> {
    const threats = await this.threatRepository.findByUserId(userId);
    
    let profile = await this.riskRepository.findByUserId(userId);
    
    if (!profile) {
      profile = await this.riskRepository.create({
        userId,
        riskScore: 0,
        currentRiskLevel: RiskLevel.LOW,
        totalThreatsDetected: 0,
        criticalThreatsCount: 0,
        highThreatsCount: 0,
        mediumThreatsCount: 0,
        lowThreatsCount: 0,
        failedLoginAttempts: 0,
        lastThreatDetectedAt: null,
        lastLoginAt: null,
        recentActivities: []
      });
    }

    profile.riskScore = 0;
    profile.totalThreatsDetected = threats.length;
    profile.criticalThreatsCount = 0;
    profile.highThreatsCount = 0;
    profile.mediumThreatsCount = 0;
    profile.lowThreatsCount = 0;

    threats.forEach(threat => {
      switch (threat.riskLevel) {
        case RiskLevel.CRITICAL:
          profile!.criticalThreatsCount++;
          profile!.riskScore += 50;
          break;
        case RiskLevel.HIGH:
          profile!.highThreatsCount++;
          profile!.riskScore += 30;
          break;
        case RiskLevel.MEDIUM:
          profile!.mediumThreatsCount++;
          profile!.riskScore += 15;
          break;
        case RiskLevel.LOW:
          profile!.lowThreatsCount++;
          profile!.riskScore += 5;
          break;
      }
    });

    profile.currentRiskLevel = this.calculateRiskLevel(profile.riskScore);
    
    if (threats.length > 0) {
      const latest = threats.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())[0];
      profile.lastThreatDetectedAt = latest.detectedAt;
    }

    return await this.riskRepository.update(profile.id, profile);
  }

  async getHighRiskUsers(): Promise<UserRiskProfile[]> {
    return await this.riskRepository.findHighRiskUsers();
  }

  async getAllUserRiskProfiles(): Promise<UserRiskProfileDTO[]> {
    const profiles = await this.riskRepository.findAll();
    return profiles.map(profile => toUserRiskProfileDTO(profile));
  }

  async getUserRiskProfile(userId: number): Promise<UserRiskProfileDTO | null> {
    const profile = await this.riskRepository.findByUserId(userId);
    
    if (!profile) {
      return null;
    }
    
    return toUserRiskProfileDTO(profile);
  }

  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= 100) return RiskLevel.CRITICAL;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 30) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private generateRecommendation(
    profile: UserRiskProfile,
    patterns: { 
      offHoursAccesses: number; 
      massDataReads: number; 
      permissionChanges: number; 
      failedLogins: number 
    }
  ): string {
    const recommendations: string[] = [];

    if (profile.currentRiskLevel === RiskLevel.CRITICAL) {
      recommendations.push("CRITICAL: Immediate investigation required!");
    }

    if (patterns.offHoursAccesses > 3) {
      recommendations.push("Multiple off-hours accesses detected - review access patterns");
    }

    if (patterns.massDataReads > 2) {
      recommendations.push("Unusual data access volume - potential data exfiltration risk");
    }

    if (patterns.permissionChanges > 2) {
      recommendations.push("Multiple permission changes - audit recent role modifications");
    }

    if (patterns.failedLogins > 5) {
      recommendations.push("Multiple failed login attempts - possible credential compromise");
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue monitoring user activity");
    }

    return recommendations.join("; ");
  }
}
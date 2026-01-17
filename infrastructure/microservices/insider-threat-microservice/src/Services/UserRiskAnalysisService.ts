import { UserRiskProfileDTO } from "../Domain/DTOs/UserRiskProfileDTO";
import { UserRiskAnalysisDTO } from "../Domain/DTOs/UserRiskAnalysisDTO";
import { IUserRiskAnalysisService } from "../Domain/services/IUserRiskAnalysisService";
import { IUserRiskRepositoryService } from "../Domain/services/IUserRiskRepositoryService";
import { IInsiderThreatRepositoryService } from "../Domain/services/IInsiderThreatRepositoryService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { RiskLevel } from "../Domain/enums/RiskLevel";
import { ThreatType } from "../Domain/enums/ThreatType";
import { toUserRiskProfileDTO, createEmptyUserRiskProfileDTO } from "../Utils/Converters/UserRiskProfileConverter";
import { calculateRiskScore, determineRiskLevel } from "../Utils/Analyzers/RiskScoreCalculator";

export class UserRiskAnalysisService implements IUserRiskAnalysisService {
  constructor(
    private userRiskRepo: IUserRiskRepositoryService,
    private threatRepo: IInsiderThreatRepositoryService,
    private readonly logger: ILoggerService
  ) {}

  async getUserRiskProfile(userId: string): Promise<UserRiskProfileDTO> {
    const profile = await this.userRiskRepo.findByUserId(userId);
    
    if (!profile) {
      await this.logger.log(`User risk profile for ${userId} not found`);
      return createEmptyUserRiskProfileDTO();
    }
    
    return toUserRiskProfileDTO(profile);
  }

  async getAllUserRiskProfiles(): Promise<UserRiskProfileDTO[]> {
    const profiles = await this.userRiskRepo.findAll();
    return profiles.map(p => toUserRiskProfileDTO(p));
  }

  async getHighRiskUsers(): Promise<UserRiskProfileDTO[]> {
    const profiles = await this.userRiskRepo.findHighRiskUsers(70);
    return profiles.map(p => toUserRiskProfileDTO(p));
  }

  async getUserRiskAnalysis(userId: string): Promise<UserRiskAnalysisDTO> {
    const profile = await this.userRiskRepo.findByUserId(userId);
    
    if (!profile) {
      throw new Error(`User risk profile for ${userId} not found`);
    }

    const allThreats = await this.threatRepo.findByUserId(userId);
    const recentThreats = allThreats.slice(0, 10);

    const offHoursCount = await this.threatRepo.countByUserIdAndType(userId, ThreatType.OFF_HOURS_ACCESS);
    const massDataCount = await this.threatRepo.countByUserIdAndType(userId, ThreatType.MASS_DATA_READ);
    const permissionCount = await this.threatRepo.countByUserIdAndType(userId, ThreatType.PERMISSION_CHANGE);

    let recommendation = "User behavior is within acceptable parameters.";
    
    if (profile.currentRiskLevel === RiskLevel.CRITICAL) {
      recommendation = "CRITICAL: Immediate security review required. Consider temporary access suspension.";
    } else if (profile.currentRiskLevel === RiskLevel.HIGH) {
      recommendation = "HIGH RISK: Schedule security interview and review access privileges.";
    } else if (profile.currentRiskLevel === RiskLevel.MEDIUM) {
      recommendation = "MEDIUM RISK: Monitor user activity closely and conduct periodic reviews.";
    }

    return {
      userId: profile.userId,
      username: profile.username,
      currentRiskLevel: profile.currentRiskLevel,
      riskScore: profile.riskScore,
      threatsSummary: {
        total: profile.totalThreatsDetected,
        critical: profile.criticalThreatsCount,
        high: profile.highThreatsCount,
        medium: profile.mediumThreatsCount,
        low: profile.lowThreatsCount
      },
      recentThreats: recentThreats.map(t => ({
        id: t.id,
        threatType: t.threatType,
        riskLevel: t.riskLevel,
        detectedAt: t.detectedAt,
        description: t.description
      })),
      behaviorPatterns: {
        offHoursAccesses: offHoursCount,
        massDataReads: massDataCount,
        permissionChanges: permissionCount,
        failedLogins: profile.failedLoginAttempts
      },
      recommendation
    };
  }

  async updateUserRiskAfterThreat(userId: string, username: string, threatId: number): Promise<void> {
    let profile = await this.userRiskRepo.findByUserId(userId);

    if (!profile) {
      profile = await this.userRiskRepo.create({
        userId,
        username,
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
        recentActivities: []
      });
      await this.logger.log(`Created new risk profile for user ${userId}`);
    }

    const threat = await this.threatRepo.findById(threatId);
    if (!threat) return;

    profile.totalThreatsDetected++;
    profile.lastThreatDetectedAt = threat.detectedAt;

    switch (threat.riskLevel) {
      case RiskLevel.CRITICAL:
        profile.criticalThreatsCount++;
        break;
      case RiskLevel.HIGH:
        profile.highThreatsCount++;
        break;
      case RiskLevel.MEDIUM:
        profile.mediumThreatsCount++;
        break;
      case RiskLevel.LOW:
        profile.lowThreatsCount++;
        break;
    }

    const recentActivities = profile.recentActivities || [];
    recentActivities.unshift({
      threatType: threat.threatType,
      detectedAt: threat.detectedAt,
      riskLevel: threat.riskLevel
    });
    profile.recentActivities = recentActivities.slice(0, 20);

    profile.riskScore = calculateRiskScore(profile);
    profile.currentRiskLevel = determineRiskLevel(profile.riskScore);

    await this.userRiskRepo.save(profile);
    await this.logger.log(`Updated risk profile for user ${userId} - New score: ${profile.riskScore}, Level: ${profile.currentRiskLevel}`);
  }

  async updateUserLoginInfo(userId: string, username: string, isSuccessful: boolean): Promise<void> {
    let profile = await this.userRiskRepo.findByUserId(userId);

    if (!profile) {
      profile = await this.userRiskRepo.create({
        userId,
        username,
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
        recentActivities: []
      });
    }

    if (isSuccessful) {
      profile.lastLoginAt = new Date();
      profile.failedLoginAttempts = 0;
    } else {
      profile.failedLoginAttempts++;
    }

    profile.riskScore = calculateRiskScore(profile);
    profile.currentRiskLevel = determineRiskLevel(profile.riskScore);

    await this.userRiskRepo.save(profile);
    await this.logger.log(`Updated login info for user ${userId} - Successful: ${isSuccessful}`);
  }

  async recalculateUserRisk(userId: string): Promise<UserRiskProfileDTO> {
    const profile = await this.userRiskRepo.findByUserId(userId);
    
    if (!profile) {
      throw new Error(`User risk profile for ${userId} not found`);
    }

    profile.riskScore = calculateRiskScore(profile);
    profile.currentRiskLevel = determineRiskLevel(profile.riskScore);

    const updated = await this.userRiskRepo.save(profile);
    await this.logger.log(`Recalculated risk for user ${userId} - Score: ${profile.riskScore}`);

    return toUserRiskProfileDTO(updated);
  }
}
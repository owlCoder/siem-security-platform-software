import { DetectionResult } from "../Domain/types/DetectionResult";
import { IThreatDetectionService } from "../Domain/services/IThreatDetectionService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { ThreatType } from "../Domain/enums/ThreatType";
import { RiskLevel } from "../Domain/enums/RiskLevel";
import { detectMassDataRead } from "../Utils/Detectors/MassDataReadDetector";
import { detectPermissionChange } from "../Utils/Detectors/PermissionChangeDetector";
import { detectOffHoursAccess } from "../Utils/Detectors/OffHoursAccessDetector";
import { correlateAuthEvents } from "../Utils/Analyzers/AuthEventCorrelator";

export class ThreatDetectionService implements IThreatDetectionService {
  constructor(private readonly logger: ILoggerService) {}

  async analyzeEvents(eventIds: number[]): Promise<DetectionResult[]> {
    await this.logger.log(`Analyzing ${eventIds.length} events for insider threats`);
    
   
    return [];
  }

  async detectMassDataRead(userId: string, eventIds: number[]): Promise<DetectionResult | null> {
    await this.logger.log(`Checking for mass data read by user ${userId}`);
    
    // Pozivamo helper funkciju iz Utils/Detectors
    const result = await detectMassDataRead(userId, eventIds);
    
    if (result) {
      await this.logger.log(`Mass data read detected for user ${userId}`);
    }
    
    return result;
  }

  async detectPermissionChange(userId: string, eventIds: number[]): Promise<DetectionResult | null> {
    await this.logger.log(`Checking for permission changes by user ${userId}`);
    
    const result = await detectPermissionChange(userId, eventIds);
    
    if (result) {
      await this.logger.log(`Suspicious permission change detected for user ${userId}`);
    }
    
    return result;
  }

  async detectOffHoursAccess(userId: string, eventIds: number[]): Promise<DetectionResult | null> {
    await this.logger.log(`Checking for off-hours access by user ${userId}`);
    
    const result = await detectOffHoursAccess(userId, eventIds);
    
    if (result) {
      await this.logger.log(`Off-hours access detected for user ${userId}`);
    }
    
    return result;
  }

  async correlateWithAuthEvents(userId: string, eventIds: number[]): Promise<DetectionResult[]> {
    await this.logger.log(`Correlating events with auth data for user ${userId}`);
    
    const results = await correlateAuthEvents(userId, eventIds);
    
    if (results.length > 0) {
      await this.logger.log(`Found ${results.length} correlations with auth events for user ${userId}`);
    }
    
    return results;
  }
}
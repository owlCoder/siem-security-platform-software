import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";
import { WorkingHoursConfig } from "../../Domain/types/WorkingHoursConfig";

// Podrazumevano radno vreme: 8:00 - 18:00, ponedeljak-petak
const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  startHour: 8,
  endHour: 18,
  workingDays: [1, 2, 3, 4, 5] // Monday to Friday
};

export async function detectOffHoursAccess(
  userId: string,
  eventIds: number[]
): Promise<DetectionResult | null> {
  
  
  const offHoursAccessCount = eventIds.length;
  
  if (offHoursAccessCount === 0) {
    return null;
  }

  let riskLevel: RiskLevel;
  let description: string;

  if (offHoursAccessCount >= 20) {
    riskLevel = RiskLevel.CRITICAL;
    description = `CRITICAL: User ${userId} accessed system ${offHoursAccessCount} times outside working hours. Highly suspicious behavior.`;
  } else if (offHoursAccessCount >= 10) {
    riskLevel = RiskLevel.HIGH;
    description = `HIGH RISK: User ${userId} accessed system ${offHoursAccessCount} times outside working hours. Investigation required.`;
  } else if (offHoursAccessCount >= 5) {
    riskLevel = RiskLevel.MEDIUM;
    description = `MEDIUM RISK: User ${userId} accessed system ${offHoursAccessCount} times outside working hours. Monitor activity.`;
  } else {
    riskLevel = RiskLevel.LOW;
    description = `LOW RISK: User ${userId} accessed system ${offHoursAccessCount} times outside working hours.`;
  }

  return {
    isDetected: true,
    threatType: ThreatType.OFF_HOURS_ACCESS,
    riskLevel,
    description,
    metadata: {
      accessCount: offHoursAccessCount,
      workingHours: DEFAULT_WORKING_HOURS,
      analysisTime: new Date().toISOString()
    },
    correlatedEventIds: eventIds
  };
}

export function isWithinWorkingHours(
  timestamp: Date, 
  config: WorkingHoursConfig = DEFAULT_WORKING_HOURS
): boolean {
  const hour = timestamp.getHours();
  const day = timestamp.getDay();

  const isWorkingDay = config.workingDays.includes(day);
  const isWorkingHour = hour >= config.startHour && hour < config.endHour;

  return isWorkingDay && isWorkingHour;
}
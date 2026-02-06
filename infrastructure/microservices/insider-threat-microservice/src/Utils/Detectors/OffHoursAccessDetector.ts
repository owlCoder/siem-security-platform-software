import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";
import { Event } from "../../Domain/services/IEventFetcherService";
import { WorkingHoursConfig } from "../../Domain/types/WorkingHoursConfig";

const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  startHour: 8,
  endHour: 18,
  workingDays: [1, 2, 3, 4, 5]  
};

export async function detectOffHoursAccess(
  userId: number,
  events: Event[]
): Promise<DetectionResult | null> {
  
  const offHoursEvents = events.filter(event => {
    const timestamp = new Date(event.timestamp);
    const hour = timestamp.getHours();
    const day = timestamp.getDay();  

    const isWeekend = (day === 0 || day === 6);
    const isNightTime = (hour < DEFAULT_WORKING_HOURS.startHour || hour >= DEFAULT_WORKING_HOURS.endHour);

    return isWeekend || isNightTime;
  });

  const offHoursAccessCount = offHoursEvents.length;
  
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
      analysisTime: new Date().toISOString(),
      sampleTimestamps: offHoursEvents.slice(0, 5).map(e => ({
        time: e.timestamp.toISOString(),
        hour: e.timestamp.getHours(),
        day: e.timestamp.getDay()
      }))
    },
    correlatedEventIds: offHoursEvents.map(e => e.id)
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
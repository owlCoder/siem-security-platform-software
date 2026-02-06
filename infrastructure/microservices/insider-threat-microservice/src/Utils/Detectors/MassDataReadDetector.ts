import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";
import { Event } from "../../Domain/services/IEventFetcherService";

const MASS_READ_THRESHOLD = {
  CRITICAL: 1000,
  HIGH: 500,
  MEDIUM: 200,
  LOW: 100
};

export async function detectMassDataRead(
  userId: number,
  events: Event[]
): Promise<DetectionResult | null> {
  
  const readEvents = events.filter(event => {
    const desc = event.description.toLowerCase();
    const isReadOperation = 
      desc.includes('accessed file') ||
      desc.includes('read') ||
      desc.includes('download') ||
      desc.includes('export') ||
      desc.includes('viewed');
    
    const isNotPermission = !desc.includes('permission') && !desc.includes('privilege');
    const isNotLogin = !desc.includes('login') && !desc.includes('logout');
    
    return isReadOperation && isNotPermission && isNotLogin;
  });

  const readCount = readEvents.length;
  
  if (readCount < MASS_READ_THRESHOLD.LOW) {
    return null;
  }

  let riskLevel: RiskLevel;
  let description: string;

  if (readCount >= MASS_READ_THRESHOLD.CRITICAL) {
    riskLevel = RiskLevel.CRITICAL;
    description = `CRITICAL: User ${userId} performed ${readCount} data read operations in short timeframe. Possible data exfiltration attempt.`;
  } else if (readCount >= MASS_READ_THRESHOLD.HIGH) {
    riskLevel = RiskLevel.HIGH;
    description = `HIGH RISK: User ${userId} performed ${readCount} data read operations. Unusual activity detected.`;
  } else if (readCount >= MASS_READ_THRESHOLD.MEDIUM) {
    riskLevel = RiskLevel.MEDIUM;
    description = `MEDIUM RISK: User ${userId} performed ${readCount} data read operations. Monitor closely.`;
  } else {
    riskLevel = RiskLevel.LOW;
    description = `LOW RISK: User ${userId} performed ${readCount} data read operations. Slightly elevated activity.`;
  }

  return {
    isDetected: true,
    threatType: ThreatType.MASS_DATA_READ,
    riskLevel,
    description,
    metadata: {
      readCount,
      threshold: MASS_READ_THRESHOLD,
      analysisTime: new Date().toISOString(),
      sampleFiles: readEvents.slice(0, 5).map(e => e.description)
    },
    correlatedEventIds: readEvents.map(e => e.id)
  };
}
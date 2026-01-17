import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

// Pragovi za detekciju masovnog čitanja
const MASS_READ_THRESHOLD = {
  CRITICAL: 1000,  // 1000+ read operacija u kratkom periodu
  HIGH: 500,
  MEDIUM: 200,
  LOW: 100
};

export async function detectMassDataRead(
  userId: string, 
  eventIds: number[]
): Promise<DetectionResult | null> {
  // Ovde bi trebalo fetchovati događaje i analizirati ih
  // Za sada simuliramo detekciju
  
  const readCount = eventIds.length;
  
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
      analysisTime: new Date().toISOString()
    },
    correlatedEventIds: eventIds
  };
}
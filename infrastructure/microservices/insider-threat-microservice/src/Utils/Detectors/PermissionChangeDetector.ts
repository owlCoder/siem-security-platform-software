import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

// Pragovi za detekciju neuobičajenih promena dozvola
const PERMISSION_CHANGE_THRESHOLD = {
  CRITICAL: 10,  // 10+ promena dozvola
  HIGH: 5,
  MEDIUM: 3,
  LOW: 2
};

export async function detectPermissionChange(
  userId: string,
  eventIds: number[]
): Promise<DetectionResult | null> {
  
  
  const permissionChangeCount = eventIds.length;
  
  if (permissionChangeCount < PERMISSION_CHANGE_THRESHOLD.LOW) {
    return null;
  }

  let riskLevel: RiskLevel;
  let description: string;

  if (permissionChangeCount >= PERMISSION_CHANGE_THRESHOLD.CRITICAL) {
    riskLevel = RiskLevel.CRITICAL;
    description = `CRITICAL: User ${userId} made ${permissionChangeCount} permission changes. Possible privilege escalation attack.`;
  } else if (permissionChangeCount >= PERMISSION_CHANGE_THRESHOLD.HIGH) {
    riskLevel = RiskLevel.HIGH;
    description = `HIGH RISK: User ${userId} made ${permissionChangeCount} permission changes. Unusual administrative activity.`;
  } else if (permissionChangeCount >= PERMISSION_CHANGE_THRESHOLD.MEDIUM) {
    riskLevel = RiskLevel.MEDIUM;
    description = `MEDIUM RISK: User ${userId} made ${permissionChangeCount} permission changes. Review required.`;
  } else {
    riskLevel = RiskLevel.LOW;
    description = `LOW RISK: User ${userId} made ${permissionChangeCount} permission changes. Slightly elevated activity.`;
  }

  return {
    isDetected: true,
    threatType: ThreatType.PERMISSION_CHANGE,
    riskLevel,
    description,
    metadata: {
      changeCount: permissionChangeCount,
      threshold: PERMISSION_CHANGE_THRESHOLD,
      analysisTime: new Date().toISOString()
    },
    correlatedEventIds: eventIds
  };
}
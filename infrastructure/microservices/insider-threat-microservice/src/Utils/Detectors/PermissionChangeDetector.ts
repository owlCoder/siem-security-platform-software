import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";
import { Event } from "../../Domain/services/IEventFetcherService";

const PERMISSION_CHANGE_THRESHOLD = {
  CRITICAL: 10,
  HIGH: 5,
  MEDIUM: 3,
  LOW: 2
};

export async function detectPermissionChange(
  userId: number,
  events: Event[]
): Promise<DetectionResult | null> {
  
  const permissionEvents = events.filter(event => {
    const desc = event.description.toLowerCase();
    const type = event.type.toUpperCase();
    
    const isPermissionChange = 
      desc.includes('permission') ||
      desc.includes('privilege') ||
      desc.includes('access') && desc.includes('granted') ||
      desc.includes('elevated') ||
      desc.includes('role') && desc.includes('changed') ||
      desc.includes('admin access');
    
    const isAdminOperation = type === 'WARNING' || type === 'INFO';
    
    return isPermissionChange && isAdminOperation;
  });

  const permissionChangeCount = permissionEvents.length;
  
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
      analysisTime: new Date().toISOString(),
      sampleChanges: permissionEvents.slice(0, 5).map(e => ({
        description: e.description,
        timestamp: e.timestamp.toISOString()
      }))
    },
    correlatedEventIds: permissionEvents.map(e => e.id)
  };
}
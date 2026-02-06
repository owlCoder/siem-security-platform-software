import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";
import { Event } from "../../Domain/services/IEventFetcherService";
export async function correlateAuthEvents(
  userId: number,
  events: Event[]
): Promise<DetectionResult[]> {
  
  const detections: DetectionResult[] = [];

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const failedLogins = sortedEvents.filter(e => {
    const desc = e.description.toLowerCase();
    const type = e.type.toUpperCase();
    return (
      (desc.includes('failed login') || desc.includes('login failed') || desc.includes('authentication failed')) &&
      (type === 'ERROR' || type === 'WARNING')
    );
  });

  const successfulLogins = sortedEvents.filter(e => {
    const desc = e.description.toLowerCase();
    const type = e.type.toUpperCase();
    return (
      (desc.includes('successful login') || desc.includes('login successful') || desc.includes('logged in')) &&
      type === 'INFO'
    );
  });

  if (failedLogins.length >= 3 && successfulLogins.length > 0) {
    const lastFailed = failedLogins[failedLogins.length - 1];
    const firstSuccess = successfulLogins[0];
    
    if (new Date(firstSuccess.timestamp) > new Date(lastFailed.timestamp)) {
      const correlatedIds = [
        ...failedLogins.map(e => e.id),
        firstSuccess.id
      ];

      let riskLevel: RiskLevel;
      if (failedLogins.length >= 10) {
        riskLevel = RiskLevel.CRITICAL;
      } else if (failedLogins.length >= 5) {
        riskLevel = RiskLevel.HIGH;
      } else {
        riskLevel = RiskLevel.MEDIUM;
      }

      detections.push({
        isDetected: true,
        threatType: ThreatType.SUSPICIOUS_LOGIN,
        riskLevel,
        description: `User ${userId} successfully logged in after ${failedLogins.length} failed attempts. Possible credential compromise.`,
        metadata: {
          pattern: "FAILED_THEN_SUCCESS",
          failedAttempts: failedLogins.length,
          analysisTime: new Date().toISOString(),
          timespan: {
            firstFailed: failedLogins[0].timestamp.toISOString(),
            lastFailed: lastFailed.timestamp.toISOString(),
            successfulLogin: firstSuccess.timestamp.toISOString()
          }
        },
        correlatedEventIds: correlatedIds
      });
    }
  }

  if (failedLogins.length >= 5 && successfulLogins.length === 0) {
    detections.push({
      isDetected: true,
      threatType: ThreatType.SUSPICIOUS_LOGIN,
      riskLevel: RiskLevel.MEDIUM,
      description: `User ${userId} had ${failedLogins.length} failed login attempts without successful login. Possible brute force attack.`,
      metadata: {
        pattern: "MULTIPLE_FAILED",
        failedAttempts: failedLogins.length,
        analysisTime: new Date().toISOString()
      },
      correlatedEventIds: failedLogins.map(e => e.id)
    });
  }

  return detections;
}

export function isSuspiciousIP(ipAddress: string, knownIPs: string[]): boolean {
  return !knownIPs.includes(ipAddress);
}

export function calculateTimeGap(timestamp1: Date, timestamp2: Date): number {
  return Math.abs(timestamp2.getTime() - timestamp1.getTime());
}
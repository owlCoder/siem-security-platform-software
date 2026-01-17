import { DetectionResult } from "../../Domain/types/DetectionResult";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

/**
 * Koreliše aktivnosti korisnika sa Auth događajima
 * Detektuje sumnjive pattern-e kao što su:
 * - Pristup nakon više neuspešnih pokušaja prijave
 * - Promena dozvola nakon uspešne prijave sa nepoznate IP adrese
 */
export async function correlateAuthEvents(
  userId: string,
  eventIds: number[]
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = [];

  // Ovde bi trebalo fetchovati auth događaje iz Auth mikroservisa
  // i uporediti ih sa ostalim događajima
  
  // Simulacija: detektovanje pristupa nakon failed login-a
  // U realnoj implementaciji bi se ovo radilo kroz API pozive
  
  // Pattern 1: Uspešna prijava nakon više neuspelih pokušaja
  const suspiciousLoginPattern: DetectionResult = {
    isDetected: true,
    threatType: ThreatType.SUSPICIOUS_LOGIN,
    riskLevel: RiskLevel.HIGH,
    description: `User ${userId} successfully logged in after multiple failed attempts. Possible credential compromise.`,
    metadata: {
      pattern: "FAILED_THEN_SUCCESS",
      failedAttempts: 5,
      analysisTime: new Date().toISOString()
    },
    correlatedEventIds: eventIds
  };

  // Pattern 2: Brza promena dozvola nakon prijave
  const rapidPermissionChangePattern: DetectionResult = {
    isDetected: true,
    threatType: ThreatType.PERMISSION_CHANGE,
    riskLevel: RiskLevel.CRITICAL,
    description: `User ${userId} changed permissions immediately after login. Possible account takeover.`,
    metadata: {
      pattern: "LOGIN_THEN_PERMISSION_CHANGE",
      timeGap: "< 5 minutes",
      analysisTime: new Date().toISOString()
    },
    correlatedEventIds: eventIds
  };

  // Vraćamo detektovane pattern-e
  // U realnoj implementaciji bi se ovo dinamički određivalo
  if (eventIds.length > 5) {
    detections.push(suspiciousLoginPattern);
  }

  return detections;
}

/**
 * Proverava da li je IP adresa sumnjiva
 */
export function isSuspiciousIP(ipAddress: string, knownIPs: string[]): boolean {
  return !knownIPs.includes(ipAddress);
}

/**
 * Računa vremenski jaz između dva događaja
 */
export function calculateTimeGap(timestamp1: Date, timestamp2: Date): number {
  return Math.abs(timestamp2.getTime() - timestamp1.getTime());
}
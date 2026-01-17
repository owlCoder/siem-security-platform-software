import { UserRiskProfile } from "../../Domain/models/UserRiskProfile";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

// Težinski faktori za računanje risk score-a
const RISK_WEIGHTS = {
  CRITICAL_THREAT: 40,
  HIGH_THREAT: 25,
  MEDIUM_THREAT: 10,
  LOW_THREAT: 3,
  FAILED_LOGIN: 2,
  TIME_DECAY_FACTOR: 0.95 // Starije pretnje imaju manji uticaj
};

export function calculateRiskScore(profile: UserRiskProfile): number {
  let score = 0;

  // Dodaj poene na osnovu broja pretnji po nivou rizika
  score += profile.criticalThreatsCount * RISK_WEIGHTS.CRITICAL_THREAT;
  score += profile.highThreatsCount * RISK_WEIGHTS.HIGH_THREAT;
  score += profile.mediumThreatsCount * RISK_WEIGHTS.MEDIUM_THREAT;
  score += profile.lowThreatsCount * RISK_WEIGHTS.LOW_THREAT;

  // Dodaj poene za neuspele pokušaje prijave
  score += profile.failedLoginAttempts * RISK_WEIGHTS.FAILED_LOGIN;

  // Ako je korisnik imao nedavne pretnje, povećaj score
  if (profile.lastThreatDetectedAt) {
    const daysSinceLastThreat = Math.floor(
      (Date.now() - new Date(profile.lastThreatDetectedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Ako je pretnja bila u poslednja 3 dana, score dobija bonus
    if (daysSinceLastThreat <= 3) {
      score *= 1.5;
    } else if (daysSinceLastThreat <= 7) {
      score *= 1.2;
    }
  }

  // Bonus za pattern ponašanja (više različitih tipova pretnji)
  const threatTypes = [
    profile.criticalThreatsCount > 0 ? 1 : 0,
    profile.highThreatsCount > 0 ? 1 : 0,
    profile.mediumThreatsCount > 0 ? 1 : 0,
    profile.lowThreatsCount > 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  if (threatTypes >= 3) {
    score *= 1.3; // Multiple threat types = more dangerous pattern
  }

  return Math.round(score);
}

export function determineRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= 100) {
    return RiskLevel.CRITICAL;
  } else if (riskScore >= 60) {
    return RiskLevel.HIGH;
  } else if (riskScore >= 30) {
    return RiskLevel.MEDIUM;
  } else {
    return RiskLevel.LOW;
  }
}

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case RiskLevel.CRITICAL:
      return "#DC2626"; // red-600
    case RiskLevel.HIGH:
      return "#EA580C"; // orange-600
    case RiskLevel.MEDIUM:
      return "#F59E0B"; // amber-500
    case RiskLevel.LOW:
      return "#10B981"; // green-500
    default:
      return "#6B7280"; // gray-500
  }
}
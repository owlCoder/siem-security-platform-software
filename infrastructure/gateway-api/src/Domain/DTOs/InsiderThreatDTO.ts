export interface InsiderThreatDTO {
  id: number;
  userId: string;
  username: string;
  threatType: "MASS_DATA_READ" | "PERMISSION_CHANGE" | "OFF_HOURS_ACCESS" | "SUSPICIOUS_LOGIN" | "DATA_EXFILTRATION";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  metadata: Record<string, any> | null;
  correlatedEventIds: number[];
  ipAddress: string | null;
  source: string;
  detectedAt: Date;
  isResolved: boolean;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
}
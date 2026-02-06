import { DetectionResult } from "../types/DetectionResult";

export interface IThreatDetectionService {
  analyzeEvents(userId: number, eventIds: number[]): Promise<DetectionResult[]>;
  detectMassDataRead(userId: number, eventIds: number[]): Promise<DetectionResult | null>;
  detectPermissionChange(userId: number, eventIds: number[]): Promise<DetectionResult | null>;
  detectOffHoursAccess(userId: number, eventIds: number[]): Promise<DetectionResult | null>;
  correlateWithAuthEvents(userId: number, eventIds: number[]): Promise<DetectionResult[]>;
}
import { RiskEntityType } from "../enums/RiskEntityType";

export interface IRiskScoreService {
  calculateScore(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number>;
  getLatestScore(entityType: RiskEntityType, entityId: string): Promise<number | null>;
  getScoreHistory(entityType: RiskEntityType, entityId: string, hours: number): Promise<{ score: number, createdAt: Date }[]>;
}

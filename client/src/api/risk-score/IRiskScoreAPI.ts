import { RiskEntityType } from "../../enums/RiskEntityType";

export interface IRiskScoreAPI {
    calculateScore(token: string, entityType: RiskEntityType, entityId: string, hours: number): Promise<number>;
    getLatestScore(token: string, entityType: RiskEntityType, entityId: string): Promise<number | null>;
    getScoreHistory(token: string, entityType: RiskEntityType, entityId: string, hours: number): Promise<{score: number, createdAt: Date}[]>;
    getGlobalScore(token: string): Promise<number>;
}
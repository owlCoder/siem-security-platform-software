import { AlertDTO } from "../DTOs/AlertDTO";

export interface IThreatAnalyzerService {
  analyze(eventIds: number[]): Promise<AlertDTO | null>;
}

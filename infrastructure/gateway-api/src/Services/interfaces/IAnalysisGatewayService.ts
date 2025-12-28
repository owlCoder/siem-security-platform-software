import { NormalizedEventDTO } from "../../Domain/DTOs/NormalizedEventDTO";

export interface IAnalysisGatewayService {
  normalize(rawMessage: string): Promise<NormalizedEventDTO>;
  deleteCorrelationsByEventIds(eventIds: number[]): Promise<number>;
}
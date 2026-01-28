import { SecuirtyMaturityCurrentDTO } from "../DTOs/SecurityMaturityCurrentDTO";
import { SecuirtyMaturityIncidentsByCategoryDTO } from "../DTOs/SecurityMaturityIncidentsByCategoryDTO";
import { SecurityMaturityTrendDTO } from "../DTOs/SecurityMaturityTrendDTO";

export interface ISecurityMaturityGatewayService {
  getCurrent(): Promise<SecuirtyMaturityCurrentDTO>;
  getTrend(metric: string, period: string): Promise<SecurityMaturityTrendDTO[]>;
  getIncidentsByCategory(
    period: string,
  ): Promise<SecuirtyMaturityIncidentsByCategoryDTO[]>;
}

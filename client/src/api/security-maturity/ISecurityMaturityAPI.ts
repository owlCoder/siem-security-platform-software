import { SecuirtyMaturityCurrentDTO } from "../../models/security-maturity/SecurityMaturityCurrentDTO";
import { SecuirtyMaturityIncidentsByCategoryDTO } from "../../models/security-maturity/SecurityMaturityIncidentsByCategory";
import { SecurityMaturityRecommendationDTO } from "../../models/security-maturity/SecurityMaturityRecommendationDTO";
import { SecurityMaturityTrendDTO } from "../../models/security-maturity/SecurityMaturityTrendDTO";

export interface ISecurityMaturityAPI {
  getCurrent(token: string): Promise<SecuirtyMaturityCurrentDTO>;

  getTrend(
    token: string,
    metric: string,
    period: string,
  ): Promise<SecurityMaturityTrendDTO[]>;

  getIncidentsByCategory(
    token: string,
    period: string,
  ): Promise<SecuirtyMaturityIncidentsByCategoryDTO[]>;

  getRecommendations(
    token: string,
  ): Promise<SecurityMaturityRecommendationDTO[]>;
}

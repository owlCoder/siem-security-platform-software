import { InsiderThreatDTO } from "../DTOs/InsiderThreatDTO";
import { UserRiskProfileDTO } from "../DTOs/UserRiskProfileDTO";
import { UserRiskAnalysisDTO } from "../DTOs/UserRiskAnalysisDTO";
import { ThreatQueryDTO, PaginatedThreatsDTO } from "../DTOs/ThreatQueryDTO";

export interface IInsiderThreatGatewayService {
  // Threat operations
  getAllThreats(): Promise<InsiderThreatDTO[]>;
  getThreatById(id: number): Promise<InsiderThreatDTO>;
  getThreatsByUserId(userId: string): Promise<InsiderThreatDTO[]>;
  getUnresolvedThreats(): Promise<InsiderThreatDTO[]>;
  searchThreats(query: ThreatQueryDTO): Promise<PaginatedThreatsDTO>;
  resolveThreat(id: number, resolvedBy: string, resolutionNotes?: string): Promise<InsiderThreatDTO>;

  // User risk operations
  getAllUserRiskProfiles(): Promise<UserRiskProfileDTO[]>;
  getHighRiskUsers(): Promise<UserRiskProfileDTO[]>;
  getUserRiskProfile(userId: string): Promise<UserRiskProfileDTO>;
  getUserRiskAnalysis(userId: string): Promise<UserRiskAnalysisDTO>;
  recalculateUserRisk(userId: string): Promise<UserRiskProfileDTO>;
}
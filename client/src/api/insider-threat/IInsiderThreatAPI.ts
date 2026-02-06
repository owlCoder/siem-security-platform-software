import { InsiderThreatDTO } from "../../models/insider-threat/InsiderThreatDTO";
import { PaginatedThreatsDTO, ThreatQueryDTO } from "../../models/insider-threat/ThreatQueryDTO";
import { UserRiskAnalysisDTO } from "../../models/insider-threat/UserRiskAnalysisDTO";
import { UserRiskProfileDTO } from "../../models/insider-threat/UserRiskProfileDTO";

export interface IInsiderThreatAPI {
  getAllThreats(token: string): Promise<InsiderThreatDTO[]>;
  getThreatById(id: number, token: string): Promise<InsiderThreatDTO>;
  getThreatsByUserId(userId: number, token: string): Promise<InsiderThreatDTO[]>;
  getUnresolvedThreats(token: string): Promise<InsiderThreatDTO[]>;
  searchThreats(query: ThreatQueryDTO, token: string): Promise<PaginatedThreatsDTO>;
  resolveThreat(id: number, resolvedBy: string, resolutionNotes: string | undefined, token: string): Promise<InsiderThreatDTO>;

  getAllUserRiskProfiles(token: string): Promise<UserRiskProfileDTO[]>;
  getHighRiskUsers(token: string): Promise<UserRiskProfileDTO[]>;
  getUserRiskProfile(userId: number, token: string): Promise<UserRiskProfileDTO>;
  getUserRiskAnalysis(userId: number, token: string): Promise<UserRiskAnalysisDTO>;
  recalculateUserRisk(userId: number, token: string): Promise<UserRiskProfileDTO>;
}
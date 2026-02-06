import { UserRiskProfile } from "../models/UserRiskProfile";
import { UserRiskAnalysisDTO } from "../DTOs/UserRiskAnalysisDTO";
import { UserRiskProfileDTO } from "../DTOs/UserRiskProfileDTO";

export interface IUserRiskAnalysisService {
  updateUserRiskAfterThreat(userId: number, threatId: number): Promise<UserRiskProfile>;
  getUserRiskAnalysis(userId: number): Promise<UserRiskAnalysisDTO>;
  recalculateUserRisk(userId: number): Promise<UserRiskProfile>;
  getHighRiskUsers(): Promise<UserRiskProfile[]>;
  getAllUserRiskProfiles(): Promise<UserRiskProfileDTO[]>;
  getUserRiskProfile(userId: number): Promise<UserRiskProfileDTO | null>;
}
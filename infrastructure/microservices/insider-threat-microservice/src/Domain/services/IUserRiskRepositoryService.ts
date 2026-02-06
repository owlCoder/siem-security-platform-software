import { UserRiskProfile } from "../models/UserRiskProfile";

export interface IUserRiskRepositoryService {
  create(data: Partial<UserRiskProfile>): Promise<UserRiskProfile>;
  findByUserId(userId: number): Promise<UserRiskProfile | null>;
  update(id: number, data: Partial<UserRiskProfile>): Promise<UserRiskProfile>;
  findHighRiskUsers(): Promise<UserRiskProfile[]>;
  findAll(): Promise<UserRiskProfile[]>;
}
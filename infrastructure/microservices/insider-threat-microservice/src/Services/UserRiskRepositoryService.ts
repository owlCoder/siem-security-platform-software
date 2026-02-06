import { Repository } from "typeorm";
import { IUserRiskRepositoryService } from "../Domain/services/IUserRiskRepositoryService";
import { UserRiskProfile } from "../Domain/models/UserRiskProfile";
import { RiskLevel } from "../Domain/enums/RiskLevel";
import { ILoggerService } from "../Domain/services/ILoggerService";


export class UserRiskRepositoryService implements IUserRiskRepositoryService {
  constructor(
    private readonly repository: Repository<UserRiskProfile>,
    private readonly logger: ILoggerService
  ) {}

  async create(data: Partial<UserRiskProfile>): Promise<UserRiskProfile> {
    const profile = this.repository.create(data);
    return await this.repository.save(profile);
  }

  async findByUserId(userId: number): Promise<UserRiskProfile | null> {
    return await this.repository.findOne({
      where: { userId }
    });
  }

  async update(id: number, data: Partial<UserRiskProfile>): Promise<UserRiskProfile> {
    await this.repository.update(id, data);
    
    const updated = await this.repository.findOne({
      where: { id }
    });
    
    if (!updated) {
      throw new Error(`UserRiskProfile with id ${id} not found after update`);
    }
    
    return updated;
  }

  async findHighRiskUsers(): Promise<UserRiskProfile[]> {
    return await this.repository.find({
      where: [
        { currentRiskLevel: RiskLevel.HIGH },
        { currentRiskLevel: RiskLevel.CRITICAL }
      ],
      order: {
        riskScore: "DESC"
      }
    });
  }

  async findAll(): Promise<UserRiskProfile[]> {
    return await this.repository.find({
      order: {
        riskScore: "DESC"
      }
    });
  }
}
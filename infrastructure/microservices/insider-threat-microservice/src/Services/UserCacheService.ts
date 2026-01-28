import { Repository } from "typeorm";
import { UserCache } from "../Domain/models/UserCache";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IUserCacheService } from "../Domain/services/IUserCacheService";

export class UserCacheService implements IUserCacheService {
  constructor(
    private readonly userCacheRepository: Repository<UserCache>,
    private readonly logger: ILoggerService
  ) {}

  async getUserByUserId(userId: string): Promise<UserCache | null> {
    return await this.userCacheRepository.findOne({ where: { userId } });
  }

  async createOrUpdateUser(
    userId: string,  
    username: string,
    role: number
  ): Promise<UserCache> {
    const existingUser = await this.userCacheRepository.findOne({ where: { userId } });

    if (existingUser) {
      existingUser.username = username;
      existingUser.role = role;
      return await this.userCacheRepository.save(existingUser);
    }

    const newUser = this.userCacheRepository.create({
      userId,  
      username,
      role,
    });

    return await this.userCacheRepository.save(newUser);
  }

  async getUserByUsername(username: string): Promise<UserCache | null> {
    return await this.userCacheRepository.findOne({ where: { username } });
  }

  async getAllPrivilegedUsers(): Promise<UserCache[]> {
    // role 0 = Admin, role 1 = SysAdmin
    return await this.userCacheRepository
      .createQueryBuilder("user_cache")
      .where("user_cache.role IN (:...roles)", { roles: [0, 1] })
      .getMany();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userCacheRepository.delete({ userId });
    return !!result.affected && result.affected > 0;
  }
}
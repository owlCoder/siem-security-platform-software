import { Router, Request, Response } from "express";
import { UserCacheService } from "../../Services/UserCacheService";
import { ILoggerService } from "../../Domain/services/ILoggerService";

export class InternalController {
  private readonly router: Router;

  constructor(
    private readonly userCacheService: UserCacheService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/users/register", this.registerUser.bind(this));
  }


  private async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username, role } = req.body;

      if (!userId || !username || role === undefined) {
        res.status(400).json({
          error: "Missing required fields: userId, username, role"
        });
        return;
      }

      const user = await this.userCacheService.createOrUpdateUser(
        String(userId),  
        username,
        role
      );

      await this.logger.log(`[InternalController] Registered user: ${username} (userId: ${userId}, role: ${role})`);

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      });
    } catch (error: any) {
      await this.logger.log(`[InternalController] Error registering user: ${error.message}`);
      res.status(500).json({
        error: "Failed to register user",
        message: error.message
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
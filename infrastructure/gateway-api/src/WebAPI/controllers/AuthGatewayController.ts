import { Request, Response, Router } from "express";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { OTPVerificationDTO } from "../../Domain/DTOs/OtpVerificationDTO";

export class AuthGatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/login", this.login.bind(this));
    this.router.post("/verify-otp", this.verifyOtp.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    res.status(200).json(result);
  }

  private async verifyOtp(req: Request, res: Response): Promise<void> {
    const data: OTPVerificationDTO = req.body;
    const result = await this.gatewayService.verifyOtp(data);
    res.status(200).json(result);
  }

  public getRouter(): Router {
    return this.router;
  }
}

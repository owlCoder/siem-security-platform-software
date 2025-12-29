import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { OTPVerificationDTO } from "../../Domain/DTOs/OtpVerificationDTO";
import { AuthJwtResponse } from "../../Domain/types/AuthJwtResponse";
import { AuthResponseType } from "../../Domain/types/AuthResponse";

export interface IAuthGatewayService {
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  verifyOtp(data: OTPVerificationDTO): Promise<AuthJwtResponse>;
  validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    isSysAdmin?: boolean;
    error?: string;
  }>;
}
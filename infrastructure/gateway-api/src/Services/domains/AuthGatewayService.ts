import axios, { AxiosInstance } from "axios";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { AuthResponseType } from "../../Domain/types/AuthResponse";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { OTPVerificationDTO } from "../../Domain/DTOs/OtpVerificationDTO";
import { AuthJwtResponse } from "../../Domain/types/AuthJwtResponse";
import { IAuthGatewayService } from "../../Domain/services/IAuthGatewayService";
import { OTPResendDTO } from "../../Domain/DTOs/OTPResendDTO";
import { jwtDecode } from "jwt-decode";

export class AuthGatewayService implements IAuthGatewayService {
  private readonly client: AxiosInstance;
  private readonly siemAuthClient: AxiosInstance;
  private readonly insiderThreatClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.auth,
      ...defaultAxiosClient
    });

    this.siemAuthClient = axios.create({
      baseURL: serviceConfig.siemAuth,
      ...defaultAxiosClient
    });

    this.insiderThreatClient = axios.create({
      baseURL: serviceConfig.insiderThreat,
      ...defaultAxiosClient
    });
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.client.post<AuthResponseType>("/siem/login", data);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        otp_required: false,
        message:
          error?.response?.data?.message ??
          "Unable to login. Please try again later."
      };
    }
  }

  async verifyOtp(data: OTPVerificationDTO): Promise<AuthJwtResponse> {
    try {
      const response = await this.client.post<AuthJwtResponse>("/verify-otp", data);
      
      if (response.data.success && response.data["siem-token"]) {
        await this.registerUserInInsiderThreat(response.data["siem-token"]);
      }
      
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "OTP verification failed. Please try again.";

      return {
        success: false,
        "siem-token": "",
        message,
      };
    }
  }

  async resendOtp(data: OTPResendDTO): Promise<AuthResponseType> {
    try {
      const response = await this.client.post<AuthResponseType>("/resend-otp", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        otp_required: false,
        message:
          error?.response?.data?.message ??
          "Unable to login. Please try again later."
      }
    }
  }

  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    isSysAdmin?: boolean;
    error?: string;
  }> {
    try {
      const response = await this.siemAuthClient.post<{
        success: boolean;
        valid: boolean;
        isSysAdmin: boolean;
        user: { user_id: number; username: string; role: number };
      }>("/auth/validate", { token });

      if (!response.data.success || !response.data.valid) {
        return { valid: false, error: "Token validation failed." };
      }

      return {
        valid: true,
        payload: response.data.user,
        isSysAdmin: response.data.isSysAdmin,
      };
    } catch (error: any) {
      return { valid: false, error: error };
    }
  }


  private async registerUserInInsiderThreat(token: string): Promise<void> {
    try {
      const decoded: any = jwtDecode(token);
      
      if (!decoded || !decoded.id || !decoded.username || decoded.role === undefined) {
        console.log("[AuthGateway] Invalid JWT structure, skipping Insider Threat registration");
        return;
      }

      await this.insiderThreatClient.post("/internal/register-user", {
        userId: decoded.id,
        username: decoded.username,
        role: decoded.role
      });

      console.log(`[AuthGateway]  User ${decoded.username} registered in Insider Threat service`);
    } catch (error: any) {
      console.error(`[AuthGateway]  Failed to register user in Insider Threat: ${error.message}`);
    }
  }
}
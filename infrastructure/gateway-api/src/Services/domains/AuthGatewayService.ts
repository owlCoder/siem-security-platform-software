import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { AuthResponseType } from "../../Domain/types/AuthResponse";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { OTPVerificationDTO } from "../../Domain/DTOs/OtpVerificationDTO";
import { AuthJwtResponse } from "../../Domain/types/AuthJwtResponse";
import { IAuthGatewayService } from "../../Domain/services/IAuthGatewayService";
import { OTPResendDTO } from "../../Domain/DTOs/OTPResendDTO";
import { jwtDecode } from "jwt-decode";

function roleToNumber(role: string | number | undefined): number {
  if (typeof role === "number" && Number.isInteger(role)) return role;
  const s = String(role || "").toLowerCase();
  if (s === "sysadmin" || s === "sys_admin") return 1;
  if (s === "admin") return 0;
  if (s === "analytics_manager") return 2;
  if (s === "animation_worker") return 3;
  if (s === "audio_stagist") return 4;
  if (s === "project_manager") return 5;
  return 0;
}

export class AuthGatewayService implements IAuthGatewayService {
  private readonly client: AxiosInstance;
  private readonly insiderThreatClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.auth,
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
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.log("[AuthGateway] validateToken: JWT_SECRET not set");
      return { valid: false, error: "Server auth configuration error." };
    }
    try {
      const decoded = jwt.verify(token, secret) as Record<string, unknown>;
      const userId = Number(decoded.id ?? decoded.user_id ?? decoded.sub);
      const username = String(decoded.username ?? decoded.name ?? "");
      const role = roleToNumber((decoded.role as string | number) ?? 0);
      if (!userId || !username) {
        return { valid: false, error: "Token missing user id or username." };
      }
      const payload = { user_id: userId, username, role };
      const isSysAdmin = role === 0 || role === 1; // ADMIN or SYS_ADMIN
      return { valid: true, payload, isSysAdmin };
    } catch (error: any) {
      const msg = error?.message ?? String(error);
      if (msg.includes("expired")) {
        return { valid: false, error: "Token expired." };
      }
      if (msg.includes("invalid") || msg.includes("signature")) {
        return { valid: false, error: "Invalid token." };
      }
      return { valid: false, error: msg };
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
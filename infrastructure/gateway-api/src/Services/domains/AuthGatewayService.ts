import axios, { AxiosInstance } from "axios";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { AuthResponseType } from "../../Domain/types/AuthResponse";
import { defaultAxiosClient } from "../../Infrastructure/config/AxiosClient";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { OTPVerificationDTO } from "../../Domain/DTOs/OtpVerificationDTO";
import { AuthJwtResponse } from "../../Domain/types/AuthJwtResponse";
import { IAuthGatewayService } from "../interfaces/IAuthGatewayService";

export class AuthGatewayService implements IAuthGatewayService {
  private readonly client: AxiosInstance;
  private readonly siemAuthClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.auth,
      ...defaultAxiosClient
    });

    this.siemAuthClient = axios.create({
      baseURL: serviceConfig.siemAuth,
      ...defaultAxiosClient
    });
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.client.post<AuthResponseType>("/login", data);
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
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "OTP verification failed. Please try again.";

      return {
        success: false,
        token: "",
        message,
      };
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
}
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { IAuthAPI } from "./IAuthAPI";
import { AuthResponseType } from "../../types/auth/AuthResponseType";
import { OTPVerificationDTO } from "../../models/auth/OtpVerificationDTO";
import { AuthJwtResponseType } from "../../types/auth/AuthJwtResponseType";
import { OtpResendDTO } from "../../models/auth/OtpResendDTO";

export class AuthAPI implements IAuthAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: import.meta.env.VITE_GATEWAY_URL, headers: { "Content-Type": "application/json" } });
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    const response: AxiosResponse = await this.axiosInstance.post("/login", data);

    console.log(response.data);

    return response.data;
  }

  async verifyOtp(data: OTPVerificationDTO): Promise<AuthJwtResponseType> {
    const response: AxiosResponse = await this.axiosInstance.post("/verify-otp", data);

    return response.data;
  }

  async resendOtp(data: OtpResendDTO): Promise<AuthResponseType> {
    const response: AxiosResponse = await this.axiosInstance.post("/resend-otp", data);

    return response.data;
  }

}
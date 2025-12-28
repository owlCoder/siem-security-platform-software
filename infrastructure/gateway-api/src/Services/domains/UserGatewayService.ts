import axios, { AxiosInstance } from "axios";
import { UserDTO } from "../../Domain/DTOs/UserDTO";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { defaultAxiosClient } from "../../Infrastructure/config/AxiosClient";
import { IUserGatewayService } from "../interfaces/IUserGatewayService";

export class UserGatewayService implements IUserGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.user,
      ...defaultAxiosClient
    });
  }

  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.client.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.client.get<UserDTO>(`/users/${id}`);
    return response.data;
  }
}
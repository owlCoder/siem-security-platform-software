import axios, { AxiosInstance } from "axios";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { IIntegrityGatewayService } from "../../Domain/services/IIntegrityGatewayService";

export class IntegrityGatewayService implements IIntegrityGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.integrity, 
    });
  }

  async initializeHashChain() {
    const response = await this.client.post("/integrity/initialize");
    return response.data;
  }

  async verifyLogs() {
    const response = await this.client.get("/integrity/verify");
    return response.data;
  }

  async getCompromisedLogs() {
    const response = await this.client.get("/integrity/compromised");
    return response.data;
  }
}
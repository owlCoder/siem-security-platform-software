import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ISimulatorAPI, SimulationRequestDTO } from "./ISimulatorAPI";
import { SimulationDTO } from "../../models/simulator/SimulationDTO";

export class SimulatorAPI implements ISimulatorAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_FIREWALL_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async startSimulation(payload: SimulationRequestDTO, token: string): Promise<SimulationDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "simulator/start",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: payload,
    });
    return response.data.response;
  }

  async stopSimulation(id: string, token: string): Promise<SimulationDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `simulator/${id}/stop`,
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getSimulation(id: string, token: string): Promise<SimulationDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `simulator/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async listSimulations(token: string): Promise<SimulationDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "simulator",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }
}
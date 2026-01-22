import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IEventAPI } from "./IEventAPI";
import { EventDTO } from "../../models/events/EventDTO";

export class EventAPI implements IEventAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_FIREWALL_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getAllEvents(token: string): Promise<EventDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `query/search`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { q: "" }, // prazan query => Query service vrati sve evente
    });

    return response.data.response;
  }
}
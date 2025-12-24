import axios, { AxiosInstance } from "axios";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { defaultAxiosClient } from "../../Infrastructure/config/AxiosClient";
import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { DistributionDTO } from "../../Domain/DTOs/DistributionDTO";
import { TopSourceDTO } from "../../Domain/DTOs/TopSourceDTO";

export class EventCollectorGatewayService{
    private readonly client: AxiosInstance;
    
      constructor() {
        this.client = axios.create({
          baseURL: serviceConfig.event,
          ...defaultAxiosClient
        });
      }

      async getAllEvents():Promise<EventDTO[]>{
        const response = await this.client.get<EventDTO[]>("/events")

        return response.data
      }

      async getSortedEventsByDate():Promise<EventDTO[]>{
        const response = await this.client.get<EventDTO[]>("/events/sortedEventsByDate")

        return response.data
      }

      async getEventPercentagesByEvent():Promise<DistributionDTO>{
        const response = await this.client.get<DistributionDTO>("/events/percentages")

        return response.data
      }

      async getEventById(id:number):Promise<EventDTO>{
        const response = await this.client.get<EventDTO>(`/events/${id}`)

        return response.data
      }

      async getEventsFromId1ToId2(fromId:number,toId:number):Promise<EventDTO[]>{
        const response = await this.client.get<EventDTO[]>(`/events/from/${fromId}/to/${toId}`)

        return response.data
      }

      async createEvent(event:EventDTO):Promise<EventDTO>{
        const response = await this.client.get<EventDTO>(`/events/${event}`)

        return response.data
      }

      async deleteEvent(id:number):Promise<boolean>{
        const response = await this.client.delete<boolean>(`/events/${id}`)

        return response.data
      }
       async deleteOldEvents(ids:number[]):Promise<boolean>{
        const response = await this.client.delete<boolean>(`/events/old`,{data:ids})

        return response.data
      }

      async getTopSourceEvent():Promise<TopSourceDTO>{
        const response = await this.client.get<TopSourceDTO>("/events/topSource")

        return response.data
      }
    }
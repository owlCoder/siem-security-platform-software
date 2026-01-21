import { EventDTO } from "../../models/events/EventDTO";
import { EventsResultDTO } from "../../models/events/EventsResultDTO";
import { TopSourceDTO } from "../../models/events/TopSourceDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { HourlyStatisticsDTO } from "../../models/query/HourlyStatisticsDTO";

export interface IQueryAPI {
  getAllEvents(token: string): Promise<EventDTO[]>;
  getEventsByQuery(query: string, token: string, targetPage: number, limit: number): Promise<EventsResultDTO>;
  getLastThreeEvents(token: string): Promise<EventDTO[]>;
  getEventsCount(token: string): Promise<number>;
  getInfoCount(token: string): Promise<number>;
  getWarningCount(token: string): Promise<number>;
  getErrorCount(token: string): Promise<number>;
  getTopEventSource(token:string):Promise<TopSourceDTO>;
  //statistics:
  getEventStatistics(token: string): Promise<HourlyStatisticsDTO[]>;
  getAlertStatistics(token: string): Promise<HourlyStatisticsDTO[]>;
  getEventDistribution(token: string): Promise<DistributionDTO>;
  getUniqueServices(token: string): Promise<string[]>;
  getUniqueIps(token: string): Promise<string[]>;
}

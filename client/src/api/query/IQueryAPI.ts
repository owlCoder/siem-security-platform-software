import { EventDTO } from "../../models/events/EventDTO";
import { TopSourceDTO } from "../../models/events/TopSourceDTO";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO";

export interface IQueryAPI {
  getAllEvents(token: string): Promise<EventDTO[]>;
  getEventsByQuery(query: string, token: string): Promise<EventDTO[]>;
  getLastThreeEvents(token: string): Promise<EventDTO[]>;
  getEventsCount(token: string): Promise<number>;
  getInfoCount(token: string): Promise<number>;
  getWarningCount(token: string): Promise<number>;
  getErrorCount(token: string): Promise<number>;
  getTopEventSource(token:string):Promise<TopSourceDTO>;
  //statistics:
  getEventStatistics(token: string): Promise<EventStatisticsDTO[]>;
  getAlertStatistics(token: string): Promise<AlertStatisticsDTO[]>;
  getEventDistribution(token: string): Promise<DistributionDTO>;
}

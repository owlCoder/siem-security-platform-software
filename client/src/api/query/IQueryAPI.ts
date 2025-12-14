import { EventDTO } from "../../models/events/EventDTO";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO";

export interface IQueryAPI {
  getAllEvents(): Promise<EventDTO[]>;
  getEventsByQuery(query: string): Promise<EventDTO[]>;
  getLastThreeEvents(): Promise<EventDTO[]>;
  getEventsCount(): Promise<number>;

  //statistics:
  getEventStatistics(token: string): Promise<EventStatisticsDTO[]>;
  getAlertStatistics(token: string): Promise<AlertStatisticsDTO[]>;
  getEventDistribution(token: string): Promise<DistributionDTO>;
}

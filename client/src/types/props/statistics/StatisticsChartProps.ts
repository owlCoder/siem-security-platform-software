import { AlertStatisticsDTO } from "../../../models/query/AlertStatisticsDTO";
import { EventStatisticsDTO } from "../../../models/query/EventStatisticsDTO";

export interface StatisticsChartProps  {
    eventData: EventStatisticsDTO[];
    alertData: AlertStatisticsDTO[];
}
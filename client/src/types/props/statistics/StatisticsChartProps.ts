import { HourlyStatisticsDTO } from "../../../models/query/HourlyStatisticsDTO";

export interface StatisticsChartProps  {
    eventData: HourlyStatisticsDTO[];
    alertData: HourlyStatisticsDTO[];
}
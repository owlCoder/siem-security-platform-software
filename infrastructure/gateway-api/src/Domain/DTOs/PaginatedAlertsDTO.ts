import { AlertDTO } from "./AlertDTO";

export interface PaginatedAlertsDTO {
  data: AlertDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";
import { AlertDTO } from "./AlertDTO";

export interface AlertQueryDTO {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filtering
  severity?: AlertSeverity;
  status?: AlertStatus;
  startDate?: Date;
  endDate?: Date;
  source?: string;
  
  // Sorting
  sortBy?: 'createdAt' | 'severity' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedAlertsDTO {
  data: AlertDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
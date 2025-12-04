import { AlertDTO } from "./AlertDTO";

export interface AlertQueryDTO {
  page?: number;
  limit?: number;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "DISMISSED" | "ESCALATED";
  startDate?: Date;
  endDate?: Date;
  source?: string;
  sortBy?: 'createdAt' | 'severity' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

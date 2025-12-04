export interface AlertDTO {
  id: number;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "DISMISSED" | "ESCALATED";
  correlatedEvents: number[];
  source: string;
  createdAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
}
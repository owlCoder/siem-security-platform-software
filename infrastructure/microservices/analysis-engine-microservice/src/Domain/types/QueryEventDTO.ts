export interface QueryEventDTO {
  readonly id: number;
  readonly source: string;
  readonly type: string;
  readonly description: string;
  readonly timestamp: string; 
  readonly ipAddress: string;
  readonly userId?: number;
  readonly userRole?: string;
}
export type AlertPayloadDto = {
  id: number;
  createdAt: string;
  resolvedAt: string | null;              
  oldestCorrelatedEventAt: string;        
  category: string;                       
  isFalseAlarm: boolean;
};
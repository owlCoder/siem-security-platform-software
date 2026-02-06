import { Event } from "../../Domain/services/IEventFetcherService";

export interface CollectorEventResponse {
  id: number;
  source: string;
  type: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userId?: number;
  userRole?: string;
}

export function toDomainEvent(e: CollectorEventResponse): Event {
  return {
    id: e.id,
    source: e.source,
    type: e.type,
    description: e.description,
    timestamp: new Date(e.timestamp),
    ipAddress: e.ipAddress ?? "",
    userId: e.userId,
    userRole: e.userRole
  };
}

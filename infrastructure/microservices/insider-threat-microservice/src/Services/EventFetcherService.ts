import axios, { AxiosInstance, formToJSON } from "axios";
import { IEventFetcherService, Event } from "../Domain/services/IEventFetcherService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { CollectorEventResponse, toDomainEvent } from "../Utils/Converters/CollectorEventConverter";


export class EventFetcherService implements IEventFetcherService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly eventCollectorUrl: string,
    private readonly logger: ILoggerService
  ) {
    this.client = axios.create({
      baseURL: eventCollectorUrl,
      timeout: 30000
    });
  }

  async getMaxEventId(): Promise<number> {
    try {
      const { data } =
        await this.client.get<CollectorEventResponse[]>("/events", { timeout: 10000 });

      if (!Array.isArray(data) || data.length === 0) {
        return 0;
      }

      return Math.max(...data.map(e => e.id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await this.logger.log(`[EventFetcher] Failed to get max event ID: ${message}`);
      return 0;
    }
  }

  async getEventsInRange(fromId: number, toId: number): Promise<Event[]> {
    try {
      const { data } =
        await this.client.get<CollectorEventResponse[]>(
          `/events/from/${fromId}/to/${toId}`,
          { timeout: 30000 }
        );

      const arr = Array.isArray(data) ? data : [];
      return arr.map(toDomainEvent);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await this.logger.log(`[EventFetcher] Failed to get events in range: ${message}`);
      return [];
    }
  }

  async fetchEventsByIds(eventIds: number[]): Promise<Event[]> {
    if (eventIds.length === 0) {
      return [];
    }

    try {
      const minId = Math.min(...eventIds);
      const maxId = Math.max(...eventIds);

      const events = await this.getEventsInRange(minId, maxId);
      const idSet = new Set(eventIds);

      return events.filter(e => idSet.has(e.id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await this.logger.log(`[EventFetcher] Failed to fetch events: ${message}`);
      return [];
    }
  }

  async fetchEventsByUserId(userId: number): Promise<Event[]> {
    try {
      const { data } =
        await this.client.get<CollectorEventResponse[]>("/events", { timeout: 10000 });

      const arr = Array.isArray(data) ? data : [];
      return arr
        .filter(e => e.userId === userId)
        .map(toDomainEvent);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await this.logger.log(
        `[EventFetcher] Failed to fetch events for user ${userId}: ${message}`
      );
      return [];
    }
  }
}
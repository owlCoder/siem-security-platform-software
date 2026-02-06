import { DetectionResult } from "../Domain/types/DetectionResult";
import { IThreatDetectionService } from "../Domain/services/IThreatDetectionService";
import { IEventFetcherService } from "../Domain/services/IEventFetcherService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { detectMassDataRead } from "../Utils/Detectors/MassDataReadDetector";
import { detectPermissionChange } from "../Utils/Detectors/PermissionChangeDetector";
import { detectOffHoursAccess } from "../Utils/Detectors/OffHoursAccessDetector";
import { correlateAuthEvents } from "../Utils/Analyzers/AuthEventCorrelator";


export class ThreatDetectionService implements IThreatDetectionService {
  constructor(
    private readonly eventFetcher: IEventFetcherService,
    private readonly logger: ILoggerService
  ) {}

  async analyzeEvents(userId: number, eventIds: number[]): Promise<DetectionResult[]> {
    const events = await this.eventFetcher.fetchEventsByIds(eventIds);

    if (events.length === 0) {
      return [];
    }

    const results: DetectionResult[] = [];

    const authResults = await correlateAuthEvents(userId, events);
    results.push(...authResults);

    const offHours = await detectOffHoursAccess(userId, events);
    if (offHours) {
      results.push(offHours);
    }

    const massRead = await detectMassDataRead(userId, events);
    if (massRead) {
      results.push(massRead);
    }

    const permissionChange = await detectPermissionChange(userId, events);
    if (permissionChange) {
      results.push(permissionChange);
    }

    return results;
  }

  async detectMassDataRead(userId: number, eventIds: number[]): Promise<DetectionResult | null> {
    const events = await this.eventFetcher.fetchEventsByIds(eventIds);
    return await detectMassDataRead(userId, events);
  }

  async detectPermissionChange(userId: number, eventIds: number[]): Promise<DetectionResult | null> {
    const events = await this.eventFetcher.fetchEventsByIds(eventIds);
    return await detectPermissionChange(userId, events);
  }

  async detectOffHoursAccess(userId: number, eventIds: number[]): Promise<DetectionResult | null> {
    const events = await this.eventFetcher.fetchEventsByIds(eventIds);
    return await detectOffHoursAccess(userId, events);
  }

  async correlateWithAuthEvents(userId: number, eventIds: number[]): Promise<DetectionResult[]> {
    const events = await this.eventFetcher.fetchEventsByIds(eventIds);
    return correlateAuthEvents(userId, events);
  }
}
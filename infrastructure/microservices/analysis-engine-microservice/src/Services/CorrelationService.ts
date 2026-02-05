// src/Services/CorrelationService.ts

import { AxiosInstance } from "axios";
import { ICorrelationService } from "../Domain/services/ICorrelationService";
import { ILLMChatAPIService } from "../Domain/services/ILLMChatAPIService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { CorrelationDTO } from "../Domain/types/CorrelationDTO";
import { QueryEventDTO } from "../Domain/types/QueryEventDTO";
import { JsonValue } from "../Domain/types/JsonValue";
import { Result } from "../Domain/types/Result";
import { createAxiosClient } from "../Infrastructure/helpers/axiosClient";
import { CorrelationCandidate } from "../Domain/types/CorrelationCandidate";
import { parseDateMs } from "../Infrastructure/helpers/parseDateMs";
import { safeParseEvents } from "../Infrastructure/helpers/safeParseEvents";

export class CorrelationService implements ICorrelationService {
  private readonly queryClient: AxiosInstance;
  private readonly alertClient: AxiosInstance;

  private readonly queryEventsPath: string;
  private readonly alertPath: string;
  private readonly confidenceThreshold: number;

  public constructor(
    private readonly llmChatApiService: ILLMChatAPIService,
    private readonly loggerService: ILoggerService
  ) {
    this.queryClient = createAxiosClient(process.env.QUERY_SERVICE_API ?? "");
    this.alertClient = createAxiosClient(process.env.ALERT_SERVICE_API ?? "");

    this.queryEventsPath = process.env.QUERY_EVENTS_PATH ?? "/query/recentEvents/1";
    this.alertPath = process.env.ALERT_CORRELATION_PATH ?? "/alerts/correlation";
    this.confidenceThreshold = Number(process.env.CORRELATION_CONFIDENCE_THRESHOLD ?? 0.51);
  }

  public async findCorrelations(): Promise<void> {
    await this.loggerService.info("[CorrelationService] Starting correlation run");

    const eventsJsonRes = await this.fetchEventsJson();
    if (!eventsJsonRes.ok) {
      await this.loggerService.error("[CorrelationService] Failed to fetch events from Query Service", {
        path: this.queryEventsPath,
        error: eventsJsonRes.error,
      });
      return;
    }

    const eventsRes = safeParseEvents(eventsJsonRes.value);
    if (!eventsRes.ok) {
      await this.loggerService.error("[CorrelationService] Failed to parse Query events", {
        error: eventsRes.error,
      });
      return;
    }

    const events = eventsRes.value;
    if (events.length === 0) {
      await this.loggerService.info("[CorrelationService] No events to correlate");
      return;
    }

    const candidatesRes = await this.fetchCandidatesFromLLM(events);
    if (!candidatesRes.ok) {
      await this.loggerService.error("[CorrelationService] Failed to fetch correlation candidates from LLM", {
        error: candidatesRes.error,
      });
      return;
    }

    const candidates = candidatesRes.value;
    if (candidates.length === 0) {
      await this.loggerService.info("[CorrelationService] LLM returned 0 correlation candidates");
      return;
    }

    for (const candidate of candidates) {
      if (!this.passesPolicy(candidate)) continue;

      const dto = this.buildCorrelationDto(candidate, events);
      await this.notifyAlertService(dto);
    }

    await this.loggerService.info("[CorrelationService] Correlation run completed");
  }

  private async fetchEventsJson(): Promise<Result<JsonValue>> {
    try {
      const res = await this.queryClient.get(this.queryEventsPath);
      return { ok: true, value: res.data as JsonValue };
    } catch {
      return { ok: false, error: "query_fetch_failed" };
    }
  }

  private async fetchCandidatesFromLLM(events: QueryEventDTO[]): Promise<Result<CorrelationCandidate[]>> {
    try {
      const payload = JSON.stringify(events, null, 2);
      const candidates = await this.llmChatApiService.sendCorrelationPrompt(payload);
      return { ok: true, value: candidates };
    } catch {
      return { ok: false, error: "llm_failed" };
    }
  }

  private passesPolicy(candidate: CorrelationCandidate): boolean {
    if (!candidate.correlationDetected) return false;
    if (candidate.confidence < this.confidenceThreshold) return false;
    if (candidate.correlatedEventIds.length < 2) return false;
    return true;
  }

  private buildCorrelationDto(candidate: CorrelationCandidate, events: QueryEventDTO[]): CorrelationDTO {
    const now = new Date();

    const oldestRes = this.computeOldestEventTimestamp(candidate.correlatedEventIds, events);
    const oldest = oldestRes.ok ? oldestRes.value : now;

    if (!oldestRes.ok) {
      void this.loggerService.warn("[CorrelationService] Could not compute oldestEventTimestamp; defaulting to now", {
        reason: oldestRes.error,
        correlatedEventIds: candidate.correlatedEventIds,
      });
    }

    const ipAddress = this.resolveIpAddress(candidate.correlatedEventIds, events);
    const { userId, userRole } = this.resolveUserInfo(candidate.correlatedEventIds, events);

    return {
      correlationDetected: candidate.correlationDetected,
      description: candidate.description,
      timestamp: now,
      oldestEventTimestamp: oldest,
      category: candidate.category,
      confidence: candidate.confidence,
      severity: candidate.severity,
      correlatedEventIds: candidate.correlatedEventIds,
      ipAddress,
      userId,
      userRole,
    };
  }

  private resolveIpAddress(eventIds: number[], events: QueryEventDTO[]): string | undefined {
    if (eventIds.length === 0) return undefined;

    const firstId = eventIds[0];

    for (const e of events) {
      if (e.id === firstId) {
        const ip = e.ipAddress.trim();
        return ip.length > 0 ? ip : undefined;
      }
    }

    return undefined;
  }

  private resolveUserInfo(eventIds: number[], events: QueryEventDTO[]): { userId?: number; userRole?: string } {
    if (eventIds.length === 0) return {};

    const firstId = eventIds[0];

    for (const e of events) {
      if (e.id === firstId) {
        return {
          userId: e.userId,
          userRole: e.userRole,
        };
      }
    }

    return {};
  }

  private computeOldestEventTimestamp(eventIds: number[], events: QueryEventDTO[]): Result<Date> {
    if (eventIds.length === 0) return { ok: false, error: "no_correlated_ids" };

    const idSet = new Set<number>(eventIds);

    let found = false;
    let oldestMs: number | null = null;

    for (const e of events) {
      if (!idSet.has(e.id)) continue;
      found = true;

      const msRes = parseDateMs(e.timestamp);
      if (!msRes.ok) continue;

      if (oldestMs === null || msRes.value < oldestMs) oldestMs = msRes.value;
    }

    if (!found) return { ok: false, error: "no_matching_events" };
    if (oldestMs === null) return { ok: false, error: "no_valid_timestamps" };

    return { ok: true, value: new Date(oldestMs) };
  }

  private async notifyAlertService(dto: CorrelationDTO): Promise<void> {
    const body = {
      correlationDetected: dto.correlationDetected,
      description: dto.description,
      timestamp: dto.timestamp.toISOString(),
      oldestEventTimestamp: dto.oldestEventTimestamp.toISOString(),
      category: dto.category,
      confidence: dto.confidence,
      severity: dto.severity,
      correlatedEventIds: dto.correlatedEventIds,
      ipAddress: dto.ipAddress ?? "unknown",
      userId: dto.userId,
      userRole: dto.userRole,
    };

    try {
      await this.alertClient.post(this.alertPath, body);
      await this.loggerService.info("[CorrelationService] Alert Service notified", {
        category: dto.category,
        severity: dto.severity,
      });
    } catch(e) {
      console.error(e);
      await this.loggerService.warn("[CorrelationService] Failed to notify Alert Service", {
        path: this.alertPath,
        category: dto.category,
      });
    }
  }
}

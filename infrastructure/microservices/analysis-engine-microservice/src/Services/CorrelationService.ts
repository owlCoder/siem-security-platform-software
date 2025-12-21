import { In, Repository } from "typeorm";
import axios, { AxiosInstance } from "axios";
import { ICorrelationService } from "../Domain/Services/ICorrelationService";
import { ILLMChatAPIService } from "../Domain/Services/ILLMChatAPIService";
import { Correlation } from "../Domain/models/Correlation";
import { CorrelationEventMap } from "../Domain/models/CorrelationEventMap";
import { CorrelationDTO } from "../Domain/types/CorrelationDTO";

export class CorrelationService implements ICorrelationService {
  private readonly alertClient: AxiosInstance;
  private readonly queryClient: AxiosInstance;

  private readonly confidenceThreshold =
    Number(process.env.CORRELATION_CONFIDENCE_THRESHOLD ?? 0.51);

  private readonly queryEventsPath =
    process.env.QUERY_EVENTS_PATH ?? "/query/oldEvents/1";

  constructor(
    private readonly correlationRepo: Repository<Correlation>,
    private readonly correlationEventMap: Repository<CorrelationEventMap>,
    private readonly llmChatApiService: ILLMChatAPIService
  ) {
    console.log(`[CorrelationService] started`);

    this.queryClient = axios.create({
      baseURL: process.env.QUERY_SERVICE_API,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.alertClient = axios.create({
      baseURL: process.env.ALERT_SERVICE_API,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
  }

  async findCorrelations(): Promise<void> {
    console.log(`[CorrelationService] Finding correlations`);

    // 1. Fetch events (external → untrusted)
    let events: unknown;
    try {
      const res = await this.queryClient.get(this.queryEventsPath);
      events = res.data;
    } catch (err) {
      console.error(`[CorrelationService] Failed to fetch events`, err);
      return;
    }

    // 2. Ask LLM (guaranteed contract)
    let candidates: CorrelationDTO[];
    try {
      candidates = await this.llmChatApiService.sendCorrelationPrompt(
        JSON.stringify(events, null, 2)
      );
    } catch (err) {
      console.error(`[CorrelationService] LLM analysis failed`, err);
      return;
    }

    if (candidates.length === 0) {
      console.log(`[CorrelationService] No correlation candidates returned`);
      return;
    }

    const inputEventIds = this.extractNumericEventIds(events);

    // 3. Apply policy + persist
    for (const candidate of candidates) {
      if (!this.passesPolicy(candidate, inputEventIds)) continue;

      try {
        const correlationId = await this.saveCorrelation(candidate);
        candidate.id = correlationId;

        await this.sendCorrelationAlert(candidate);

        console.log(`[CorrelationService] Correlation stored (ID=${correlationId})`);
      } catch (err) {
        console.error(`[CorrelationService] Failed to process candidate`, err);
      }
    }
  }

  // ------------------------------------------------------------------
  // POLICY VALIDATION (Use-case responsibility)
  // ------------------------------------------------------------------

  private passesPolicy(
    candidate: CorrelationDTO,
    inputEventIds: Set<number>
  ): boolean {
    if (!candidate.correlationDetected) return false;

    if (candidate.confidence < this.confidenceThreshold) return false;

    if (candidate.correlatedEventIds.length < 2) return false;

    if (
      inputEventIds.size > 0 &&
      candidate.correlatedEventIds.some((id) => !inputEventIds.has(id))
    ) {
      return false;
    }

    return true;
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------

  private extractNumericEventIds(events: unknown): Set<number> {
    const ids = new Set<number>();

    if (Array.isArray(events)) {
      for (const e of events) {
        if (e && typeof e === "object" && "id" in e) {
          const v = (e as any).id;
          if (typeof v === "number" && Number.isFinite(v)) {
            ids.add(v);
          }
        }
      }
    }

    return ids;
  }

  // ------------------------------------------------------------------
  // OUTBOUND INTEGRATIONS
  // ------------------------------------------------------------------

  private async sendCorrelationAlert(correlation: CorrelationDTO): Promise<void> {
    await this.alertClient.post("/alerts/correlation", {
      correlationId: correlation.id,
      description: correlation.description,
      severity: correlation.severity,
      correlatedEventIds: correlation.correlatedEventIds,
    });
  }

  private async saveCorrelation(dto: CorrelationDTO): Promise<number> {
    const correlation = this.correlationRepo.create({
      description: dto.description,
      timestamp: dto.timestamp,
      isAlert: dto.correlationDetected,
    });

    const saved = await this.correlationRepo.save(correlation);

    const maps = dto.correlatedEventIds.map((eventId) =>
      this.correlationEventMap.create({
        correlation_id: saved.id,
        event_id: eventId,
      })
    );

    await this.correlationEventMap.save(maps);

    return saved.id;
  }

  async deleteCorrelationsByEventIds(eventIds: number[]): Promise<number> {
    if (eventIds.length === 0) return 0;

    const maps = await this.correlationEventMap.find({
      where: { event_id: In(eventIds) },
    });

    const ids = [...new Set(maps.map((m) => m.correlation_id))];

    if (ids.length === 0) return 0;

    //using manager transaction to ensure consistency(delete from both tables or none)
    await this.correlationRepo.manager.transaction(async manager => {
        await manager.delete(
            CorrelationEventMap,
            { correlation_id: In(ids) }
        );

        await manager.delete(
            Correlation,
            { id: In(ids) }
        );
    });

    return ids.length;
  }
}

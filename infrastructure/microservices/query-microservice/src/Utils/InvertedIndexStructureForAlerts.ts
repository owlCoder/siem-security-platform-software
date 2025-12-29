import { Alert } from "../Domain/models/Alert";
import { QueryAlertRepositoryService } from "../Services/QueryAlertRepositoryService";
import { tokenize } from "./EventToTokensParser";
import { loadQueryAlertState } from "./StateAlertManager";

export class InvertedIndexStructureForAlerts {
  private invertedIndex: Map<string, Set<number>> = new Map();
  private alertIdToTokens: Map<number, string[]> = new Map();
  private lastProcessedId: number = 0;
  private alertCount: number = 0;

  private indexingInProgress: boolean = false;

  constructor(
    private readonly queryAlertRepositoryService: QueryAlertRepositoryService
  ) {
    const savedState = loadQueryAlertState();
    this.lastProcessedId = savedState.lastProcessedId;
    this.invertedIndex = savedState.invertedIndex;
    this.alertIdToTokens = savedState.alertTokenMap;
    this.alertCount = savedState.alertCount;

    if (
      this.invertedIndex.size === 0 ||
      this.alertIdToTokens.size === 0 ||
      this.lastProcessedId === 0 ||
      this.alertCount === 0
    ) {
      // pravi indeks od nule
      this.bootstrapIndex();
    }

    this.startIndexingWorker();
  }

  public startIndexingWorker(intervalMs: number = 10000): void {
    setInterval(async () => {
      if (this.indexingInProgress) return;
      this.indexingInProgress = true;

      try {
        const maxId = await this.queryAlertRepositoryService.getMaxId();
        if (maxId === 0) {
          this.indexingInProgress = false;
          return;
        }

        if (maxId > this.lastProcessedId) {
          const newEvents =
            await this.queryAlertRepositoryService.getAlertsFromId1ToId2(
              this.lastProcessedId + 1,
              maxId
            );

          newEvents.forEach((alert) => this.addAlertToIndex(alert));

          this.lastProcessedId = maxId;
          //this.loggerService.log(`Indexed ${newEvents.length} new events up to id ${maxId}`);
        }
      } catch (err) {
        //this.loggerService.log(`Indexing worker error: ${err}`);
      } finally {
        this.indexingInProgress = false;
      }
    }, intervalMs);
  }

  private async bootstrapIndex(): Promise<void> {
    const allAlerts = await this.queryAlertRepositoryService.getAllAlerts();

    if (allAlerts.length === 0) return;

    allAlerts.forEach((alert) => this.addAlertToIndex(alert));

    this.lastProcessedId = Math.max(...allAlerts.map((e) => e.id));
  }

  public addAlertToIndex(alert: Alert): void {
    const tokens = [
      ...tokenize(alert.title),
      ...tokenize(alert.description),
      ...tokenize(alert.severity),
      ...tokenize(alert.status),
      ...tokenize(alert.source),
    ];

    this.alertIdToTokens.set(alert.id, tokens);

    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(alert.id);
    }

    this.lastProcessedId = alert.id;
    this.alertCount += 1;
  }

  public removeAlertFromIndex(alertId: number): void {
    const tokens = this.alertIdToTokens.get(alertId);
    if (!tokens) return;

    for (const token of tokens) {
      const idSet = this.invertedIndex.get(token);
      if (idSet) {
        idSet.delete(alertId);
        if (idSet.size === 0) {
          this.invertedIndex.delete(token);
        }
      }
    }
    this.alertIdToTokens.delete(alertId);
  }

  public getIdsForTokens(query: string): Set<number> {
    const tokens = tokenize(query);
    const resultIds: Set<number> = new Set();

    for (const token of tokens) {
      const trimmedToken = token.trim().toLowerCase();
      const ids = this.invertedIndex.get(trimmedToken);
      if (ids) {
        ids.forEach((id) => resultIds.add(id));
      }
    }
    return resultIds;
  }

  public getInvertedIndex(): Map<string, Set<number>> {
    return this.invertedIndex;
  }

  public getAlertIdToTokens(): Map<number, string[]> {
    return this.alertIdToTokens;
  }

  public getLastProcessedId(): number {
    return this.lastProcessedId;
  }

  public isIndexingInProgress(): boolean {
    return this.indexingInProgress;
  }

  public getAlertsCount(): number {
    return this.alertCount;
  }
}

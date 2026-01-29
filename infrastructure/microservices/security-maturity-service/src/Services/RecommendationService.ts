import { IRecommendationService } from "../Domain/services/IRecommendationService";
import { IRecommendationRepositoryService } from "../Domain/services/IRecommendationRepositoryService";
import { Recommendation } from "../Domain/types/Recommendation";
import { RecommendationSnapshot } from "../Domain/types/RecommendationSnapshot";
import { AnalysisEngineClient } from "../Infrastructure/clients/AnalysisEngineClient";
import { IRecommendationContextService } from "../Domain/services/IRecommendaitonContextService";

export class RecommendationService implements IRecommendationService {
  private static readonly CACHE_VALIDITY_MS: number = 24 * 60 * 60 * 1000;
  private readonly recommendationRepositoryService: IRecommendationRepositoryService;
    private readonly analysisEngineClient: AnalysisEngineClient;
    private readonly recommendationContextService: IRecommendationContextService;
  constructor(
     recommendationRepositoryService: IRecommendationRepositoryService,
     analysisEngineClient: AnalysisEngineClient,
      recommendationContextService: IRecommendationContextService
  ) {
    this.recommendationRepositoryService = recommendationRepositoryService;
    this.analysisEngineClient = analysisEngineClient;
    this.recommendationContextService = recommendationContextService;
  }

  public async getRecommendations(): Promise<Recommendation[]> {
    try {
      const snapshot: RecommendationSnapshot =
        await this.recommendationRepositoryService.getLatestSnapshot();

      if (snapshot.id === -1 || this.isCacheExpired(snapshot)) {
        return await this.regenerateAndPersist();
      }

      return await this.fetchSnapshotRecommendations(snapshot);
    } catch (e) {
      console.error("[RecommendationService] Failed.", String(e));
      return [];
    }
  }

  private async fetchSnapshotRecommendations(snapshot: RecommendationSnapshot): Promise<Recommendation[]> {
    try {
      if (!Array.isArray(snapshot.recommendationIds) || snapshot.recommendationIds.length === 0) {
        return [];
      }

      const recs = await this.recommendationRepositoryService.getRecommendationsByIds(
        snapshot.recommendationIds
      );

      return Array.isArray(recs) ? recs : [];
    } catch (e) {
      console.error("[RecommendationService] Fetch by ids failed.", String(e));
      return [];
    }
  }

  private async regenerateAndPersist(): Promise<Recommendation[]> {
    try {

      const{fromUtc, toUtc} = await this.resolveRecommendationWindowUtc();
      const context = await this.recommendationContextService.buildContext(fromUtc, toUtc);
      if(context.series.length ===0){
        console.error("[RecommendationService] Recommendation context is empty, cannot generate recommendations.");
        return [];
      }
      const recommendations: Recommendation[] = await this.analysisEngineClient.fetchRecommendations(context);

      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        console.error("[RecommendationService] Analysis-engine returned no recommendations.");
        return [];
      }

      const ids: number[] = await this.recommendationRepositoryService.saveRecommendations(recommendations);

      if (!Array.isArray(ids) || ids.length === 0) {
        console.error("[RecommendationService] Failed to persist recommendations.");
        return [];
      }

      const snapshot: RecommendationSnapshot = {
        id: -1,
        generatedAtUtc: new Date(),
        recommendationIds: ids
      };

      await this.recommendationRepositoryService.saveSnapshot(snapshot);

      
      return recommendations;
    } catch (e) {
      console.error("[RecommendationService] Regeneration failed.", String(e));
      return [];
    }
  }

  private isCacheExpired(snapshot: RecommendationSnapshot): boolean {
    const nowMs = Date.now();
    const generatedMs = snapshot.generatedAtUtc.getTime();
    return nowMs - generatedMs >= RecommendationService.CACHE_VALIDITY_MS;
  }
  private resolveRecommendationWindowUtc(): { fromUtc: Date; toUtc: Date } {
    const now = new Date();

    const toUtc = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0, 0, 0
    ));

    const fromUtc = new Date(toUtc.getTime() - 24 * 60 * 60 * 1000);

    return { fromUtc, toUtc };
  }
}

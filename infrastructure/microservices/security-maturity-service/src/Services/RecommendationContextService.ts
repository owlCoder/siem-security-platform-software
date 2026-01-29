import { IRecommendationContextService } from "../Domain/services/IRecommendaitonContextService";
import { RecommendationContextDto } from "../Domain/types/recommendationContext/RecommendationContext";
import { RecommendationContextWindowDto } from "../Domain/types/recommendationContext/RecommendationContextWindowDto";
import { TrendPeriod } from "../Domain/enums/TrendPeriod";
import { MaturityLevel } from "../Domain/enums/MaturityLevel";
import { IRecommendationContextQuery } from "../Application/contracts/IRecommendationContextQuery";

export class RecommendationContextService implements IRecommendationContextService {
  private readonly query: IRecommendationContextQuery;

  public constructor(query: IRecommendationContextQuery) {
    this.query = query;
  }

  public async buildContext(fromUtc: Date, toUtc: Date): Promise<RecommendationContextDto> {
    const fallback: RecommendationContextDto = {
      window: { fromUtc: fromUtc.toISOString(), toUtc: toUtc.toISOString() },
      latest: {
        mttd_minutes: -1,
        mttr_minutes: -1,
        false_alarm_rate: -1,
        score_value: -1,
        maturity_level: MaturityLevel.UNKNOWN
      },
      avg7d: {
        mttd_minutes: -1,
        mttr_minutes: -1,
        false_alarm_rate: -1,
        total_alerts: -1
      },
      series: [],
      incidentsByCategory7d: []
    };

    try {
      const window: RecommendationContextWindowDto = {
        fromUtc: fromUtc.toISOString(),
        toUtc: toUtc.toISOString()
      };

      const latest = await this.query.getLatest(fromUtc, toUtc);
      const avg7d = await this.query.getAvg(TrendPeriod.D7);
      const series = await this.query.getSeries(TrendPeriod.D7);
      const incidentsByCategory7d = await this.query.getIncidentsByCategory(TrendPeriod.D7);

      return { window, latest, avg7d, series, incidentsByCategory7d };
    } catch {
      return fallback;
    }
  }
}

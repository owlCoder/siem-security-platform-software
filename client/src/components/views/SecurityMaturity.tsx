import { useEffect, useState } from "react";
import { SecurityMaturityProps } from "../../types/props/security-maturity/SecurityMaturityProps";
import { SecuirtyMaturityCurrentDTO } from "../../models/security-maturity/SecurityMaturityCurrentDTO";
import MaturityScoreGauge from "../security-maturity/MaturityScoreGauge";
import MaturityKpiGrid from "../security-maturity/MaturityKpiGrid";
import { SecurityMaturityTrendDTO } from "../../models/security-maturity/SecurityMaturityTrendDTO";
import SecurityMaturityTrend from "../security-maturity/SecurityMaturityTrend";
import IncidentsByCategoryChart from "../security-maturity/IncidentsByCategoryChart";
import { AlertCategory } from "../../enums/AlertCategory";
import { useAuth } from "../../hooks/useAuthHook";
import RecommendationCard from "../security-maturity/RecommendationCard";
import { TrendMetricType } from "../../enums/TrendMetricType";
import { SecurityMaturityRecommendationDTO } from "../../models/security-maturity/SecurityMaturityRecommendationDTO";

export default function SecurityMaturity({
  securityMaturityApi
}: SecurityMaturityProps) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<SecuirtyMaturityCurrentDTO | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [, setIsUpdatingTrends] = useState(false);
  const [trends, setTrends] = useState<Partial<Record<TrendMetricType, SecurityMaturityTrendDTO[]>>>({});
  const [period, setPeriod] = useState<"24h" | "7d">("7d");
  const [recommendations, setRecommendations] = useState<SecurityMaturityRecommendationDTO[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if(!summary){
        setIsInitialLoading(true);
      } else{
        setIsUpdatingTrends(true);
      }

      try{
        const res = await securityMaturityApi.getCurrent(token!);
        setSummary(res);

        const metrics: TrendMetricType[] = [
          TrendMetricType.MTTD,
          TrendMetricType.MTTR,
          TrendMetricType.SMS,
          TrendMetricType.FALSE_ALARM_RATE,
        ];

        const results = await Promise.all(
          metrics.map((metric) =>
            securityMaturityApi.getTrend(token!, metric, period))
        );

        const trendMap: Partial<Record<TrendMetricType, SecurityMaturityTrendDTO[]>> = {};

        metrics.forEach((metric, index) => {
          trendMap[metric] = results[index];
        });

        setTrends(trendMap);

        const recs = await securityMaturityApi.getRecommendations(token!);
        setRecommendations(recs);

      } catch(err){
          console.error("Security Maturity fetch failed", err);
      } finally{
          setIsInitialLoading(false);
          setIsUpdatingTrends(false);
      }
    }

    fetchData();
  }, [token, securityMaturityApi, period]);

  if (isInitialLoading) {
    return (
      <div className="bg-transparent border-2 border-solid rounded-[14px] border-[#282A28] p-6">
        Loading security maturity...
      </div> 
    );
  }

  if (!summary) {
    return (
      <div className="bg-transparent border-2 border-solid rounded-[14px] border-[#282A28] p-6">
        No security data
      </div>
    );
  }

  const incidentsByCategory = Object.entries(summary.categoryCounts).map(
    ([category, count]) => ({
      category: category as AlertCategory,
      count
    })
  );

  return (
    <div className="bg-transparent border-2 border-solid rounded-[14px] border-[#282A28]">
      <h2 className="mt-[3px]! p-[5px]! m-[10px]!">Security Maturity</h2>
      <div className="p-6 p-[10px]! space-y-5">

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
              <MaturityScoreGauge score={summary.scoreValue} level={summary.maturityLevel} />
            </div>
          </div>

          <div className="flex flex-col items-center rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
            <MaturityKpiGrid data={summary} />
          </div>
        </div>

        <div className="mt-5! grid grid-cols-2 gap-5">
          <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6 h-full pt-4 pb-4">
            <SecurityMaturityTrend data={trends} period={period} onPeriodChange={setPeriod} />
          </div>

          <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6 h-full pt-4 pb-4">
            <IncidentsByCategoryChart data={incidentsByCategory} />
          </div>
        </div>

        <div className="mt-5! text-center rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
          <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4! mt-5!">
            Security Improvement Recommendations
          </h3>

          {recommendations.length==0 ? (
            <div className="text-gray-500 text-sm">
              No recommendations available
            </div>
          ): (
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
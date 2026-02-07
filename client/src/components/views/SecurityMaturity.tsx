import { useEffect, useState } from "react";
import { SecurityMaturityProps } from "../../types/props/security-maturity/SecurityMaturityProps";
import { SecuirtyMaturityCurrentDTO } from "../../models/security-maturity/SecurityMaturityCurrentDTO";
import { MaturityLevel } from "../../enums/MaturityLevel";
import MaturityScoreGauge from "../security-maturity/MaturityScoreGauge";
import MaturityKpiGrid from "../security-maturity/MaturityKpiGrid";
import { SecurityMaturityTrendDTO } from "../../models/security-maturity/SecurityMaturityTrendDTO";
import SecurityMaturityTrend from "../security-maturity/SecurityMaturityTrend";
import IncidentsByCategoryChart from "../security-maturity/IncidentsByCategoryChart";
import { AlertCategory } from "../../enums/AlertCategory";
import { useAuth } from "../../hooks/useAuthHook";
import { RecommendationPriority, SecurityMaturityRecommendationDTO } from "../../models/security-maturity/SecurityMaturityRecommendationDTO";
import RecommendationCard from "../security-maturity/RecommendationCard";
import { TrendMetricType } from "../../enums/TrendMetricType";

const testSecurityMaturity: SecuirtyMaturityCurrentDTO = {
  scoreValue: 72,
  maturityLevel: MaturityLevel.DEFINED,
  mttdMinutes: 18,
  mttrMinutes: 55,
  falseAlarmRate: 0.12,
  totalAlerts: 342,
  resolvedAlerts: 310,
  openAlerts: 32,
  categoryCounts: {
    DDOS: 120,
    MALWARE: 80,
    PHISHING: 64,
    BRUTE_FORCE: 42,
    OTHER: 36
  }
};
const testTrends: Partial<Record<TrendMetricType, SecurityMaturityTrendDTO[]>> = {
  [TrendMetricType.MTTD]: [
    { bucketStart: "2024-01-01", value: 25, sampleCount: 120 },
    { bucketStart: "2024-02-01", value: 22, sampleCount: 140 },
    { bucketStart: "2024-03-01", value: 20, sampleCount: 160 },
    { bucketStart: "2024-04-01", value: 18, sampleCount: 180 },
    { bucketStart: "2024-05-01", value: 16, sampleCount: 200 },
    { bucketStart: "2024-06-01", value: 19, sampleCount: 180 },
    { bucketStart: "2024-07-01", value: 23, sampleCount: 160 },
    { bucketStart: "2024-08-01", value: 18, sampleCount: 140 },
    { bucketStart: "2024-09-01", value: 15, sampleCount: 150 },
    { bucketStart: "2024-10-01", value: 14, sampleCount: 170 },
  ],

  [TrendMetricType.MTTR]: [
    { bucketStart: "2024-01-01", value: 90, sampleCount: 120 },
    { bucketStart: "2024-02-01", value: 82, sampleCount: 140 },
    { bucketStart: "2024-03-01", value: 75, sampleCount: 160 },
    { bucketStart: "2024-04-01", value: 68, sampleCount: 180 },
    { bucketStart: "2024-05-01", value: 60, sampleCount: 200 },
    { bucketStart: "2024-06-01", value: 55, sampleCount: 190 },
    { bucketStart: "2024-07-01", value: 50, sampleCount: 175 },
    { bucketStart: "2024-08-01", value: 48, sampleCount: 160 },
    { bucketStart: "2024-09-01", value: 42, sampleCount: 155 },
    { bucketStart: "2024-10-01", value: 38, sampleCount: 165 },
  ],

  [TrendMetricType.SMS]: [
    { bucketStart: "2024-01-01", value: 55, sampleCount: 120 },
    { bucketStart: "2024-02-01", value: 60, sampleCount: 140 },
    { bucketStart: "2024-03-01", value: 65, sampleCount: 160 },
    { bucketStart: "2024-04-01", value: 70, sampleCount: 180 },
    { bucketStart: "2024-05-01", value: 75, sampleCount: 200 },
    { bucketStart: "2024-06-01", value: 78, sampleCount: 210 },
    { bucketStart: "2024-07-01", value: 82, sampleCount: 220 },
    { bucketStart: "2024-08-01", value: 85, sampleCount: 205 },
    { bucketStart: "2024-09-01", value: 88, sampleCount: 195 },
    { bucketStart: "2024-10-01", value: 92, sampleCount: 215 },
  ],

  [TrendMetricType.FALSE_ALARM_RATE]: [
    { bucketStart: "2024-01-01", value: 0.25, sampleCount: 120 },
    { bucketStart: "2024-02-01", value: 0.22, sampleCount: 140 },
    { bucketStart: "2024-03-01", value: 0.18, sampleCount: 160 },
    { bucketStart: "2024-04-01", value: 0.15, sampleCount: 180 },
    { bucketStart: "2024-05-01", value: 0.12, sampleCount: 200 },
    { bucketStart: "2024-06-01", value: 0.11, sampleCount: 210 },
    { bucketStart: "2024-07-01", value: 0.10, sampleCount: 190 },
    { bucketStart: "2024-08-01", value: 0.09, sampleCount: 170 },
    { bucketStart: "2024-09-01", value: 0.08, sampleCount: 160 },
    { bucketStart: "2024-10-01", value: 0.07, sampleCount: 150 },
  ],
};

const testRecommendations: SecurityMaturityRecommendationDTO[] = [
  {
    id: "rec-1",
    title: "Enable centralized log correlation",
    description:
      "Implement cross-source log correlation to reduce MTTD and improve incident visibility across services.",
    priority: RecommendationPriority.CRITICAL,
    targetMaturityLevel: MaturityLevel.MANAGED,
  },
  {
    id: "rec-2",
    title: "Reduce false positives",
    description:
      "Tune detection rules and suppress noisy alerts to lower false alarm rate.",
    priority: RecommendationPriority.HIGH,
    targetMaturityLevel: MaturityLevel.DEFINED,
  },
  {
    id: "rec-3",
    title: "Improve incident response playbooks",
    description:
      "Document and automate response playbooks for recurring attack categories.",
    priority: RecommendationPriority.MEDIUM,
    targetMaturityLevel: MaturityLevel.QUANTITATIVELY_MANAGED,
  },
  {
    id: "rec-4",
    title: "Periodic detection rule review",
    description:
      "Schedule quarterly reviews of detection rules to maintain relevance.",
    priority: RecommendationPriority.LOW,
  },
];


export default function SecurityMaturity({
  securityMaturityApi
}: SecurityMaturityProps) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<SecuirtyMaturityCurrentDTO | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdatingTrends, setIsUpdatingTrends] = useState(false);
  const [trends, setTrends] = useState<Partial<Record<TrendMetricType, SecurityMaturityTrendDTO[]>>>({});
  const [period, setPeriod] = useState<"24h" | "7d">("7d");

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
      } catch(err){
          console.error("Security Maturity fetch failed", err);
          
          setSummary(testSecurityMaturity);
          if(period == "24h"){
            const mock24h = Object.keys(testTrends).reduce((acc, key) => {
              const k = key as TrendMetricType;
              acc[k] = testTrends[k]?.slice(-2).map(p => ({...p, bucketStart: p.bucketStart}));
              return acc;
            }, {} as any);
            setTrends(mock24h);
          } else{
            setTrends(testTrends);
          }
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
          <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
            Security Improvement Recommendations
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {testRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}